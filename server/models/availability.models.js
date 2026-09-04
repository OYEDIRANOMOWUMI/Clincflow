const mongoose = require('mongoose')

const availabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, 
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },  
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

availabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

availabilitySchema.index({ doctor: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Availability', availabilitySchema)
