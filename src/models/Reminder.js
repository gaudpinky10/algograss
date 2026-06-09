import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String },
  dueDate: { type: String, required: true },
  owner: { type: String },
  notes: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'completed'] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
