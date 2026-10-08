# Genera las imagenes de dos colores del sitio a partir de art\ con ImageMagick.
# Misma receta que athanor\scripts\make-splash.ps1: se trabaja a mitad de resolucion y se duplica
# con filtro point para que el pixel quede de 2x2.
# Requiere: winget install ImageMagick.ImageMagick
#   .\scripts\make-plates.ps1
param(
    [string]$Art = (Join-Path $PSScriptRoot '..\art'),
    [string]$Out = (Join-Path $PSScriptRoot '..\src\assets'),
    [string]$Dark = '#1C1B19',
    [string]$Light = '#BAA67F',
    # Grabados de linea que quedan mejor con corte duro que con tramado
    [string[]]$Hard = @('dore-satan-despair', 'dore-satan-falls', 'dore-satan-profile'),
    # Imagenes de fondo claro que se invierten para que el fondo se funda con la pagina
    [string[]]$Negate = @('michelangelo-adam-hands')
)
$ErrorActionPreference = 'Stop'
$plates = Join-Path $Out 'plates'; $projects = Join-Path $Out 'projects'
New-Item -ItemType Directory -Force $plates, $projects | Out-Null

$palette = Join-Path $env:TEMP 'athanor-bw.png'
magick xc:black xc:white +append $palette

# El color oscuro sale transparente: el PNG se apoya sobre cualquier superficie de la pagina.
$tint = '+level-colors', "$Dark,$Light", '-transparent', $Dark, '-filter', 'point', '-resize', '200%', '-strip'

function Convert-Plate([string]$src, [string]$dst, [string]$size, [string]$gravity = 'center') {
    $name = [IO.Path]::GetFileNameWithoutExtension($src)
    $fit = '-shave', '2%x2%', '-colorspace', 'gray', '-resize', "$size^", '-gravity', $gravity, '-extent', $size
    if ($name -in $Negate) {
        magick $src -alpha off @fit -auto-level -negate -level '25%,85%' -dither FloydSteinberg -remap $palette -colorspace gray @tint $dst
    } elseif ($name -in $Hard) {
        magick $src @fit -sigmoidal-contrast 4x50% -dither FloydSteinberg -monochrome @tint $dst
    } else {
        magick $src @fit -auto-level -sigmoidal-contrast 3x50% -dither FloydSteinberg -remap $palette -colorspace gray @tint $dst
    }
}

# Grabados del hero y del cierre: 256x320 logicos, 512x640 finales
Get-ChildItem (Join-Path $Art 'plates') -File | Where-Object Extension -in '.jpg', '.jpeg', '.png' | ForEach-Object {
    Convert-Plate $_.FullName (Join-Path $plates ($_.BaseName + '.png')) '256x320'
}

# Franja apaisada para la seccion de skills: 512x192 logicos, 1024x384 finales
Convert-Plate (Join-Path $Art 'plates\michelangelo-adam-hands.jpg') (Join-Path $plates 'michelangelo-adam-hands-wide.png') '512x192'

# Secuencia de la seccion de skills: un vuelo de camara alrededor de las manos que termina en el grabado.
# Los cuadros del vuelo salen de art\hands-flight (scripts\capture-hands-flight.mjs); se pasan a
# negativo dentro de la silueta, como la placa, y se traman. Los ultimos cuadros disuelven el vuelo en
# la placa, pixel a pixel, desde las yemas hacia afuera. Todo se apila en una tira vertical de
# 512 x (192 x cuadros), en pixeles logicos: el sitio la muestra al doble. El ultimo cuadro es la placa.
function Convert-HandsStrip([string]$flight, [string]$plate, [string]$dst, [int]$dissolve = 12) {
    $tmp = Join-Path $env:TEMP 'athanor-hands'
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force $tmp | Out-Null

    $cells = @(Get-ChildItem $flight -Filter '*.jpg' | Sort-Object Name | ForEach-Object {
        $cell = Join-Path $tmp "flight-$($_.BaseName).png"
        magick $_.FullName -alpha off -colorspace gray -resize 512x192 `
            '(' +clone -threshold '4%' -blur 0x0.6 ')' '(' -clone 0 -level '4%,58%' -negate -level '20%,92%' ')' `
            -delete 0 -compose multiply -composite -dither FloydSteinberg -remap $palette -colorspace gray $cell
        $cell
    })
    $last = $cells[-1]

    # La placa en pixeles logicos, y el orden en que cada pixel pasa del vuelo a la placa
    $still = Join-Path $tmp 'plate.png'; $order = Join-Path $tmp 'order.png'
    magick $plate -alpha extract -filter point -resize '50%' $still
    magick -size 512x192 -seed 7 xc: +noise Random -colorspace gray -fx '(u+abs(i/w-0.5)*2)/2' $order
    foreach ($k in 1..$dissolve) {
        $cell = Join-Path $tmp ('dissolve-{0:d2}.png' -f $k)
        $share = (100.0 * $k / $dissolve).ToString('0.##', [cultureinfo]::InvariantCulture)
        magick $last $still '(' $order -threshold "$share%" -negate ')' -composite $cell
        $cells += $cell
    }
    magick @cells -append +level-colors "$Dark,$Light" -transparent $Dark -strip $dst
}
Convert-HandsStrip (Join-Path $Art 'hands-flight') (Join-Path $plates 'michelangelo-adam-hands-wide.png') (Join-Path $plates 'michelangelo-adam-hands-strip.png')

# Capturas de proyectos: 320x200 logicos, 640x400 finales. Una version tramada y la original en color
# con el mismo recorte, para que al "revelar" la placa coincidan pixel a pixel.
# Las capturas de escritorio se recortan desde arriba; la de celular (pong), desde el centro.
Get-ChildItem (Join-Path $Art 'screens') -File | ForEach-Object {
    $gravity = if ($_.BaseName -eq 'pong') { 'center' } else { 'north' }
    $crop = '-resize', '320x200^', '-gravity', $gravity, '-extent', '320x200'
    # Las interfaces claras se invierten: el fondo queda oscuro y la tinta es el contenido.
    $mean = [double](magick $_.FullName -alpha off -colorspace gray -format '%[fx:mean]' info:)
    # Las oscuras se aclaran con gamma para que el tramado no se coma el detalle tenue.
    $tone = if ($mean -gt 0.5) { '-negate', '-level', '12%,70%' } else { '-gamma', '1.8', '-level', '22%,78%' }
    magick $_.FullName -alpha off -colorspace gray @crop -auto-level @tone -dither FloydSteinberg `
        -remap $palette -colorspace gray @tint (Join-Path $projects ($_.BaseName + '-dither.png'))
    magick $_.FullName -alpha off -resize '640x400^' -gravity $gravity -extent '640x400' -strip -quality 82 `
        (Join-Path $projects ($_.BaseName + '-color.webp'))
}
