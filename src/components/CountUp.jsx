'use client'
import { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const num = parseFloat(end)
        function tick(now) {
          const p = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(+(num * ease).toFixed(decimals))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.unobserve(el)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration, decimals])

  return (
    <span ref={ref} className="counter-val">
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}
