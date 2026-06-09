import mongoose from 'mongoose';

const GrcRiskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String },
  likelihood: { type: String },
  impact: { type: String },
  owner: { type: String },
  status: { type: String, default: 'open' },
  aiAssessment: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GrcRisk || mongoose.model('GrcRisk', GrcRiskSchema);
