const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema({
  repo: { type: String, required: true },
  branch: { type: String, required: true },
  prNumber: { type: Number, required: true },
  previousCode: { type: String },
  updatedCode: { type: String },
  summary: { type: String },
  confidence: { type: Number },
  patch: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AgentLog', agentLogSchema);
