const mongoose = require('mongoose')

const internalReferralSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  patientName: { type: String, required: true, trim: true },
  fromDoctor: { type: String, required: true, trim: true },
  toDoctor: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  reason: { type: String, required: true, trim: true, minlength: 10 },
  status: { type: String, enum: ['Pending', 'Accepted', 'Completed', 'Rejected'], default: 'Pending' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

internalReferralSchema.index({ hospitalId: 1, status: 1, date: 1 })

module.exports = mongoose.model('InternalReferral', internalReferralSchema)
