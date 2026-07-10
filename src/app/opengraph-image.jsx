import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 96px',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,158,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{
            width: 56, height: 64,
            background: 'linear-gradient(135deg, #0EA5E9, #7C9EFF)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
          }}>AG</div>
          <span style={{
            fontSize: 40, fontWeight: 800,
            background: 'linear-gradient(135deg, #0EA5E9, #7C9EFF)',
            backgroundClip: 'text',
            color: 'transparent',
          }}>AlgoGrass</span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 64, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginBottom: 24 }}>
          GDPR Compliance{'\n'}Made Simple
        </div>

        {/* Description */}
        <div style={{ fontSize: 26, color: '#475569', lineHeight: 1.5, marginBottom: 48, maxWidth: 800 }}>
          Free website scanner + compliance tools for UK & EU businesses.
          60 days free — no credit card required.
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['UK GDPR', 'ICO Compliant', 'Free Scanner', '14 Tools'].map(badge => (
            <div key={badge} style={{
              padding: '10px 22px',
              borderRadius: 24,
              background: 'rgba(14,165,233,0.1)',
              border: '1px solid rgba(14,165,233,0.25)',
              color: '#0EA5E9',
              fontSize: 18,
              fontWeight: 600,
            }}>{badge}</div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: 48, right: 96,
          fontSize: 22, color: '#94A3B8',
        }}>algograss.com</div>
      </div>
    ),
    { ...size }
  )
}
