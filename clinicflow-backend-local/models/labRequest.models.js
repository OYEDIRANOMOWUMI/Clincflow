const mongoose = require('mongoose')

const labRequestSchema = new mongoose.Schema({
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
