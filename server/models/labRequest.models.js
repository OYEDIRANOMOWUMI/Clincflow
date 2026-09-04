const mongoose = require('mongoose')

const labRequestSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: { type: String, required: true, trim: true },
  test: { type: String, trim: true },
  reason: { type: String, default: '' },
  priority: { type: String, enum: ['Routine', 'Urgent', 'Stat'], default: 'Routine' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['requested', 'in_progress', 'completed'],
    default: 'requested'
  },
  result: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

labRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('LabRequest', labRequestSchema)
