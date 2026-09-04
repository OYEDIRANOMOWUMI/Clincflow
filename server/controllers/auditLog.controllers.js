const AuditLog = require('../models/auditLog.models')
const User = require('../models/user.models')

const getAuditLogs = async (req, res) => {
  try {
    if (!req.user?.hospitalId) return res.status(400).json({ success: false, message: 'Admin is not linked to a hospital' })
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500)
    const logs = await AuditLog.aggregate([
      { $lookup: { from: User.collection.name, localField: 'userId', foreignField: '_id', as: 'actor' } },
      { $unwind: '$actor' },
      { $match: { 'actor.hospitalId': req.user.hospitalId } },
      { $sort: { timestamp: -1 } },
      { $limit: limit },
      { $project: { _id: 1, action: 1, targetType: 1, targetId: 1, timestamp: 1, actor: { _id: '$actor._id', name: '$actor.name', email: '$actor.email', role: '$actor.role' } } }
    ])
    return res.json({ success: true, logs })
  } catch (error) {
    console.error('getAuditLogs error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load audit logs' })
  }
}

module.exports = { getAuditLogs }
