const Availability = require('../models/availability.models')
const User = require('../models/user.models')

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const setDoctorAvailability = async (req, res) => {
  try {
    const { date, status } = req.body || {}

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    if (!date || !String(date).trim()) {
      return res.status(400).json({ success: false, message: 'Date is required' })
    }

    if (!status || !['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be available or unavailable' })
    }

    const doctorId = req.user._id
    const doctorUser = await User.findById(doctorId)
    if (!doctorUser || normalizeRole(doctorUser.role) !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can set availability' })
    }

    const availability = await Availability.findOneAndUpdate(
      { doctor: doctorId, date: String(date).trim() },
      { doctor: doctorId, date: String(date).trim(), status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      message: 'Availability updated',
      availability
    })
  } catch (error) {
    console.error('setDoctorAvailability error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update availability' })
  }
}

const getDoctorAvailability = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const availability = await Availability.find({ doctor: req.user._id })
      .sort({ date: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      availability
    })
  } catch (error) {
    console.error('getDoctorAvailability error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch availability' })
  }
}

const getAllAvailability = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const availability = await Availability.find({})
      .populate('doctor', 'name email role')
      .sort({ date: 1 })
      .lean()

    const formatted = availability.map((item) => ({
      doctorId: item.doctor?._id || null,
      doctorName: item.doctor?.name || 'Unknown doctor',
      doctorRole: item.doctor?.role || '',
      date: item.date,
      status: item.status
    }))

    return res.status(200).json({
      success: true,
      availability: formatted
    })
  } catch (error) {
    console.error('getAllAvailability error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch all availability' })
  }
}

module.exports = {
  setDoctorAvailability,
  getDoctorAvailability,
  getAllAvailability
}
