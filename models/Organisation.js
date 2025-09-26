const mongoose = require('mongoose');
const crypto = require('crypto');

const organisationSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    joinCode:  { type: String, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Generate & set a new join code (8 hex chars)
organisationSchema.methods.generateJoinCode = function () {
  this.joinCode = crypto.randomBytes(4).toString('hex');
  return this.joinCode;
};

module.exports = mongoose.model('Organisation', organisationSchema);