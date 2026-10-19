// Small, dependency-free markdown renderer for AI chat replies.
// Builds React elements only (no dangerouslySetInnerHTML), so model output cannot inject HTML.
// Supports: # headings, **bold**, *italic*, `code`, - / * / 1. lists, --- rules, paragraphs.

function renderInline(text, keyPrefix) {
  const parts = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyPrefix}-${i++}`
    if (tok.startsWith('**')) parts.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) parts.push(<code key={key} style={{ background: 'rgba(125,125,125,.18)', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em' }}>{tok.slice(1, -1)}</code>)
    else parts.push(<em key={key}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function Markdown({ text }) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let para = []
  let list = null // { ordered, items: [] }

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ') })
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      blocks.push({ type: list.ordered ? 'ol' : 'ul', items: list.items })
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()
    let m
    if (!t) { flushPara(); flushList(); continue }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushPara(); flushList(); blocks.push({ type: 'hr' }); continue }
    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) { flushPara(); flushList(); blocks.push({ type: 'h', level: m[1].length, text: m[2] }); continue }
    if ((m = t.match(/^[-*•]\s+(.*)$/))) {
      flushPara()
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] } }
      list.items.push(m[1])
      continue
    }
    if ((m = t.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara()
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] } }
      list.items.push(m[1])
      continue
    }
    flushList()
    para.push(t)
  }
  flushPara()
  flushList()

  const hSize = { 1: 17, 2: 16, 3: 15 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {blocks.map((b, i) => {
        if (b.type === 'hr') return <hr key={i} style={{ border: 0, borderTop: '1px solid rgba(125,125,125,.3)', margin: '4px 0', width: '100%' }} />
        if (b.type === 'h') return <div key={i} style={{ fontWeight: 700, fontSize: hSize[b.level] || 14, marginTop: 4 }}>{renderInline(b.text, `h${i}`)}</div>
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type
          return (
            <Tag key={i} style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `l${i}-${j}`)}</li>)}
            </Tag>
          )
        }
        return <div key={i}>{renderInline(b.text, `p${i}`)}</div>
      })}
    </div>
  )
}
