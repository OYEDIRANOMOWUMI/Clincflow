const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true },
  targetType: { type: String, required: true, trim: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

auditLogSchema.index({ userId: 1, timestamp: -1 })
auditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
