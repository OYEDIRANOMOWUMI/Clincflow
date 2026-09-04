const mongoose = require('mongoose')

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  relationship: { type: String, trim: true },
  phone: { type: String, trim: true }
}, { _id: false })

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
  patientId: { type: String, required: true, unique: true, match: /^CF-PAT-\d{6}$/ },
  dob: { type: Date, default: null },
  sex: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
  address: { type: String, default: '', trim: true },
  emergencyContact: { type: emergencyContactSchema, default: null },
  condition: { type: String, default: 'General consultation', trim: true },
  diagnosis: { type: String, default: 'No diagnosis yet.', trim: true },
  notes: { type: String, default: 'No care notes yet.', trim: true },
  status: { type: String, default: 'waiting', trim: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

module.exports = mongoose.model('Patient', patientSchema)
