'use client'
import { useEffect, useRef } from 'react'

export default function AnimateOnScroll({ children, className = '', direction = 'up', delay = 0, threshold = 0.15 }) {
  const ref = useRef(null)
  const dirClass = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : direction === 'scale' ? 'reveal-scale' : ''
  const delayClass = delay ? `delay-${delay}` : ''

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div ref={ref} className={`reveal ${dirClass} ${delayClass} ${className}`}>
      {children}
    </div>
  )
}
