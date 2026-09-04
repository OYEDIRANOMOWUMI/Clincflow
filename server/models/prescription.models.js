const mongoose = require('mongoose')

const prescriptionSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    name: { type: String, required: true, trim: true },
    dose: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  drugName: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  instructions: { type: String, default: '' },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'dispensed'],
    default: 'unpaid'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

prescriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Prescription', prescriptionSchema)
