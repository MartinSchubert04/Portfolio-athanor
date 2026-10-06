import { useEffect, useRef, useState, type ReactNode } from "react"

/** Shows its children once they scroll into view. The motion itself lives in index.css (.reveal). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isIn, setIsIn] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsIn(true)
        observer.disconnect()
      },
      { rootMargin: "0px 0px -10% 0px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`} data-in={isIn}>
      {children}
    </div>
  )
}
