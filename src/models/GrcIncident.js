import mongoose from 'mongoose';

const GrcIncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String },
  dataTypes: { type: String },
  affectedCount: { type: String },
  discoveredDate: { type: String },
  status: { type: String, default: 'investigating' },
  aiAssessment: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GrcIncident || mongoose.model('GrcIncident', GrcIncidentSchema);
