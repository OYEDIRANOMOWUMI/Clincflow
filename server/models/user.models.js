const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, trim: true, select: false },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'],
    default: 'patient'
  },
  phone: { type: String, default: '' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  hospitalAddress: { type: String, default: '' },
  hospitalPhone: { type: String, default: '' },
  contactLine: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)