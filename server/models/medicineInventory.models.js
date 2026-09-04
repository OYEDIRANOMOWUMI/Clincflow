const mongoose = require('mongoose')

const medicineInventorySchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true, trim: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 10 }
}, { timestamps: true })

medicineInventorySchema.index({ hospitalId: 1, name: 1 }, { unique: true })
medicineInventorySchema.index({ expiryDate: 1 })

module.exports = mongoose.model('MedicineInventory', medicineInventorySchema)
