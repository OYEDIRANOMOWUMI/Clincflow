const Appointment = require('../models/appointment.models')
const User = require('../models/user.models')
const PatientProfile = require('../models/patientProfile.models')
const Availability = require('../models/availability.models')

// Create appointment (patient booking)
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, dateTime, reason, notes } = req.body
    const hospitalId = req.user?.hospitalId

    // Validate required fields
    if (!patientId || !doctorId || !dateTime || !reason) {
      return res.status(400).json({ message: 'Missing required fields: patientId, doctorId, dateTime, reason' })
    }

    if (!hospitalId || String(patientId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'You can only book appointments for your own hospital account' })
    }

    const parsedDate = new Date(dateTime)
    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({ message: 'A future appointment date and time is required' })
    }

    // Verify doctor exists and is actually a doctor
    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor' || doctor.isActive === false || String(doctor.hospitalId) !== String(hospitalId)) {
      return res.status(404).json({ message: 'Doctor not found or invalid role' })
    }

    // Verify patient exists
    const patient = await User.findById(patientId)
    if (!patient || patient.role !== 'patient' || String(patient.hospitalId) !== String(hospitalId)) {
      return res.status(404).json({ message: 'Patient not found or invalid role' })
    }

    // Check if appointment time slot already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: parsedDate,
      hospitalId,
      status: { $in: ['confirmed', 'Approved', 'In Consultation'] }
    })

    if (existingAppointment) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' })
    }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      hospitalId,
      doctorId,
      date: parsedDate,
      reason,
      notes: notes || '',
      status: 'pending',
      patientName: patient.name,
      phoneNumber: patient.phone || '',
      department: doctor.department || 'General'
    })

    await appointment.save()

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment._id,
        patientName: appointment.patientName,
        doctorName: doctor.name,
        date: appointment.date,
        status: appointment.status,
        reason: appointment.reason
      }
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    res.status(500).json({ message: 'Failed to create appointment', error: error.message })
  }
}

// Get appointments by patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.patientId
    const hospitalId = req.hospitalId

    if (req.user.role === 'patient' && String(patientId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only view your own appointments' })
    }

    const appointments = await Appointment.find({ patientId, hospitalId })
      .populate('doctorId', 'name email phone department')
      .sort({ date: -1 })

    res.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching patient appointments:', error)
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message })
  }
}

// Get appointments by doctor (for doctor dashboard)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId
    const hospitalId = req.hospitalId

    if (req.user.role === 'doctor' && String(doctorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only view your own appointments' })
    }

    const appointments = await Appointment.find({ doctorId, hospitalId })
      .populate('patientId', 'name email phone')
      .sort({ date: 1 })

    res.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching doctor appointments:', error)
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message })
  }
}

// Get all appointments for hospital (admin/staff view)
exports.getAllAppointments = async (req, res) => {
  try {
    const hospitalId = req.hospitalId
    const { status, doctorId, date } = req.query

    let filter = req.user.role === 'patient'
      ? { hospitalId, $or: [{ patientId: req.user._id }, { patient: req.user._id }] }
      : { hospitalId }
    if (status) filter.status = status
    if (doctorId) filter.doctorId = doctorId
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      filter.date = { $gte: startDate, $lt: endDate }
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone department')
      .sort({ date: 1 })

    res.json({
      success: true,
      count: appointments.length,
      appointments
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message })
  }
}

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: 'Status is required' })
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'in-consultation']
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, hospitalId: req.user.hospitalId },
      { status: status.toLowerCase() },
      { new: true }
    ).populate('patientId', 'name email phone').populate('doctorId', 'name email')

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    res.status(500).json({ message: 'Failed to update appointment', error: error.message })
  }
}

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const { newDateTime } = req.body

    if (!newDateTime) {
      return res.status(400).json({ message: 'New appointment time is required' })
    }

    const accessFilter = req.user.role === 'patient'
      ? { _id: id, hospitalId: req.user.hospitalId, $or: [{ patient: req.user._id }, { patientId: req.user._id }] }
      : { _id: id, hospitalId: req.user.hospitalId }
    const appointment = await Appointment.findOne(accessFilter)
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    // Check if new time slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(newDateTime),
      _id: { $ne: id },
      status: { $in: ['confirmed', 'Approved', 'In Consultation'] }
    })

    if (conflictingAppointment) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another time.' })
    }

    appointment.date = new Date(newDateTime)
    appointment.status = 'pending'
    await appointment.save()

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment
    })
  } catch (error) {
    console.error('Error rescheduling appointment:', error)
    res.status(500).json({ message: 'Failed to reschedule appointment', error: error.message })
  }
}

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const accessFilter = req.user.role === 'patient'
      ? { _id: id, hospitalId: req.user.hospitalId, $or: [{ patient: req.user._id }, { patientId: req.user._id }] }
      : { _id: id, hospitalId: req.user.hospitalId }
    const appointment = await Appointment.findOneAndUpdate(
      accessFilter,
      { status: 'cancelled', cancelReason: reason || '' },
      { new: true }
    )

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    })
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    res.status(500).json({ message: 'Failed to cancel appointment', error: error.message })
  }
}

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const hospitalId = req.hospitalId

    const stats = await Appointment.aggregate([
      { $match: { hospitalId: require('mongoose').Types.ObjectId(hospitalId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAppointments = await Appointment.find({
      hospitalId,
      date: { $gte: today }
    })

    res.json({
      success: true,
      statusBreakdown: stats,
      totalAppointments: stats.reduce((sum, s) => sum + s.count, 0),
      appointmentsToday: todayAppointments.length
    })
  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    res.status(500).json({ message: 'Failed to fetch appointment statistics', error: error.message })
  }
}
