const mongoose = require('mongoose')
const InternalReferral = require('../models/internalReferral.models')

const getHospitalId = (req) => req.user?.hospitalId || null
const statuses = ['Pending', 'Accepted', 'Completed', 'Rejected']

const validateReferral = (payload = {}, partial = false) => {
  const errors = []
  for (const field of ['patientName', 'fromDoctor', 'toDoctor', 'specialty', 'reason', 'date']) {
    if ((!partial || payload[field] !== undefined) && !String(payload[field] || '').trim()) errors.push(`${field} is required`)
  }
  if (payload.reason !== undefined && String(payload.reason).trim().length < 10) errors.push('reason must be at least 10 characters')
  if (payload.date && !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) errors.push('date must use YYYY-MM-DD format')
  if (payload.status !== undefined && !statuses.includes(payload.status)) errors.push('status is invalid')
  return errors
}

const getReferrals = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const referrals = await InternalReferral.find({ hospitalId }).sort({ date: 1, createdAt: -1 }).lean()
    return res.json({ success: true, referrals })
  } catch (error) {
    console.error('getReferrals error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load referrals' })
  }
}

const createReferral = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const errors = validateReferral(req.body)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const referral = await InternalReferral.create({ ...req.body, hospitalId, createdBy: req.user._id })
    return res.status(201).json({ success: true, referral })
  } catch (error) {
    console.error('createReferral error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create referral' })
  }
}

const updateReferral = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid referral ID' })
    const errors = validateReferral(req.body, true)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const referral = await InternalReferral.findOneAndUpdate({ _id: req.params.id, hospitalId }, { $set: req.body }, { new: true, runValidators: true })
    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found' })
    return res.json({ success: true, referral })
  } catch (error) {
    console.error('updateReferral error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update referral' })
  }
}

module.exports = { getReferrals, createReferral, updateReferral, validateReferral }
