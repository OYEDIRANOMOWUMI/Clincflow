const mongoose = require('mongoose')
const MedicineInventory = require('../models/medicineInventory.models')

const inventoryResponse = (medicine) => {
  const item = medicine.toObject ? medicine.toObject() : medicine
  const stockQuantity = Number(item.stockQuantity || 0)
  const lowStockThreshold = Number(item.lowStockThreshold || 0)

  return {
    ...item,
    lowStock: stockQuantity <= lowStockThreshold,
    outOfStock: stockQuantity === 0
  }
}

const getHospitalId = (req) => req.user?.hospitalId || null

const validatePayload = (payload = {}, partial = false) => {
  const errors = []
  if (!partial || payload.name !== undefined) {
    if (!String(payload.name || '').trim()) errors.push('name is required')
  }
  if (!partial || payload.stockQuantity !== undefined) {
    const quantity = Number(payload.stockQuantity)
    if (!Number.isInteger(quantity) || quantity < 0) errors.push('stockQuantity must be a non-negative integer')
  }
  if (payload.lowStockThreshold !== undefined) {
    const threshold = Number(payload.lowStockThreshold)
    if (!Number.isInteger(threshold) || threshold < 0) errors.push('lowStockThreshold must be a non-negative integer')
  }
  if (!partial || payload.expiryDate !== undefined) {
    if (!payload.expiryDate || Number.isNaN(new Date(payload.expiryDate).getTime())) errors.push('expiryDate must be a valid date')
  }
  return errors
}

const getInventory = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })

    const medicines = await MedicineInventory.find({ hospitalId }).sort({ name: 1 }).lean()
    return res.json({ success: true, inventory: medicines.map(inventoryResponse) })
  } catch (error) {
    console.error('getInventory error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load medicine inventory' })
  }
}

const createInventoryItem = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })

    const errors = validatePayload(req.body)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })

    const item = await MedicineInventory.create({
      hospitalId,
      name: String(req.body.name).trim(),
      stockQuantity: Number(req.body.stockQuantity),
      expiryDate: new Date(req.body.expiryDate),
      ...(req.body.lowStockThreshold === undefined ? {} : { lowStockThreshold: Number(req.body.lowStockThreshold) })
    })

    return res.status(201).json({ success: true, medicine: inventoryResponse(item) })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'A medicine with this name already exists in this hospital' })
    console.error('createInventoryItem error:', error)
    return res.status(500).json({ success: false, message: 'Unable to add medicine to inventory' })
  }
}

const updateInventoryItem = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid inventory item ID' })

    const errors = validatePayload(req.body, true)
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') })

    const updates = {}
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim()
    if (req.body.stockQuantity !== undefined) updates.stockQuantity = Number(req.body.stockQuantity)
    if (req.body.expiryDate !== undefined) updates.expiryDate = new Date(req.body.expiryDate)
    if (req.body.lowStockThreshold !== undefined) updates.lowStockThreshold = Number(req.body.lowStockThreshold)

    const item = await MedicineInventory.findOneAndUpdate(
      { _id: req.params.id, hospitalId },
      { $set: updates },
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' })

    return res.json({ success: true, medicine: inventoryResponse(item) })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'A medicine with this name already exists in this hospital' })
    console.error('updateInventoryItem error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update inventory item' })
  }
}

const deleteInventoryItem = async (req, res) => {
  try {
    const hospitalId = getHospitalId(req)
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid inventory item ID' })

    const item = await MedicineInventory.findOneAndDelete({ _id: req.params.id, hospitalId })
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' })

    return res.json({ success: true, deletedId: item._id })
  } catch (error) {
    console.error('deleteInventoryItem error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete inventory item' })
  }
}

module.exports = {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  inventoryResponse,
  validatePayload
}
