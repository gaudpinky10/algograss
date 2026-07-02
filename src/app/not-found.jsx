import Link from 'next/link'

export const metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '90vh', background: '#060B14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '35%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', maxWidth: 480 }}>
        {/* 404 number */}
        <div style={{
          fontFamily: 'var(--font-barlow, "Barlow Condensed"), sans-serif',
          fontSize: 'clamp(80px, 15vw, 140px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #00D4AA, #7C9EFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: 8,
        }}>
          404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans"), sans-serif',
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 700,
          color: '#E8F0FE',
          marginBottom: 12,
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: 15,
          color: 'rgba(232,240,254,0.55)',
          lineHeight: 1.7,
          marginBottom: 36,
        }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try heading back to the homepage or scanning a website.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '13px 28px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00D4AA, #00B896)',
            color: '#060B14',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans"), sans-serif',
          }}>
            ← Back to homepage
          </Link>
          <Link href="/scan" style={{
            display: 'inline-block',
            padding: '13px 28px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#E8F0FE',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}>
            Scan a website →
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 12, color: 'rgba(232,240,254,0.3)', marginBottom: 14 }}>POPULAR PAGES</p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/blog', label: 'Blog' },
              { href: '/security', label: 'Security' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontSize: 13, color: '#00D4AA', textDecoration: 'none', fontWeight: 500,
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
