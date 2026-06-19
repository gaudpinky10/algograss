/**
 * AlgoGrass Database Initialisation
 * -----------------------------------
 * Creates all collections and indexes in the 'algograss' MongoDB Atlas database.
 * Safe to run multiple times — uses createIndex with background:true (idempotent).
 *
 * Run via: POST /api/admin/db  (founder-only)
 */

import { getDb } from '../mongodb'

// ─────────────────────────────────────────────────────────────
// Collection definitions
// ─────────────────────────────────────────────────────────────
const COLLECTIONS = [
  // ── Auth / Users ──────────────────────────────────────────
  {
    name: 'users',
    indexes: [
      { key: { email: 1 },                unique: true,  name: 'email_unique' },
      { key: { createdAt: -1 },           unique: false, name: 'created_desc' },
      { key: { plan: 1, createdAt: -1 },  unique: false, name: 'plan_created' },
      { key: { isAdmin: 1 },              unique: false, name: 'is_admin' },
    ],
    description: 'Registered user accounts',
  },

  {
    name: 'password_resets',
    indexes: [
      { key: { token: 1 },     unique: true,  name: 'token_unique' },
      { key: { email: 1 },     unique: false, name: 'email_idx' },
      // TTL index — MongoDB auto-deletes expired tokens after 1 hour
      { key: { expiresAt: 1 }, unique: false, name: 'ttl_expires', expireAfterSeconds: 0 },
    ],
    description: 'Password reset tokens (1hr TTL)',
  },

  {
    name: 'sessions',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { createdAt: 1 },                unique: false, name: 'ttl_session', expireAfterSeconds: 60 * 60 * 24 * 30 }, // 30 day TTL
    ],
    description: 'Login sessions and auth events',
  },

  // ── Billing / Subscriptions ───────────────────────────────
  {
    name: 'subscriptions',
    indexes: [
      { key: { userEmail: 1 },             unique: false, name: 'user_idx' },
      { key: { stripeCustomerId: 1 },      unique: false, name: 'stripe_customer' },
      { key: { stripeSubscriptionId: 1 },  unique: false, name: 'stripe_sub' },
      { key: { status: 1, createdAt: -1 }, unique: false, name: 'status_created' },
    ],
    description: 'Stripe subscription records per user',
  },

  {
    name: 'billing_events',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { event: 1, createdAt: -1 },     unique: false, name: 'event_created' },
      { key: { stripeEventId: 1 },            unique: true,  name: 'stripe_event_unique' },
    ],
    description: 'Stripe webhook billing events log',
  },

  // ── GDPR Scanner ─────────────────────────────────────────
  {
    name: 'scans',
    indexes: [
      { key: { userEmail: 1, scannedAt: -1 }, unique: false, name: 'user_scanned' },
      { key: { url: 1, scannedAt: -1 },       unique: false, name: 'url_scanned' },
      { key: { score: 1 },                     unique: false, name: 'score_idx' },
      { key: { scannedAt: -1 },                unique: false, name: 'scanned_desc' },
    ],
    description: 'GDPR compliance scan results',
  },

  // ── Complaints ────────────────────────────────────────────
  {
    name: 'complaints',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { urgency: 1, createdAt: -1 },   unique: false, name: 'urgency_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
      { key: { category: 1 },                 unique: false, name: 'category_idx' },
      { key: { status: 1 },                   unique: false, name: 'status_idx' },
    ],
    description: 'GDPR complaint classifications',
  },

  // ── DSAR (Data Subject Access Requests) ──────────────────
  {
    name: 'dsars',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { deadline: 1 },                 unique: false, name: 'deadline_idx' },
      { key: { status: 1, deadline: 1 },      unique: false, name: 'status_deadline' },
      { key: { requestType: 1 },              unique: false, name: 'type_idx' },
    ],
    description: 'Data Subject Access Requests (30-day deadline)',
  },

  // ── Vendor Risk ───────────────────────────────────────────
  {
    name: 'vendors',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { level: 1 },                    unique: false, name: 'risk_level' },
      { key: { dpaSigned: 1 },                unique: false, name: 'dpa_signed' },
      { key: { type: 1, level: 1 },           unique: false, name: 'type_level' },
    ],
    description: 'Third-party vendor risk assessments',
  },

  // ── DPIA ─────────────────────────────────────────────────
  {
    name: 'dpias',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
      { key: { projectName: 'text' },         unique: false, name: 'project_text' },
    ],
    description: 'Data Protection Impact Assessments',
  },

  // ── GRC ───────────────────────────────────────────────────
  {
    name: 'grc_riskAssessment',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { 'data.category': 1 },          unique: false, name: 'category_idx' },
    ],
    description: 'GRC risk assessments',
  },

  {
    name: 'grc_policyReview',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
    ],
    description: 'GRC policy reviews',
  },

  {
    name: 'grc_incidentAssessment',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 },   unique: false, name: 'user_created' },
      { key: { 'data.severity': 1 },             unique: false, name: 'severity_idx' },
    ],
    description: 'GRC data incident assessments',
  },

  // ── AI Governance ─────────────────────────────────────────
  {
    name: 'ai_registers',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { riskLevel: 1 },                unique: false, name: 'risk_level' },
    ],
    description: 'AI system governance register (EU AI Act)',
  },

  // ── Data Audit ────────────────────────────────────────────
  {
    name: 'data_audits',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
    ],
    description: 'Data processing activity audits (Article 30)',
  },

  // ── Reminders ─────────────────────────────────────────────
  {
    name: 'reminders',
    indexes: [
      { key: { userEmail: 1, dueDate: 1 },    unique: false, name: 'user_due' },
      { key: { completed: 1, dueDate: 1 },    unique: false, name: 'completed_due' },
      { key: { priority: 1, dueDate: 1 },     unique: false, name: 'priority_due' },
    ],
    description: 'Compliance review reminders and tasks',
  },

  // ── Activities (audit log) ────────────────────────────────
  {
    name: 'activities',
    indexes: [
      { key: { userEmail: 1, createdAt: -1 }, unique: false, name: 'user_created' },
      { key: { tool: 1, createdAt: -1 },      unique: false, name: 'tool_created' },
      { key: { action: 1, createdAt: -1 },    unique: false, name: 'action_created' },
      { key: { createdAt: -1 },               unique: false, name: 'created_desc' },
    ],
    description: 'All user activity audit log',
  },

  // ── Waitlist ──────────────────────────────────────────────
  {
    name: 'waitlist',
    indexes: [
      { key: { email: 1 },      unique: true,  name: 'email_unique' },
      { key: { createdAt: -1 }, unique: false, name: 'created_desc' },
      { key: { source: 1 },     unique: false, name: 'source_idx' },
    ],
    description: 'Pre-launch waitlist / signup interest',
  },

  // ── AlgoGrass AI Chat History ────────────────────────────
  {
    name: 'ai_chats',
    indexes: [
      { key: { sessionId: 1 },                unique: true,  name: 'session_unique' },
      { key: { userEmail: 1, updatedAt: -1 }, unique: false, name: 'user_updated' },
      { key: { createdAt: 1 }, unique: false, name: 'ttl_90d', expireAfterSeconds: 7776000 },
    ],
    description: 'AlgoGrass AI chat sessions (90d TTL)',
  },

  // ── Contact / Feedback ────────────────────────────────────
  {
    name: 'contact_messages',
    indexes: [
      { key: { email: 1, createdAt: -1 }, unique: false, name: 'email_created' },
      { key: { status: 1, createdAt: -1 }, unique: false, name: 'status_created' },
    ],
    description: 'Contact form and feedback messages',
  },

  // ── Notifications ─────────────────────────────────────────
  {
    name: 'notifications',
    indexes: [
      { key: { userEmail: 1, read: 1, createdAt: -1 }, unique: false, name: 'user_read_created' },
      { key: { type: 1, createdAt: -1 },               unique: false, name: 'type_created' },
      // TTL — auto-delete notifications older than 90 days
      { key: { createdAt: 1 }, unique: false, name: 'ttl_90d', expireAfterSeconds: 60 * 60 * 24 * 90 },
    ],
    description: 'In-app user notifications',
  },

  // ── Webhooks log ──────────────────────────────────────────
  {
    name: 'webhook_logs',
    indexes: [
      { key: { source: 1, createdAt: -1 }, unique: false, name: 'source_created' },
      { key: { createdAt: 1 }, unique: false, name: 'ttl_30d', expireAfterSeconds: 60 * 60 * 24 * 30 },
    ],
    description: 'Raw webhook payloads (email, WhatsApp, social — 30d TTL)',
  },

  // ── AlgoGrass AI Knowledge Base (RAG) ────────────────────
  {
    name: 'knowledge_base',
    indexes: [
      // Full-text search across title + content + tags
      { key: { title: 'text', content: 'text', tags: 'text' }, unique: false, name: 'fulltext_search' },
      { key: { category: 1, publishedAt: -1 }, unique: false, name: 'category_date' },
      { key: { source: 1 },                    unique: false, name: 'source_idx' },
      { key: { publishedAt: -1 },              unique: false, name: 'latest_first' },
      { key: { slug: 1 },                      unique: true,  name: 'slug_unique' },
    ],
    description: 'GDPR regulatory knowledge base for RAG — ICO decisions, EDPB opinions, EU AI Act updates',
  },
]

