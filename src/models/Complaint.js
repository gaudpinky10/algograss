import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  channel: { type: String, default: 'Website Form' },
  complaintText: { type: String, required: true },
  isGdprComplaint: { type: Boolean },
  category: { type: String },
  urgency: { type: String },
  responseDays: { type: Number },
  regulationRef: { type: String },
  summary: { type: String },
  recommendedAction: { type: String },
  templateResponse: { type: String },
  riskLevel: { type: String },
  riskExplanation: { type: String },
  status: { type: String, default: 'open', enum: ['open', 'in_progress', 'resolved'] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
