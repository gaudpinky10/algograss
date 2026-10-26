// Facts every AlgoGrass AI tool relies on, checked by hand and dated.
// Update FACTS_CHECKED and the lines below whenever the law changes; every
// tool reads them from here, so they all give the same, current answer.

export const FACTS_CHECKED = 'October 2026'

export const UK_DATA_FACTS = `UK data protection facts (checked ${FACTS_CHECKED}). Use these; do not contradict them.
- Law: UK GDPR, the Data Protection Act 2018 and PECR 2003, as amended by the Data (Use and Access) Act 2025 (DUAA, Royal Assent 19 June 2025). Most of DUAA's data protection and PECR changes came into force on 5 February 2026 (including recognised legitimate interests, the subject access changes, the new automated decision-making rules, the new cookie exemptions and higher PECR fines). The duty to handle complaints came into force on 19 June 2026. The regulator is the ICO (ico.org.uk, helpline 0303 123 1113).
- Lawful bases (Art. 6): consent, contract, legal obligation, vital interests, public task, legitimate interests, and (since 5 February 2026) recognised legitimate interests, which covers only a short list of purposes set out in the law (such as crime prevention, safeguarding, emergencies and national security) and needs no balancing test.
- Fines: UK GDPR up to £17.5m or 4% of worldwide annual turnover (whichever is higher) for the most serious breaches, otherwise up to £8.7m or 2%. DUAA raises PECR (cookies and marketing) fines to the same level.
- Largest ICO fines: British Airways £20m (2020, still the record), Marriott £18.4m (2020), Reddit £14.47m (Feb 2026, no effective age checks, so under-13s' data was processed unlawfully), Capita £14m (Oct 2025, cyber attack affecting 6.6 million people), TikTok £12.7m (2023, children's data), Advanced Computer Software £3.07m (March 2025, ransomware affecting NHS services).
- Subject access and other rights requests (access, rectification, erasure, restriction, objection, portability): respond without undue delay and at the latest within one calendar month of receipt. This can be extended by up to two further months if the request is complex or there are several, telling the person within the first month and explaining why. Since 5 February 2026 the law says the clock pauses while waiting for ID, a fee or clarification that is genuinely needed, and searches need only be reasonable and proportionate. If the deadline falls on a weekend or bank holiday, it moves to the next working day. Requests are free; a reasonable fee or refusal is allowed only if a request is manifestly unfounded or excessive. Exemptions are in DPA 2018 Schedules 2 to 4.
- Personal data breaches: record every breach. Report to the ICO within 72 hours of becoming aware, unless the breach is unlikely to result in a risk to people's rights and freedoms; reports are made through the ICO's online breach reporting form or by phone, and can be given in stages. Tell affected people without undue delay if the breach is likely to result in a high risk to them.
- Data protection complaints (DUAA s.103, new s.164A DPA 2018, in force from 19 June 2026): organisations must make it easy to complain (for example a form that can be filled in online and by other means) and accept complaints however they arrive, acknowledge each complaint within 30 days of receiving it, look into it without undue delay and in proportion to the complaint, keep the person informed, and tell them the outcome without undue delay. Keep a record of each complaint and what was done; the ICO can ask for it. People can still complain to the ICO.
- Cookies and similar technologies (PECR reg. 6): consent is needed before setting non-essential cookies or trackers, with refusing as easy as accepting. Strictly necessary cookies are exempt. Since 5 February 2026, DUAA adds limited further exemptions (for example statistics/analytics used only to improve a website or service, and appearance or functionality preferences), but only with clear information and a simple, free way to object. Advertising and cross-site tracking cookies still need consent. Check an exemption truly fits before relying on it.
- Email and text marketing (PECR reg. 22): needs consent, unless the "soft opt-in" applies (existing customers, similar products or services, a chance to opt out when details were collected and in every message). DUAA extends the soft opt-in to charities (check it is in force before relying on it).
- DPIAs (Art. 35): required before processing likely to result in a high risk, including the types on the ICO's list. If a high risk remains after mitigation, consult the ICO before starting (Art. 36).
- International transfers: allowed to countries covered by UK adequacy regulations (including the EU/EEA), to US organisations certified under the UK-US data bridge, or with safeguards such as the ICO's International Data Transfer Agreement (IDTA) or the UK Addendum to the EU standard contractual clauses, plus a transfer risk assessment.
- Processors (Art. 28): a written contract with the required terms is needed with every supplier that processes personal data on your behalf. Advertising and social pixels (Meta, LinkedIn, TikTok) usually make the provider a joint or separate controller, not just a processor.
- Data protection fee: most organisations that process personal data must pay the ICO an annual fee, unless exempt (since February 2025: £52 tier 1 micro, £78 tier 2 small and medium, £3,763 tier 3 large; £5 less by direct debit).
- EU AI Act (EU law; it applies to UK firms that place AI on the EU market or whose AI output is used in the EU): in force 1 August 2024. Banned practices and the AI literacy duty apply from 2 February 2025, and general-purpose AI model rules from 2 August 2025. The "Digital Omnibus" amendment (in force 27 July 2026) moved the high-risk rules: stand-alone high-risk systems (Annex III, e.g. recruitment, credit scoring, education) from 2 December 2027, and AI in regulated products (Annex I) from 2 August 2028. Other transparency duties (e.g. telling people they are talking to an AI) apply from 2 August 2026; generative AI systems already on the market before then have until 2 December 2026 to label AI-generated content. The UK has no equivalent AI Act: UK GDPR and existing regulators apply to AI.`

