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

# Secuencia de la seccion de skills: las dos manos giran en profundidad y se juntan con el scroll.
# Cada cuadro se deforma en gris y se trama despues, asi el tramado queda nitido en todos.
# Los cuadros se apilan en una tira vertical de 1024 x (384 x cuadros); el ultimo es la placa en reposo.
function Convert-HandsStrip([string]$src, [string]$dst, [int]$frames = 16) {
    $w = 512; $h = 192
    $split = 257   # columna vacia entre las dos yemas
    $focal = 600   # distancia de la camara, en pixeles logicos
    $tmp = Join-Path $env:TEMP 'athanor-hands'
    New-Item -ItemType Directory -Force $tmp | Out-Null
    $tone = Join-Path $tmp 'tone.png'; $relief = Join-Path $tmp 'relief.png'
    $n = { param($v) ([double]$v).ToString('0.###', [cultureinfo]::InvariantCulture) }

    magick $src -alpha off -shave '2%x2%' -colorspace gray -resize "${w}x${h}^" -gravity center -extent "${w}x${h}" `
        -auto-level -negate -level '25%,85%' $tone
    # Relieve aproximado: lo mas claro esta mas cerca. 50% de gris es "sin desplazamiento".
    magick $tone -blur 0x6 -auto-level -evaluate multiply 0.5 -evaluate add '50%' $relief

    $cells = foreach ($k in 0..($frames - 1)) {
        $t = 1 - $k / ($frames - 1)
        $angle = 34 * $t * [math]::PI / 180; $reach = 16 * $t; $shift = 6 * [math]::Sin($angle)
        # 1: mano izquierda, con la yema hacia la derecha. -1: mano derecha.
        $halves = foreach ($side in 1, -1) {
            $x0 = if ($side -eq 1) { 0 } else { $split }
            $hw = if ($side -eq 1) { $split } else { $w - $split }
            $crop = "${hw}x${h}+${x0}+0"
            # Cada mitad gira sobre su eje vertical central: la yema se aleja y el brazo se acerca.
            $corners = foreach ($p in @(0, 0), @($hw, 0), @(0, $h), @($hw, $h)) {
                $dx = $p[0] - $hw / 2
                $scale = $focal / ($focal + $side * $dx * [math]::Sin($angle))
                $x = $hw / 2 + $dx * [math]::Cos($angle) * $scale - $side * $reach
                $y = $h / 2 + ($p[1] - $h / 2) * $scale
                "$($p[0]),$($p[1]) $(& $n $x),$(& $n $y)"
            }
            $half = Join-Path $tmp "half$side.png"
            magick $tone -crop $crop +repage '(' $relief -crop $crop +repage ')' -compose displace `
                -define "compose:args=$(& $n ($side * $shift))x0" -composite `
                -virtual-pixel black -distort Perspective ($corners -join '  ') $half
            $half
        }
        $cell = Join-Path $tmp ('cell{0:d2}.png' -f $k)
        magick @halves +append -dither FloydSteinberg -remap $palette -colorspace gray @tint $cell
        $cell
    }
    magick @cells -append -strip $dst
}
Convert-HandsStrip (Join-Path $Art 'plates\michelangelo-adam-hands.jpg') (Join-Path $plates 'michelangelo-adam-hands-strip.png')

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
