import mongoose from 'mongoose';

const AiRegisterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  toolName: { type: String, required: true },
  useCase: { type: String },
  dataTypes: { type: Array, default: [] },
  legalBasis: { type: String },
  thirdPartySharing: { type: Boolean, default: false },
  automatedDecision: { type: Boolean, default: false },
  assessment: { type: Object, default: null },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  adminNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AiRegister || mongoose.model('AiRegister', AiRegisterSchema);
