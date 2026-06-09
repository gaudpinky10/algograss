import mongoose from 'mongoose';

const DataAuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  auditType: { type: String, required: true, enum: ['crm', 'hr', 'email', 'vendor'] },
  answers: { type: Object, default: {} },
  result: { type: Object, default: null },
  score: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DataAudit || mongoose.model('DataAudit', DataAuditSchema);
