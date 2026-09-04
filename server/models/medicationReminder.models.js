const mongoose = require('mongoose')

const medicationReminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  medicationName: { type: String, required: true, trim: true },
  frequency: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reminderTimes: [{ type: String, trim: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'paused', 'completed'], default: 'pending' }
}, { timestamps: true })

medicationReminderSchema.index({ patientId: 1, status: 1 })

module.exports = mongoose.model('MedicationReminder', medicationReminderSchema)