// ─────────────────────────────────────────────────────────────
// Main init function
// ─────────────────────────────────────────────────────────────
export async function initDb() {
  const db = await getDb()
  if (!db) throw new Error('Cannot connect to MongoDB')

  const results = []

  for (const col of COLLECTIONS) {
    const collection = db.collection(col.name)
    const colResult  = { name: col.name, description: col.description, indexes: [] }

    for (const idx of col.indexes) {
      try {
        const opts = { name: idx.name, background: true }
        if (idx.unique)              opts.unique = true
        if (idx.expireAfterSeconds !== undefined) opts.expireAfterSeconds = idx.expireAfterSeconds

        const idxName = await collection.createIndex(idx.key, opts)
        colResult.indexes.push({ name: idxName, status: 'ok' })
      } catch (err) {
        // Index already exists with same name = fine (idempotent)
        if (err.codeName === 'IndexAlreadyExists' || err.code === 85 || err.code === 86) {
          colResult.indexes.push({ name: idx.name, status: 'already_exists' })
        } else {
          colResult.indexes.push({ name: idx.name, status: 'error', error: err.message })
        }
      }
    }

    results.push(colResult)
  }

  return {
    success:     true,
    collections: COLLECTIONS.length,
    results,
    initializedAt: new Date().toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// DB health check — returns stats for every collection
// ─────────────────────────────────────────────────────────────
export async function getDbHealth() {
  const db = await getDb()
  if (!db) return { connected: false, collections: [] }

  const stats = await Promise.all(
    COLLECTIONS.map(async (col) => {
      try {
        const c     = db.collection(col.name)
        const count = await c.countDocuments()
        const idxs  = await c.indexes()
        return {
          name:        col.name,
          description: col.description,
          documents:   count,
          indexes:     idxs.length,
        }
      } catch {
        return { name: col.name, description: col.description, documents: 0, indexes: 0, error: true }
      }
    })
  )

  const totalDocs = stats.reduce((s, c) => s + c.documents, 0)

  return {
    connected:   true,
    dbName:      'algograss',
    collections: stats,
    totalDocuments: totalDocs,
    checkedAt:   new Date().toISOString(),
  }
}
