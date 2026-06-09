import mongoose from 'mongoose';

const DsarRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  requesterName: { type: String },
  requesterEmail: { type: String },
  requestType: { type: String },
  requestDetails: { type: String },
  aiGuide: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed'] },
  deadlineDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DsarRequest || mongoose.model('DsarRequest', DsarRequestSchema);
