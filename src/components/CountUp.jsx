'use client'
import { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function startAnim() {
      if (started.current) return
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
    }
    // Fallback: always start within 300ms in case IntersectionObserver doesn't fire
    const fallback = setTimeout(startAnim, 300)
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { startAnim(); obs.unobserve(el) }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [end, duration, decimals])

  return (
    <span ref={ref} className="counter-val">
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}
