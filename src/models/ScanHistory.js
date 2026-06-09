import mongoose from 'mongoose';

const ScanHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  url: { type: String, required: true },
  score: { type: Number, required: true },
  issues: { type: Array, default: [] },
  checks: { type: Object, default: {} },
  trackers: { type: Array, default: [] },
  scannedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ScanHistory || mongoose.model('ScanHistory', ScanHistorySchema);
