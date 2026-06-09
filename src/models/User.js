import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  plan: { type: String, default: 'free', enum: ['free', 'starter', 'growth', 'agency'] },
  website: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const bcrypt = (await import('bcryptjs')).default;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
  const bcrypt = (await import('bcryptjs')).default;
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
