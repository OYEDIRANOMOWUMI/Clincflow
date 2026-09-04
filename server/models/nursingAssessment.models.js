const mongoose = require('mongoose')

const nursingAssessmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  temperature: { type: Number, min: 0 },
  bloodPressure: { type: String, trim: true },
  pulse: { type: Number, min: 0 },
  respiratoryRate: { type: Number, min: 0 },
  oxygenSaturation: { type: Number, min: 0, max: 100 },
  weight: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  notes: { type: String, default: '', trim: true }
}, { timestamps: true })

nursingAssessmentSchema.index({ appointmentId: 1 }, { unique: true })

module.exports = mongoose.model('NursingAssessment', nursingAssessmentSchema)
