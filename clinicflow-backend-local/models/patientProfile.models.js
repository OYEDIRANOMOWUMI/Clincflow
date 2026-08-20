const mongoose = require('mongoose')

const patientProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  issue: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, default: '' },
  address: { type: String, default: '' },
  allergies: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'consulting', 'pending_lab', 'pending_pharmacy', 'completed'],
    default: 'waiting'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

patientProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('PatientProfile', patientProfileSchema)
