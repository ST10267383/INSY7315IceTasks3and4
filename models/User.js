// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roleSchema = new mongoose.Schema(
  {
    // If you later add orgs, keep this:
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: false },
    role: { type: String, enum: ['admin', 'manager', 'user'], required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // keep name if you already collect it; it's optional here to match the guide
    name: { type: String, required: false, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    roles:   { type: [roleSchema], default: [{ role: 'user' }] },
  },
  { timestamps: true }
);

// hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);