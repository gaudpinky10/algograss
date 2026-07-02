'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  page: { minHeight: '100vh', background: '#060B14', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 800, margin: '0 auto' },
  h1: { fontSize: 34, fontWeight: 800, color: '#E8F0FE', margin: '0 0 8px', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 15, margin: '0 0 32px' },
  card: { background: '#0D1525', border: '1px solid #1e2d45', borderRadius: 16, padding: '24px 28px', marginBottom: 16 },
  btn: { background: 'linear-gradient(135deg,#00D4AA,#00A882)', color: '#06111E', fontWeight: 700, fontSize: 14, padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer' },
  btnGhost: { background: 'transparent', color: '#94A3B8', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #1e2d45', cursor: 'pointer' },
}

const MODULES = [
  {
    id: 1, title: 'What is GDPR?', icon: '📜',
    content: [
      'UK GDPR (General Data Protection Regulation) applies to any organisation that processes personal data of UK residents.',
      'Personal data is any information relating to an identifiable person — names, emails, IP addresses, location data, and more.',
      'UK GDPR is built on 7 core principles: (1) Lawful, fair and transparent, (2) Purpose limitation, (3) Data minimisation, (4) Accuracy, (5) Storage limitation, (6) Integrity and confidentiality, (7) Accountability.',
      'The ICO (Information Commissioner\'s Office) enforces UK GDPR and can fine organisations up to £17.5 million or 4% of global annual turnover.',
    ],
    quiz: [
      { q: 'What does GDPR stand for?', opts: ['General Data Protection Regulation','Global Data Privacy Rules','Government Data Processing Requirements'], correct: 0 },
      { q: 'How many data protection principles are there under UK GDPR?', opts: ['5','6','7'], correct: 2 },
      { q: 'Who enforces UK GDPR in the UK?', opts: ['The Home Office','The ICO','The FCA'], correct: 1 },
    ],
  },
  {
    id: 2, title: 'Lawful Basis for Processing', icon: '⚖️',
    content: [
      'You must have a lawful basis before processing personal data. Processing without a lawful basis is unlawful.',
      'The 6 lawful bases are: (1) Consent, (2) Contract, (3) Legal obligation, (4) Vital interests, (5) Public task, (6) Legitimate interests.',
      'Consent: must be freely given, specific, informed and unambiguous. Pre-ticked boxes are NOT valid consent.',
      'Legitimate interests: you can process data if it is necessary for your legitimate interests — but only if it doesn\'t override the individual\'s rights.',
      'You must document which lawful basis you rely on for each processing activity.',
    ],
    quiz: [
      { q: 'How many lawful bases exist under UK GDPR?', opts: ['4','6','8'], correct: 1 },
      { q: 'Which lawful basis is most appropriate for sending marketing emails?', opts: ['Contract','Consent','Vital interests'], correct: 1 },
      { q: 'Is a pre-ticked consent box valid under UK GDPR?', opts: ['Yes, always','No','Only for B2B marketing'], correct: 1 },
    ],
  },
  {
    id: 3, title: 'Individual Rights', icon: '🙋',
    content: [
      'UK GDPR gives individuals 8 rights over their personal data.',
      '1. Right to be informed — about how their data is used (via privacy notice)',
      '2. Right of access (SAR) — they can request a copy of their personal data',
      '3. Right to rectification — correct inaccurate data within 30 days',
      '4. Right to erasure — "right to be forgotten" in certain circumstances',
      '5. Right to restrict processing — pause processing while a dispute is resolved',
      '6. Right to data portability — receive data in a structured, machine-readable format',
      '7. Right to object — particularly to direct marketing (absolute right) and legitimate interests',
      '8. Rights related to automated decision-making — not to be subject to solely automated decisions with significant effects',
      'You must respond to most requests within 30 days. This can be extended by 2 months in complex cases.',
    ],
    quiz: [
      { q: 'How long do you have to respond to a Subject Access Request?', opts: ['14 days','30 days','60 days'], correct: 1 },
      { q: 'What is the "right to be forgotten"?', opts: ['Right of access','Right to erasure','Right to portability'], correct: 1 },
      { q: 'How many individual rights does UK GDPR provide?', opts: ['6','7','8'], correct: 2 },
    ],
  },
  {
    id: 4, title: 'Data Breaches', icon: '🚨',
    content: [
      'A personal data breach is any incident that affects the confidentiality, integrity, or availability of personal data.',
      'Examples: stolen laptop with unencrypted data, ransomware attack, accidental email to wrong recipient, loss of USB drive.',
      'If a breach is likely to result in a risk to individuals — report to the ICO within 72 hours of becoming aware.',
      'If the breach poses a HIGH risk — notify affected individuals directly, without undue delay.',
      'You must ALWAYS document breaches internally, even if they don\'t need to be reported to the ICO.',
      'Late reporting must include an explanation for the delay. The ICO takes prompt reporting seriously.',
    ],
    quiz: [
      { q: 'Within how many hours must you report a breach to the ICO?', opts: ['24 hours','48 hours','72 hours'], correct: 2 },
      { q: 'Which breaches must always be documented internally?', opts: ['Only reported breaches','Only high-risk breaches','ALL breaches'], correct: 2 },
      { q: 'When must you notify affected individuals about a breach?', opts: ['Always','Only if it poses a HIGH risk','Only if the ICO tells you to'], correct: 1 },
    ],
  },
  {
    id: 5, title: 'Consent & Cookies', icon: '🍪',
    content: [
      'Valid consent under UK GDPR must be: Freely given (no bundled consent), Specific (separate consent for separate purposes), Informed (clear explanation of what you\'re consenting to), Unambiguous (a clear affirmative action).',
      'Silence, pre-ticked boxes, or inactivity do NOT count as consent.',
      'You must be able to show consent was given — keep records.',
      'Cookies: Under PECR (Privacy and Electronic Communications Regulations), you need consent for non-essential cookies (analytics, advertising, tracking).',
      'Cookie consent: it must be as easy to Reject as to Accept. You must have a clear "Reject All" option.',
      'Strictly necessary cookies (session cookies, security cookies) do NOT require consent.',
    ],
    quiz: [
      { q: 'Is a pre-ticked consent box valid under UK GDPR?', opts: ['Yes','No','Only for first-party cookies'], correct: 1 },
      { q: 'PECR requires consent for...', opts: ['All cookies','Non-essential cookies','First-party cookies only'], correct: 1 },
      { q: 'Valid consent must be...', opts: ['Written and witnessed','Freely given, specific, informed and unambiguous','Given once for all marketing purposes'], correct: 1 },
    ],
  },
]

function ProgressBar({ completed, total }) {
  const pct = (completed / total) * 100
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>Overall Progress</span>
        <span style={{ fontSize: 13, color: '#00D4AA', fontWeight: 600 }}>{completed}/{total} modules</span>
      </div>
      <div style={{ background: '#1e2d45', borderRadius: 8, height: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#00D4AA,#7C9EFF)', borderRadius: 8, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function QuizQuestion({ q, idx, onAnswer, answered }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE', marginBottom: 10 }}>{idx + 1}. {q.q}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.opts.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.03)', col = '#CBD5E1', border = '#1e2d45'
          if (answered !== undefined) {
            if (i === q.correct) { bg = 'rgba(0,212,170,0.1)'; col = '#00D4AA'; border = '#00D4AA' }
            else if (i === answered && answered !== q.correct) { bg = 'rgba(239,68,68,0.1)'; col = '#EF4444'; border = '#EF4444' }
          }
          return (
            <button key={i} onClick={() => onAnswer && onAnswer(i)} disabled={answered !== undefined}
              style={{ background: bg, border: `1px solid ${border}`, color: col, borderRadius: 8, padding: '10px 16px', fontSize: 13, textAlign: 'left', cursor: answered !== undefined ? 'default' : 'pointer', transition: 'all 0.2s' }}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Module({ mod, onComplete, isCompleted }) {
  const [open, setOpen] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const answer = (qIdx, aIdx) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qIdx]: aIdx }))
  }

  const submit = () => {
    let s = 0
    mod.quiz.forEach((q, i) => { if (answers[i] === q.correct) s++ })
    setScore(s)
    setSubmitted(true)
    if (s >= 2) setTimeout(() => onComplete(mod.id), 500)
  }

  const retry = () => { setAnswers({}); setSubmitted(false); setScore(0) }

  return (
    <div style={{ ...S.card, borderColor: isCompleted ? 'rgba(0,212,170,0.3)' : '#1e2d45' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 24 }}>{mod.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Module {mod.id}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FE' }}>{mod.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isCompleted && <span style={{ background: 'rgba(0,212,170,0.12)', color: '#00D4AA', fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>✓ Passed</span>}
          <span style={{ color: '#475569', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #1e2d45' }}>
          {!quizStarted ? (
            <>
              <div style={{ marginBottom: 24 }}>
                {mod.content.map((c, i) => (
                  <p key={i} style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{c}</p>
                ))}
              </div>
              <button style={S.btn} onClick={() => setQuizStarted(true)}>Start Quiz →</button>
            </>
          ) : (
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE', marginBottom: 20 }}>Answer at least 2 out of 3 questions correctly to pass this module.</p>
              {mod.quiz.map((q, i) => (
                <QuizQuestion key={i} q={q} idx={i} onAnswer={a => answer(i, a)} answered={submitted ? (answers[i] !== undefined ? answers[i] : undefined) : answers[i] !== undefined ? undefined : undefined} />
              ))}
              {!submitted ? (
                <button style={{ ...S.btn, opacity: Object.keys(answers).length < mod.quiz.length ? 0.5 : 1 }}
                  onClick={submit} disabled={Object.keys(answers).length < mod.quiz.length}>
                  Submit Answers
                </button>
              ) : (
                <div style={{ background: score >= 2 ? 'rgba(0,212,170,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${score >= 2 ? 'rgba(0,212,170,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 12, padding: '16px 20px', marginTop: 16 }}>
                  <p style={{ color: score >= 2 ? '#00D4AA' : '#EF4444', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>
                    {score >= 2 ? `✅ Passed! ${score}/3 correct` : `❌ ${score}/3 correct — try again`}
                  </p>
                  {score < 2 && <button onClick={retry} style={S.btnGhost}>Retry Quiz</button>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Certificate({ name, date }) {
  return (
    <div id="certificate" style={{ background: '#fff', color: '#111', border: '8px solid #00D4AA', borderRadius: 16, padding: '48px 56px', textAlign: 'center', maxWidth: 640, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#00D4AA', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>AlgoGrass</div>
      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#00D4AA,#7C9EFF)', margin: '0 auto 28px', borderRadius: 2 }} />
      <h2 style={{ fontSize: 13, fontWeight: 600, color: '#666', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>Certificate of Completion</h2>
      <p style={{ fontSize: 15, color: '#555', margin: '0 0 8px' }}>This is to certify that</p>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111', margin: '0 0 12px', letterSpacing: -0.5 }}>{name}</h1>
      <p style={{ fontSize: 15, color: '#555', margin: '0 0 8px' }}>has successfully completed</p>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#00D4AA', margin: '0 0 24px' }}>GDPR Staff Awareness Training</h2>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>All 5 modules completed · 100% quiz pass rate</p>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 28px' }}>Issued: {date}</p>
      <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#00D4AA,#7C9EFF)', margin: '0 auto 16px', borderRadius: 2 }} />
      <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>algograss.com · Automated GDPR Compliance</p>
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
export default function TrainingPage() {
  const [completed, setCompleted] = useState(new Set())
  const [certName, setCertName] = useState('')
  const [showCert, setShowCert] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const complete = id => setCompleted(s => new Set([...s, id]))
  const allDone = completed.size === MODULES.length
  const certDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const printCert = () => {
    const el = document.getElementById('certificate')
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>AlgoGrass Certificate</title><style>body{margin:0;padding:40px;background:#fff;}</style></head><body>${el.outerHTML}</body></html>`)
    w.document.close()
    w.print()
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#00D4AA', letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: '4px 14px', display: 'inline-block', marginBottom: 14 }}>🎓 Staff Training</div>
        <h1 style={S.h1}>GDPR Staff Awareness Training</h1>
        <p style={S.sub}>Complete all 5 modules and pass each quiz to earn your AlgoGrass GDPR Certificate</p>

        <ProgressBar completed={completed.size} total={MODULES.length} />

        {MODULES.map(mod => (
          <Module key={mod.id} mod={mod} onComplete={complete} isCompleted={completed.has(mod.id)} />
        ))}

        {allDone && !showCert && (
          <div style={{ background: 'linear-gradient(135deg,rgba(0,212,170,0.1),rgba(124,158,255,0.1))', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 16, padding: '32px', textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h2 style={{ color: '#E8F0FE', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Congratulations! All modules complete.</h2>
            <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 24px' }}>Enter your name to generate your GDPR training certificate.</p>
            <input style={{ ...S.card, display: 'block', width: '100%', maxWidth: 360, margin: '0 auto 16px', textAlign: 'center', color: '#E8F0FE', fontSize: 16, padding: '12px 16px', borderRadius: 10, boxSizing: 'border-box' }}
              placeholder="Your full name" value={certName} onChange={e => setCertName(e.target.value)} />
            <button style={{ ...S.btn, opacity: certName.trim() ? 1 : 0.5 }} onClick={() => certName.trim() && setShowCert(true)} disabled={!certName.trim()}>
              🏆 Generate Certificate
            </button>
          </div>
        )}

        {showCert && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
              <button onClick={printCert} style={S.btn}>🖨️ Print / Download Certificate</button>
            </div>
            <Certificate name={certName} date={certDate} />
          </div>
        )}
      </div>
    </div>
  )
}
