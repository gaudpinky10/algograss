'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SUGGESTED = [
  'Do I need a DPO for my UK SME?',
  'How do I handle a Subject Access Request?',
  'What lawful basis should I use for email marketing?',
  'When must I report a data breach to the ICO?',
  'What cookies need consent under PECR?',
  'How do I make my privacy policy GDPR compliant?',
  'What is a DPIA and when is it required?',
  'Can I transfer data to the USA after Brexit?',
]

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#9B7BFA',
          animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, gap: 10, alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#9B7BFA,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>
          🛡️
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#9B7BFA,#00B896)'
          : 'rgba(255,255,255,0.07)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
        color: isUser ? '#06060F' : '#0F172A',
        fontSize: 14,
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        fontWeight: isUser ? 500 : 400,
      }}>
        {msg.content}
        {msg.streaming && <TypingDots />}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>
          👤
        </div>
      )}
    </div>
  )
}


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function AlgoGrassAI() {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [sessionId]               = useState(generateSessionId)
  const [showSuggested, setShowSuggested] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    setShowSuggested(false)
    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    // Add streaming placeholder
    setMessages(m => [...m, { role: 'assistant', content: '', streaming: true }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai-chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: newMessages, sessionId }),
        signal:  abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(m => [...m.slice(0,-1), { role: 'assistant', content: `Sorry, I encountered an error: ${err.error}` }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                full += parsed.text
                setMessages(m => [...m.slice(0,-1), { role: 'assistant', content: full, streaming: true }])
              }
            } catch {}
          }
        }
      }
      setMessages(m => [...m.slice(0,-1), { role: 'assistant', content: full }])
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(m => [...m.slice(0,-1), { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
      }
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function clearChat() {
    setMessages([])
    setShowSuggested(true)
    setInput('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060F', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 64, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#9B7BFA,#C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-syne,"Syne"),sans-serif', fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#9B7BFA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AlgoGrass AI
            </div>
            <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9B7BFA', display: 'inline-block' }} />
              GDPR & Compliance Expert · Always available
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94A3B8', background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 10px' }}>
            UK GDPR · EU AI Act · ICO
          </span>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ fontSize: 12, color: '#64748B', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '32px 20px', paddingBottom: 140 }}>

        {/* Welcome state */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(124,158,255,0.2))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>
              🛡️
            </div>
            <h1 style={{ fontFamily: 'var(--font-syne,"Syne"),sans-serif', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg,#9B7BFA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 10 }}>
              AlgoGrass AI
            </h1>
            <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 32px' }}>
              Your expert GDPR and compliance assistant. Ask me anything about UK GDPR, ICO guidance, data subject rights, breach notification, cookies, and more.
            </p>

            {showSuggested && (
              <div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14, letterSpacing: '.08em', textTransform: 'uppercase' }}>Suggested questions</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 }}>
                  {SUGGESTED.map(q => (
                    <button key={q} onClick={() => send(q)} style={{
                      background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 14px', color: '#334155',
                      fontSize: 13, textAlign: 'left', cursor: 'pointer', lineHeight: 1.4,
                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 20px 20px', zIndex: 20 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '10px 14px', transition: 'border-color .2s' }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask AlgoGrass AI anything about GDPR, ICO, data protection…"
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#0F172A', fontSize: 14, lineHeight: 1.5, resize: 'none',
                fontFamily: 'var(--font-space-grotesk,"Space Grotesk"),sans-serif',
                maxHeight: 120, overflowY: 'auto',
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 9, border: 'none', flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg,#9B7BFA,#00B896)' : 'rgba(255,255,255,0.08)',
                color: input.trim() && !loading ? '#06060F' : '#94A3B8',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
              }}>
              {loading ? '⏳' : '↑'}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 8 }}>
            AlgoGrass AI · Specialist in UK GDPR, EU AI Act & ICO guidance · Not a substitute for legal advice
          </p>
        </div>
      </div>
    </div>
  )
}