export const HONESTY_RULES = `Accuracy rules:
- State only facts you are confident are correct and current. Never invent case names, fine amounts, dates, article or section numbers, guidance titles, ICO registration numbers, company names, addresses or contact details.
- Where something depends on details you weren't given, say what is needed or use an [INSERT: ...] placeholder.
- If a rule may have changed recently, say so and suggest checking ico.org.uk.
- You are not a lawyer. For decisions with legal risk (refusing a request, not reporting a breach, relying on an exemption), recommend checking with a qualified adviser.
- Use UK spelling and plain English.`

// Today's date in UK format, so the AI never guesses what day it is
export const todayUK = (d = new Date()) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' })

// England and Wales bank holidays (gov.uk/bank-holidays). Scotland and
// Northern Ireland have a few different days. Add each new year here.
export const BANK_HOLIDAYS = new Set([
  '2025-12-25', '2025-12-26',
  '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25', '2026-08-31', '2026-12-25', '2026-12-28',
  '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31', '2027-08-30', '2027-12-27', '2027-12-28',
  '2028-01-03', '2028-04-14', '2028-04-17', '2028-05-01', '2028-05-29', '2028-08-28', '2028-12-25', '2028-12-26',
])
const isoDay = d => d.toISOString().slice(0, 10)
// Moves a date forward to the next working day (not a weekend or bank holiday)
export function nextWorkingDay(date) {
  const d = new Date(date)
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6 || BANK_HOLIDAYS.has(isoDay(d))) d.setUTCDate(d.getUTCDate() + 1)
  return d
}

// Parses "2026-10-26" (or a full date) as that calendar day, ignoring time zones
export function ukDay(input) {
  if (!input) return null
  const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})/)
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(input)
  if (isNaN(d)) return null
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// One calendar month (or more) after a date, the ICO way: the same day next
// month, or the last day of that month if it has no such day (31 Jan -> 28/29
// Feb). A deadline on a weekend or bank holiday moves to the next working day.
export function addCalendarMonths(date, months = 1) {
  const d = ukDay(date)
  if (!d) return null
  const day = d.getUTCDate()
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return nextWorkingDay(target)
}

// A number of days after a date (e.g. 30 days to acknowledge a complaint)
export function addDays(date, days) {
  const d = ukDay(date)
  if (!d) return null
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

export const formatUK = d => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : ''

// Pulls the first JSON object out of a model reply (tolerates code fences or
// a sentence before it); returns null if there isn't a valid one
export function extractJson(text) {
  const s = String(text || '').replace(/```(?:json)?/gi, '')
  const start = s.indexOf('{')
  if (start < 0) return null
  let depth = 0, inStr = false, esc = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue }
    if (c === '"') inStr = true
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) { try { return JSON.parse(s.slice(start, i + 1)) } catch { return null } }
  }
  return null
}

// The system prompt every AlgoGrass AI tool starts from: its role, today's
// date, the checked UK facts and the accuracy rules
export const toolSystem = role => `${role}

Today's date is ${todayUK()}.

${UK_DATA_FACTS}

${HONESTY_RULES}`
