'use client'
import { useEffect, useRef } from 'react'

export default function ParticleCanvas({ count = 80, speed = 0.4, connectDist = 130, style = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles, raf

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.8 + 0.6,
        hue: Math.random() > 0.7 ? 270 : 166, // purple or teal
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: count }, makeParticle)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      // update
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      }
      // connect
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < connectDist) {
            const alpha = (1 - d / connectDist) * 0.35
            const h = particles[i].hue
            ctx.strokeStyle = h === 166
              ? `rgba(0,212,170,${alpha})`
              : `rgba(124,58,237,${alpha})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      // dots
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.hue === 166
          ? 'rgba(0,212,170,0.75)'
          : 'rgba(124,58,237,0.65)'
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', () => { resize(); particles = Array.from({ length: count }, makeParticle) })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [count, speed, connectDist])

  return (
    <canvas
      ref={ref}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', ...style }}
    />
  )
}
