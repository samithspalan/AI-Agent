const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
  repo: { type: String, required: true, index: true },
  branch: { type: String, required: true },
  prNumber: { type: Number, required: true, index: true },
  previousCode: { type: String },
  updatedCode: { type: String },
  summary: { type: String },
  confidence: { type: Number },
  patch: { type: String },
}, { timestamps: true });

agentLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AgentLog', agentLogSchema);
