const mongoose = require('mongoose')

const consultationRecordSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chiefComplaint: { type: String, default: '', trim: true },
  symptoms: { type: String, default: '', trim: true },
  examinationFindings: { type: String, default: '', trim: true },
  vitalsRef: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingAssessment', default: null },
  diagnosis: { type: String, default: '', trim: true },
  treatmentPlan: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true },
  followUpInstructions: { type: String, default: '', trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

module.exports = mongoose.model('ConsultationRecord', consultationRecordSchema)
