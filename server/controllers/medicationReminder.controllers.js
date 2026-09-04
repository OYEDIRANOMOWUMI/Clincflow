const mongoose = require('mongoose')
const MedicationReminder = require('../models/medicationReminder.models')
const Patient = require('../models/patient.models')

const createReminder = async (req, res) => {
  try {
    const userId = req.user?._id
    const patient = await Patient.findOne({ userId }).select('_id').lean()

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' })
    }

    const medicationName = String(req.body?.medicationName || '').trim()
    const frequency = String(req.body?.frequency || 'Once daily').trim() || 'Once daily'
    const reminderTimes = Array.isArray(req.body?.reminderTimes)
      ? req.body.reminderTimes.map((time) => String(time).trim()).filter(Boolean)
      : []

    if (!medicationName) {
      return res.status(400).json({ success: false, message: 'Medication name is required' })
    }

    const prescriptionId = req.body?.prescriptionId && mongoose.isValidObjectId(req.body.prescriptionId)
      ? req.body.prescriptionId
      : new mongoose.Types.ObjectId()

    const reminder = await MedicationReminder.create({
      patientId: patient._id,
      prescriptionId,
      medicationName,
      frequency,
      startDate: new Date(req.body?.startDate || Date.now()),
      endDate: new Date(req.body?.endDate || Date.now() + 30 * 86400000),
      reminderTimes,
      status: 'pending'
    })

    return res.status(201).json({ success: true, reminder })
  } catch (error) {
    console.error('createReminder error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create medication reminder' })
  }
}

const getReminders = async (req, res) => {
  try {
    const role = req.user?.role
    const filter = role === 'patient' ? { userId: req.user._id } : { hospitalId: req.user.hospitalId }
    const patients = await Patient.find(filter).select('_id userId').lean()
    const patientIds = patients.map((patient) => patient._id)
    const reminders = await MedicationReminder.find({ patientId: { $in: patientIds } })
      .populate({ path: 'patientId', select: 'patientId userId', populate: { path: 'userId', select: 'name email' } })
      .sort({ status: 1, endDate: 1 })
      .lean()
    return res.json({ success: true, reminders })
  } catch (error) {
    console.error('getReminders error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load medication reminders' })
  }
}

const updateReminderStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid reminder ID' })
    const status = String(req.body?.status || '')
    const allowedStatuses = req.user.role === 'admin'
      ? ['pending', 'approved', 'rejected', 'active', 'paused', 'completed']
      : ['active', 'paused', 'completed']
    if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid reminder status' })
    const patientFilter = req.user.role === 'patient' ? { userId: req.user._id } : { hospitalId: req.user.hospitalId }
    const patients = await Patient.find(patientFilter).select('_id').lean()
    const reminder = await MedicationReminder.findOneAndUpdate({ _id: req.params.id, patientId: { $in: patients.map((patient) => patient._id) } }, { status }, { new: true }).lean()
    if (!reminder) return res.status(404).json({ success: false, message: 'Medication reminder not found' })
    return res.json({ success: true, reminder })
  } catch (error) {
    console.error('updateReminderStatus error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update medication reminder' })
  }
}

module.exports = { createReminder, getReminders, updateReminderStatus }
