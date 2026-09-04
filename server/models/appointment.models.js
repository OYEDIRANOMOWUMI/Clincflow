const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  patientName: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  department: { type: String, default: '' },
  issue: { type: String, default: '' },
  date: { type: Date, default: null },
  time: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'in-consultation', 'Pending', 'Approved', 'Rejected', 'Checked-in', 'Waiting', 'In Consultation', 'Completed', 'No-show', 'scheduled'],
    default: 'pending'
  },
  referenceCode: { type: String, unique: true, sparse: true, trim: true },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  cancelReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

appointmentSchema.index({ patientId: 1, date: 1 })
appointmentSchema.index({ doctorId: 1, date: 1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
