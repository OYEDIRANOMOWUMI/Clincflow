const mongoose = require('mongoose')
const Waitlist = require('../models/waitlist.models')

const getHospitalId = (req) => req.user?.hospitalId || null
const validPriorities = ['High', 'Medium', 'Low']
const validStatuses = ['Waiting', 'Offered', 'Booked', 'Cancelled']

const validateWaitlist = (payload = {}, partial = false) => {
  const errors = []
  for (const field of ['patientName', 'specialty', 'preferredDate', 'preferredTime']) {
    if ((!partial || payload[field] !== undefined) && !String(payload[field] || '').trim()) errors.push(`${field} is required`)
  }
  if ((!partial || payload.priority !== undefined) && !validPriorities.includes(payload.priority)) errors.push('priority is invalid')
  if (payload.preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(payload.preferredDate)) errors.push('preferredDate must use YYYY-MM-DD format')
  if (payload.preferredTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(payload.preferredTime)) errors.push('preferredTime must use HH:MM format')
  if (payload.status !== undefined && !validStatuses.includes(payload.status)) errors.push('status is invalid')
  return errors
}

const getWaitlist = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const entries = await Waitlist.find({ hospitalId }).sort({ priority: 1, preferredDate: 1, createdAt: 1 }).lean()
    return res.json({ success: true, waitlist: entries })
  } catch (error) {
    console.error('getWaitlist error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load waitlist' })
  }
}

const createWaitlistEntry = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const errors = validateWaitlist(req.body)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const entry = await Waitlist.create({ ...req.body, hospitalId, createdBy: req.user._id, patientName: String(req.body.patientName).trim(), specialty: String(req.body.specialty).trim(), notes: String(req.body.notes || '').trim() })
    return res.status(201).json({ success: true, entry })
  } catch (error) {
    console.error('createWaitlistEntry error:', error)
    return res.status(500).json({ success: false, message: 'Unable to add patient to waitlist' })
  }
}

const updateWaitlistEntry = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid waitlist ID' })
    const errors = validateWaitlist(req.body, true)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const entry = await Waitlist.findOneAndUpdate({ _id: req.params.id, hospitalId }, { $set: req.body }, { new: true, runValidators: true })
    if (!entry) return res.status(404).json({ success: false, message: 'Waitlist entry not found' })
    return res.json({ success: true, entry })
  } catch (error) {
    console.error('updateWaitlistEntry error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update waitlist entry' })
  }
}

const deleteWaitlistEntry = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const entry = await Waitlist.findOneAndDelete({ _id: req.params.id, hospitalId })
    if (!entry) return res.status(404).json({ success: false, message: 'Waitlist entry not found' })
    return res.json({ success: true, deletedId: entry._id })
  } catch (error) {
    console.error('deleteWaitlistEntry error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete waitlist entry' })
  }
}

module.exports = { getWaitlist, createWaitlistEntry, updateWaitlistEntry, deleteWaitlistEntry, validateWaitlist }
