const mongoose = require('mongoose')

const waitlistSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  patientName: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true },
  preferredDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  preferredTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Waiting', 'Offered', 'Booked', 'Cancelled'], default: 'Waiting' },
  notes: { type: String, default: '', trim: true, maxlength: 200 },
  notified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

waitlistSchema.index({ hospitalId: 1, status: 1, priority: 1 })

module.exports = mongoose.model('Waitlist', waitlistSchema)
