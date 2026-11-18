// Small, dependency-free markdown renderer for AI output (chat replies, reports, documents).
// Builds React elements only (no dangerouslySetInnerHTML), so model output cannot inject HTML.
// Supports: # headings, **bold**, *italic*, `code`, - / * / 1. lists, --- rules, | tables |,
// paragraphs, and highlights [INSERT: ...] placeholders so users can see what to fill in.
//
// Props:
//   text    the markdown string
//   breaks  keep single line breaks inside a paragraph (letters, addresses, sign-offs).
//           Chat replies leave this off, so wrapped lines join into one paragraph.

const PLACEHOLDER = /^\[INSERT[^\]]*\]$/i

function renderInline(text, keyPrefix) {
  const parts = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[INSERT[^\]]*\]|\*[^*\s][^*]*\*)/gi
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyPrefix}-${i++}`
    if (tok.startsWith('**')) parts.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) parts.push(<code key={key} style={{ background: 'rgba(125,125,125,.18)', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em' }}>{tok.slice(1, -1)}</code>)
    else if (PLACEHOLDER.test(tok)) parts.push(<mark key={key} className="md-placeholder" style={{ background: 'rgba(245,158,11,0.2)', color: 'inherit', borderRadius: 4, padding: '0 4px' }}>{tok}</mark>)
    else parts.push(<em key={key}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

const isTableRow = t => /^\|.*\|$/.test(t)
const isTableSep = t => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(t)
const splitRow = t => t.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())

// Parses markdown into simple blocks. Shared by the renderer and the plain-text converter.
function parseBlocks(text, breaks) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let para = []
  let list = null // { ordered, items: [] }
  let table = null // { rows: [] }

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', lines: breaks ? para : [para.join(' ')] })
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      blocks.push({ type: list.ordered ? 'ol' : 'ul', items: list.items })
      list = null
    }
  }
  const flushTable = () => {
    if (table) {
      const [head, ...body] = table.rows
      blocks.push({ type: 'table', head, body })
      table = null
    }
  }
  const flushAll = () => { flushPara(); flushList(); flushTable() }

  for (const raw of lines) {
    const t = raw.trim()
    let m
    if (!t) { flushAll(); continue }
    if (isTableRow(t)) {
      flushPara(); flushList()
      if (!table) table = { rows: [] }
      if (!isTableSep(t)) table.rows.push(splitRow(t))
      continue
    }
    flushTable()
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushAll(); blocks.push({ type: 'hr' }); continue }
    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) { flushAll(); blocks.push({ type: 'h', level: m[1].length, text: m[2] }); continue }
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
  flushAll()
  return blocks
}

// Plain text for copying into forms and emails: no #, **, backticks or table pipes.
export function markdownToPlain(text) {
  const strip = s => String(s).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\*([^*\s][^*]*)\*/g, '$1')
  return parseBlocks(text, true).map(b => {
    if (b.type === 'hr') return ''
    if (b.type === 'h') return strip(b.text).toUpperCase()
    if (b.type === 'ul') return b.items.map(it => `• ${strip(it)}`).join('\n')
    if (b.type === 'ol') return b.items.map((it, j) => `${j + 1}. ${strip(it)}`).join('\n')
    if (b.type === 'table') {
      const head = b.head || []
      return b.body.map(r => r.map((c, j) => (head[j] ? `${strip(head[j])}: ` : '') + strip(c)).join('\n')).join('\n\n')
    }
    return b.lines.map(strip).join('\n')
  }).join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

export default function Markdown({ text, breaks = false }) {
  const blocks = parseBlocks(text, breaks)
  const hSize = { 1: 17, 2: 16, 3: 15 }
  const cell = { border: '1px solid rgba(125,125,125,.3)', padding: '6px 10px', textAlign: 'left', verticalAlign: 'top' }
  return (
    <div className="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {blocks.map((b, i) => {
        if (b.type === 'hr') return <hr key={i} style={{ border: 0, borderTop: '1px solid rgba(125,125,125,.3)', margin: '4px 0', width: '100%' }} />
        if (b.type === 'h') return <div key={i} role="heading" aria-level={b.level} style={{ fontWeight: 700, fontSize: hSize[b.level] || 14, marginTop: 6 }}>{renderInline(b.text, `h${i}`)}</div>
        if (b.type === 'ul' || b.type === 'ol') {
          const Tag = b.type
          return (
            <Tag key={i} style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 4, listStyle: b.type === 'ol' ? 'decimal' : 'disc' }}>
              {b.items.map((it, j) => <li key={j} style={{ display: 'list-item' }}>{renderInline(it, `l${i}-${j}`)}</li>)}
            </Tag>
          )
        }
        if (b.type === 'table') {
          return (
            <div key={i} style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.95em' }}>
                {b.head && (
                  <thead>
                    <tr>{b.head.map((c, j) => <th key={j} style={{ ...cell, fontWeight: 700, background: 'rgba(125,125,125,.12)' }}>{renderInline(c, `th${i}-${j}`)}</th>)}</tr>
                  </thead>
                )}
                <tbody>
                  {b.body.map((r, ri) => (
                    <tr key={ri}>{r.map((c, j) => <td key={j} style={cell}>{renderInline(c, `td${i}-${ri}-${j}`)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return (
          <div key={i}>
            {b.lines.map((ln, j) => (
              <span key={j}>{j > 0 && <br />}{renderInline(ln, `p${i}-${j}`)}</span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
