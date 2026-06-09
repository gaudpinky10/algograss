import mongoose from 'mongoose';

const GrcPolicySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  owner: { type: String },
  lastReviewed: { type: String },
  nextReview: { type: String },
  status: { type: String, default: 'current' },
  aiReview: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GrcPolicy || mongoose.model('GrcPolicy', GrcPolicySchema);
