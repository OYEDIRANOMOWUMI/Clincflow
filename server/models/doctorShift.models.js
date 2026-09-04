const mongoose = require('mongoose')

const doctorShiftSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  doctorName: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  workingDays: { type: [String], required: true, validate: (days) => days.length > 0 },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  location: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Active', 'On-call', 'Break', 'Away'], default: 'Active' },
  notes: { type: String, default: '', trim: true, maxlength: 200 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

doctorShiftSchema.index({ hospitalId: 1, doctorName: 1, workingDays: 1 })

module.exports = mongoose.model('DoctorShift', doctorShiftSchema)
