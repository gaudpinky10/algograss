/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     AlgoGrass — MongoDB Atlas Database Setup Script         ║
 * ║                                                              ║
 * ║  Run this ONCE after creating your Atlas cluster:           ║
 * ║                                                              ║
 * ║  1. Open Windows Terminal in F:\algograss-launch\algofinal  ║
 * ║  2. Run: node scripts/init-database.mjs                     ║
 * ║                                                              ║
 * ║  It creates all 20 collections + indexes automatically.     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MongoClient } from 'mongodb'
import readline from 'readline'

// ─────────────────────────────────────────────────────────────────────────────
// Read connection string from env or prompt
// ─────────────────────────────────────────────────────────────────────────────
async function getConnectionString() {
  // Check env first
  const envUri = process.env.MONGODB_URI
  if (envUri && envUri.startsWith('mongodb')) {
    console.log('  ✓ Using MONGODB_URI from environment\n')
    return envUri
  }

  // Prompt user
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    console.log('\n  Paste your MongoDB Atlas connection string below.')
    console.log('  (It looks like: mongodb+srv://user:password@cluster.mongodb.net/)\n')
    rl.question('  Connection string → ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// All 20 AlgoGrass collections with indexes
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTIONS = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    name: 'users',
    description: 'Registered user accounts',
    indexes: [
      { key: { email: 1 },               unique: true,  name: 'email_unique' },
      { key: { createdAt: -1 },          unique: false, name: 'created_desc' },
      { key: { plan: 1, createdAt: -1 }, unique: false, name: 'plan_created' },
      { key: { isAdmin: 1 },             unique: false, name: 'is_admin' },
    ],
    sampleFields: {
      email:            'user@example.com',
      name:             'Jane Smith',
      password:         '<sha256 hash>',
      plan:             'free | starter | growth | agency',
      website:          'https://example.com',
      isAdmin:          false,
      stripeCustomerId: 'cus_...',
      createdAt:        new Date(),
    },
  },

  {
    name: 'password_resets',
    description: 'Password reset tokens — auto-deleted after 1 hour (TTL index)',
    indexes: [
      { key: { token: 1 },     unique: true,  name: 'token_unique' },
      { key: { email: 1 },     unique: false, name: 'email_idx' },
      { key: { expiresAt: 1 }, unique: false, name: 'ttl_1hr', expireAfterSeconds: 0 },
    ],
    sampleFields: {
      email:     'user@example.com',
      token:     '<64 hex chars>',
      expiresAt: '<1 hour from creation>',
      createdAt: new Date(),
    },
  },

  {
    name: 'sessions',
    description: 'Login activity log — auto-deleted after 30 days (TTL index)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { createdAt: 1 }, unique: false, name: 'ttl_30d', expireAfterSeconds: 2592000 },
    ],
    sampleFields: {
      userEmail:  'user@example.com',
      action:     'login | logout',
      ip:         '1.2.3.4',
      userAgent:  'Mozilla/5.0...',
      createdAt:  new Date(),
    },
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  {
    name: 'subscriptions',
    description: 'Stripe subscription record per user',
    indexes: [
      { key: { userEmail: 1 },            unique: false, name: 'user_idx' },
      { key: { stripeCustomerId: 1 },     unique: false, name: 'stripe_customer' },
      { key: { stripeSubscriptionId: 1 }, unique: false, name: 'stripe_sub' },
      { key: { status: 1, createdAt: -1 },unique: false, name: 'status_created' },
    ],
    sampleFields: {
      userEmail:            'user@example.com',
      stripeCustomerId:     'cus_...',
      stripeSubscriptionId: 'sub_...',
      plan:                 'starter | growth | agency',
      status:               'trialing | active | canceled | past_due',
      trial:                true,
      trialEndsAt:          '<date>',
      paymentMethodId:      'pm_...',
      refundStatus:         'succeeded | failed',
      createdAt:            new Date(),
    },
  },

  {
    name: 'billing_events',
    description: 'Every Stripe event that touches this user (payment, refund, cancel etc)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { event: 1, createdAt: -1 },     unique: false, name: 'event_created' },
      { key: { stripeEventId: 1 },            unique: true,  name: 'stripe_event_unique' },
    ],
    sampleFields: {
      stripeEventId: 'activate_cs_...',
      userEmail:     'user@example.com',
      event:         'trial_started | subscription_created | payment_succeeded | refund_created',
      plan:          'starter',
      amount:        100,
      currency:      'gbp',
      createdAt:     new Date(),
    },
  },

  // ── GDPR Scanner ──────────────────────────────────────────────────────────
  {
    name: 'scans',
    description: 'GDPR compliance scan results for any website',
    indexes: [
      { key: { userEmail: 1, scannedAt: -1 }, unique: false, name: 'user_scanned' },
      { key: { url: 1, scannedAt: -1 },       unique: false, name: 'url_scanned' },
      { key: { score: 1 },                     unique: false, name: 'score_idx' },
      { key: { scannedAt: -1 },                unique: false, name: 'scanned_desc' },
    ],
    sampleFields: {
      userEmail:  'user@example.com (or anonymous)',
      url:        'https://example.com',
      score:      82,
      issues:     '[ { sev, title, desc, reg } ]',
      trackers:   '[ "Google Analytics", "Hotjar" ]',
      checks:     '{ https, cookieBanner, privacyPolicy, ... }',
      scannedAt:  new Date(),
    },
  },

  // ── Complaints ────────────────────────────────────────────────────────────
  {
    name: 'complaints',
    description: 'GDPR complaint classifications (AI-analysed)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { urgency: 1, createdAt: -1 },   unique: false, name: 'urgency_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
      { key: { category: 1 },                 unique: false, name: 'category_idx' },
      { key: { status: 1 },                   unique: false, name: 'status_idx' },
    ],
    sampleFields: {
      userEmail:          'user@example.com',
      channel:            'Email | Website Form | WhatsApp | Post',
      complaintText:      '<original complaint>',
      category:           'Subject Access Request | Erasure Request | ...',
      urgency:            'High | Medium | Low',
      riskLevel:          'High | Medium | Low',
      responseDays:       30,
      regulationRef:      'GDPR Art. 17',
      summary:            '<one sentence>',
      recommendedAction:  '<specific action>',
      status:             'open | in_progress | resolved',
      createdAt:          new Date(),
    },
  },

  // ── DSAR ─────────────────────────────────────────────────────────────────
  {
    name: 'dsars',
    description: 'Data Subject Access Requests — 30-day statutory deadline tracked',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { deadline: 1 },                 unique: false, name: 'deadline_idx' },
      { key: { status: 1, deadline: 1 },      unique: false, name: 'status_deadline' },
      { key: { requestType: 1 },              unique: false, name: 'type_idx' },
    ],
    sampleFields: {
      userEmail:      'user@example.com',
      requesterName:  'John Doe',
      requesterEmail: 'john@example.com',
      requestType:    'SAR | Erasure | Rectification | Portability | Restriction | Objection',
      requestDetails: '<full request text>',
      aiGuide:        '<AI-generated step guide>',
      deadline:       '<30 days from createdAt>',
      status:         'open | in_progress | complete | overdue',
      createdAt:      new Date(),
    },
  },

  // ── Vendor Risk ───────────────────────────────────────────────────────────
  {
    name: 'vendors',
    description: 'Third-party vendor risk register (GDPR Art. 28)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { level: 1 },                    unique: false, name: 'risk_level' },
      { key: { dpaSigned: 1 },                unique: false, name: 'dpa_signed' },
      { key: { type: 1, level: 1 },           unique: false, name: 'type_level' },
    ],
    sampleFields: {
      userEmail:          'user@example.com',
      name:               'Salesforce',
      type:               'CRM | Cloud Storage | Analytics | Payment | Email | HR | Other',
      dataCategories:     '["Contact details", "Financial/payment"]',
      transfersOutsideUK: 'Yes | No',
      dpaSigned:          'Yes | No | Pending',
      lastAudit:          '2024-01 | Never',
      isoOrSoc2:          'ISO 27001 | SOC 2 | Both | Neither',
      score:              7,
      level:              'High | Medium | Low',
      createdAt:          new Date(),
    },
  },

  // ── DPIA ─────────────────────────────────────────────────────────────────
  {
    name: 'dpias',
    description: 'Data Protection Impact Assessments (GDPR Art. 35)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
    ],
    sampleFields: {
      userEmail:   'user@example.com',
      projectName: 'Customer portal launch',
      dataTypes:   'personal identifiers, location, financial',
      purpose:     'order fulfilment',
      riskLevel:   'High | Medium | Low',
      mitigations: '<list of actions>',
      aiAnalysis:  '<AI-generated DPIA report>',
      createdAt:   new Date(),
    },
  },

  // ── GRC ───────────────────────────────────────────────────────────────────
  {
    name: 'grc_riskAssessment',
    description: 'GRC risk assessments with AI analysis',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { 'data.category': 1 },          unique: false, name: 'category_idx' },
    ],
    sampleFields: { userEmail: 'user@example.com', type: 'riskAssessment', data: { riskTitle: '...', category: '...', likelihood: 'High', impact: 'High', owner: '...' }, aiText: '<AI report>', createdAt: new Date() },
  },

  {
    name: 'grc_policyReview',
    description: 'GRC policy review records',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
    ],
    sampleFields: { userEmail: 'user@example.com', type: 'policyReview', data: { policyName: '...', lastReviewed: '...', owner: '...' }, aiText: '<AI report>', createdAt: new Date() },
  },

  {
    name: 'grc_incidentAssessment',
    description: 'GRC data incident / breach assessments',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { 'data.severity': 1 },          unique: false, name: 'severity_idx' },
    ],
    sampleFields: { userEmail: 'user@example.com', type: 'incidentAssessment', data: { incidentTitle: '...', severity: 'High', affectedCount: 200 }, aiText: '<AI breach report>', createdAt: new Date() },
  },

  // ── AI Governance ─────────────────────────────────────────────────────────
  {
    name: 'ai_registers',
    description: 'AI system register for EU AI Act compliance',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
    ],
    sampleFields: { userEmail: 'user@example.com', systemName: 'Customer chatbot', riskLevel: 'Limited | Minimal | High | Unacceptable', purpose: '...', dataUsed: '...', aiText: '<AI Act assessment>', createdAt: new Date() },
  },

  // ── Data Audit ────────────────────────────────────────────────────────────
  {
    name: 'data_audits',
    description: 'Data processing activity records (Article 30 RoPA)',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
    ],
    sampleFields: { userEmail: 'user@example.com', activityName: 'Email marketing', lawfulBasis: 'Consent', dataCategories: '...', retentionPeriod: '2 years', processors: '...', createdAt: new Date() },
  },

  // ── Reminders ─────────────────────────────────────────────────────────────
  {
    name: 'reminders',
    description: 'Compliance review reminders and action items',
    indexes: [
      { key: { userEmail: 1, dueDate: 1 },  unique: false, name: 'user_due' },
      { key: { completed: 1, dueDate: 1 },  unique: false, name: 'completed_due' },
      { key: { priority: 1, dueDate: 1 },   unique: false, name: 'priority_due' },
    ],
    sampleFields: { userEmail: 'user@example.com', title: 'Review privacy policy', description: '...', dueDate: '<date>', priority: 'High | Medium | Low', category: 'GDPR | Security | Policy | General', completed: false, createdAt: new Date() },
  },

  // ── Activities (full audit log) ───────────────────────────────────────────
  {
    name: 'activities',
    description: 'Every user action — full audit log for all tools',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { tool: 1, createdAt: -1 },      unique: false, name: 'tool_created' },
      { key: { action: 1, createdAt: -1 },    unique: false, name: 'action_created' },
      { key: { createdAt: -1 },               unique: false, name: 'created_desc' },
    ],
    sampleFields: { userEmail: 'user@example.com', tool: 'scan | complaint | dsar | billing | auth | vendor-risk | ...', action: 'website_scanned | signup | login | trial_activated | ...', detail: 'https://target.com', meta: {}, ip: '1.2.3.4', createdAt: new Date() },
  },

  // ── Waitlist ──────────────────────────────────────────────────────────────
  {
    name: 'waitlist',
    description: 'Pre-launch interest signups',
    indexes: [
      { key: { email: 1 },      unique: true,  name: 'email_unique' },
      { key: { createdAt: -1 }, unique: false, name: 'created_desc' },
      { key: { source: 1 },     unique: false, name: 'source_idx' },
    ],
    sampleFields: { email: 'user@example.com', name: 'Jane', source: 'homepage | blog | ads', website: 'https://...', createdAt: new Date(), updatedAt: new Date() },
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  {
    name: 'contact_messages',
    description: 'Contact form messages and feedback',
    indexes: [
      { key: { email: 1, createdAt: -1 },  unique: false, name: 'email_created' },
      { key: { status: 1, createdAt: -1 }, unique: false, name: 'status_created' },
    ],
    sampleFields: { name: 'Jane', email: 'jane@example.com', subject: '...', message: '...', status: 'new | read | replied', createdAt: new Date() },
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  {
    name: 'notifications',
    description: 'In-app user notifications — auto-deleted after 90 days (TTL index)',
    indexes: [
      { key: { userEmail: 1, read: 1, createdAt: -1 }, unique: false, name: 'user_read_created' },
      { key: { type: 1, createdAt: -1 },               unique: false, name: 'type_created' },
      { key: { createdAt: 1 }, unique: false, name: 'ttl_90d', expireAfterSeconds: 7776000 },
    ],
    sampleFields: { userEmail: 'user@example.com', type: 'dsar_overdue | trial_ending | scan_complete | ...', title: '⚠️ DSAR deadline in 3 days', body: '...', read: false, link: '/dashboard', createdAt: new Date() },
  },

  // ── Webhook logs ──────────────────────────────────────────────────────────
  {
    name: 'webhook_logs',
    description: 'Raw inbound webhook payloads (email/WhatsApp/social) — 30d TTL',
    indexes: [
      { key: { source: 1, createdAt: -1 }, unique: false, name: 'source_created' },
      { key: { createdAt: 1 }, unique: false, name: 'ttl_30d', expireAfterSeconds: 2592000 },
    ],
    sampleFields: { source: 'email | whatsapp | twitter | linkedin', payload: { from: '...', body: '...', attachments: [] }, processedAt: new Date(), createdAt: new Date() },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Colours for terminal output
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
}

function ok(msg)   { console.log(`  ${C.green}✓${C.reset}  ${msg}`) }
function warn(msg) { console.log(`  ${C.yellow}⚠${C.reset}  ${msg}`) }
function err(msg)  { console.log(`  ${C.red}✗${C.reset}  ${msg}`) }
function info(msg) { console.log(`  ${C.dim}${msg}${C.reset}`) }
function head(msg) { console.log(`\n${C.bold}${C.cyan}${msg}${C.reset}`) }

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${C.bold}${C.cyan}╔════════════════════════════════════════╗${C.reset}`)
  console.log(`${C.bold}${C.cyan}║   AlgoGrass — MongoDB Atlas Setup      ║${C.reset}`)
  console.log(`${C.bold}${C.cyan}║   20 collections + indexes             ║${C.reset}`)
  console.log(`${C.bold}${C.cyan}╚════════════════════════════════════════╝${C.reset}\n`)

  const uri = await getConnectionString()

  if (!uri || !uri.startsWith('mongodb')) {
    err('Invalid connection string. It must start with mongodb:// or mongodb+srv://')
    process.exit(1)
  }

  head('Connecting to MongoDB Atlas…')
  let client
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 })
    await client.connect()
    ok(`Connected to Atlas`)
  } catch (e) {
    err(`Connection failed: ${e.message}`)
    console.log(`\n  ${C.yellow}Common fixes:${C.reset}`)
    console.log(`  • In Atlas → Network Access → Add IP: 0.0.0.0/0 (allow all)`)
    console.log(`  • Check the username and password in your connection string`)
    console.log(`  • Make sure the cluster is active (not paused)`)
    process.exit(1)
  }

  const db = client.db('algograss')
  ok(`Using database: ${C.bold}algograss${C.reset}`)

  head(`Creating ${COLLECTIONS.length} collections and their indexes…\n`)

  const summary = { created: 0, existing: 0, errors: 0 }

  for (const col of COLLECTIONS) {
    const collection = db.collection(col.name)
    let colCreated = 0, colExisting = 0, colErrors = 0

    for (const idx of col.indexes) {
      try {
        const opts = { name: idx.name, background: true }
        if (idx.unique)                      opts.unique = true
        if (idx.expireAfterSeconds != null)  opts.expireAfterSeconds = idx.expireAfterSeconds

        await collection.createIndex(idx.key, opts)
        colCreated++
        summary.created++
      } catch (e) {
        if (e.code === 85 || e.code === 86 || e.codeName === 'IndexAlreadyExists') {
          colExisting++
          summary.existing++
        } else {
          colErrors++
          summary.errors++
          err(`  ${col.name} / ${idx.name}: ${e.message}`)
        }
      }
    }

    const parts = []
    if (colCreated  > 0) parts.push(`${C.green}${colCreated} new${C.reset}`)
    if (colExisting > 0) parts.push(`${C.dim}${colExisting} existing${C.reset}`)
    if (colErrors   > 0) parts.push(`${C.red}${colErrors} errors${C.reset}`)

    console.log(`  ${C.cyan}${col.name.padEnd(25)}${C.reset}  ${parts.join(', ')}  ${C.dim}— ${col.description}${C.reset}`)
  }

  head('Summary')
  ok(`${summary.created} indexes created`)
  if (summary.existing > 0) info(`${summary.existing} indexes already existed (no changes)`)
  if (summary.errors   > 0) warn(`${summary.errors} errors — check output above`)

  console.log(`\n${C.bold}${C.green}  ✅ AlgoGrass database is ready!${C.reset}\n`)
  console.log(`  ${C.dim}Next steps:${C.reset}`)
  console.log(`  1. Copy your connection string to Vercel → Settings → Environment Variables`)
  console.log(`     Name:  MONGODB_URI`)
  console.log(`     Value: your connection string (same one you pasted above)`)
  console.log(`  2. Redeploy your Vercel project (or run push.bat)`)
  console.log(`  3. Visit https://cloud.mongodb.com → browse the algograss database`)
  console.log(`     to see the collections and indexes you just created.\n`)

  await client.close()
}

main().catch(e => {
  console.error(`\n  ${C.red}Fatal error: ${e.message}${C.reset}`)
  process.exit(1)
})
