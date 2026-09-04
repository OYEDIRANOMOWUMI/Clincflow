const mongoose = require('mongoose')
const DoctorShift = require('../models/doctorShift.models')

const getHospitalId = (req) => req.user?.hospitalId || null

const validateShift = (payload = {}, partial = false) => {
  const errors = []
  const requiredText = ['doctorName', 'specialty', 'location']
  requiredText.forEach((field) => {
    if ((!partial || payload[field] !== undefined) && !String(payload[field] || '').trim()) errors.push(`${field} is required`)
  })
  if (!partial || payload.workingDays !== undefined) {
    if (!Array.isArray(payload.workingDays) || payload.workingDays.length === 0) errors.push('workingDays must contain at least one day')
  }
  for (const field of ['startTime', 'endTime']) {
    if ((!partial || payload[field] !== undefined) && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(payload[field] || ''))) errors.push(`${field} must use HH:MM format`)
  }
  if ((!partial || payload.status !== undefined) && !['Active', 'On-call', 'Break', 'Away'].includes(payload.status)) errors.push('status is invalid')
  if (payload.startTime && payload.endTime && payload.startTime >= payload.endTime) errors.push('endTime must be later than startTime')
  return errors
}

const getShifts = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const shifts = await DoctorShift.find({ hospitalId }).sort({ doctorName: 1, startTime: 1 }).lean()
    return res.json({ success: true, shifts })
  } catch (error) {
    console.error('getShifts error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load doctor shifts' })
  }
}

const createShift = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const errors = validateShift(req.body)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const shift = await DoctorShift.create({ ...req.body, hospitalId, createdBy: req.user._id, doctorName: String(req.body.doctorName).trim(), specialty: String(req.body.specialty).trim(), location: String(req.body.location).trim(), notes: String(req.body.notes || '').trim() })
    return res.status(201).json({ success: true, shift })
  } catch (error) {
    console.error('createShift error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create doctor shift' })
  }
}

const updateShift = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid shift ID' })
    const errors = validateShift(req.body, true)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })
    const shift = await DoctorShift.findOneAndUpdate({ _id: req.params.id, hospitalId }, { $set: req.body }, { new: true, runValidators: true })
    if (!shift) return res.status(404).json({ success: false, message: 'Doctor shift not found' })
    return res.json({ success: true, shift })
  } catch (error) {
    console.error('updateShift error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update doctor shift' })
  }
}

const deleteShift = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    const shift = await DoctorShift.findOneAndDelete({ _id: req.params.id, hospitalId })
    if (!shift) return res.status(404).json({ success: false, message: 'Doctor shift not found' })
    return res.json({ success: true, deletedId: shift._id })
  } catch (error) {
    console.error('deleteShift error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete doctor shift' })
  }
}

module.exports = { getShifts, createShift, updateShift, deleteShift, validateShift }
