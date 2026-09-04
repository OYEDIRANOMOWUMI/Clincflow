const Availability = require('../models/availability.models')
const User = require('../models/user.models')

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const slotTemplates = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const formatSlotLabel = (slotValue) => {
  const date = new Date(slotValue)
  if (Number.isNaN(date.getTime())) return slotValue
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const getDoctorAvailabilityByQuery = async (req, res) => {
  try {
    const doctorId = String(req.query.doctorId || req.user?._id || '').trim()
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId is required' })
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true, hospitalId: req.user?.hospitalId }).select('_id').lean()
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found in this hospital' })
    }

    const requestedDate = String(req.query.date || '').trim()
    const startDate = requestedDate ? new Date(`${requestedDate}T00:00:00`) : new Date()
    const dayCount = requestedDate ? 1 : 7
    const slots = []

    for (let offset = 0; offset < dayCount; offset += 1) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + offset)
      const dateKey = currentDay.toISOString().slice(0, 10)
      const availability = await Availability.findOne({ doctor: doctorId, date: dateKey }).lean()
      const isOpenDay = !availability || availability.status === 'available'

      if (!isOpenDay) continue

      slotTemplates.forEach((time) => {
        const slotValue = `${dateKey}T${time}`
        const slotDate = new Date(slotValue)
        if (slotDate < new Date(Date.now() - 60 * 1000)) return
        slots.push({ value: slotValue, label: formatSlotLabel(slotValue) })
      })
    }

    return res.json({ success: true, slots })
  } catch (error) {
    console.error('getDoctorAvailabilityByQuery error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load appointment slots' })
  }
}

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

    const hospitalDoctors = await User.find({ hospitalId: req.user.hospitalId, role: 'doctor' }).select('_id').lean()
    const availability = await Availability.find({ doctor: { $in: hospitalDoctors.map((doctor) => doctor._id) } })
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
  getAllAvailability,
  getDoctorAvailabilityByQuery
}
