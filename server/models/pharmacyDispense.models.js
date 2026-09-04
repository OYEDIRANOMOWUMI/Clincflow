const mongoose = require('mongoose')

const pharmacyDispenseSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantityDispensed: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['full', 'partial'], required: true },
  dispensedAt: { type: Date, default: Date.now }
}, { timestamps: true })

pharmacyDispenseSchema.index({ prescriptionId: 1 }, { unique: true })

module.exports = mongoose.model('PharmacyDispense', pharmacyDispenseSchema)
