const mongoose = require('mongoose')

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['public', 'private'], default: 'private' },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  state: { type: String, default: '', trim: true },
  lga: { type: String, default: '', trim: true },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  services: [{ type: String, trim: true }],
  operatingHours: { type: mongoose.Schema.Types.Mixed, default: {} },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  phone: { type: String, default: '' },
  contactLine: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Hospital', hospitalSchema)
