const Prescription = require('../models/prescription.models')
const User = require('../models/user.models')
const Appointment = require('../models/appointment.models')

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const createPrescription = async (req, res) => {
  try {
    const { patient, doctor, appointment, drugName, dosage, instructions, status, paymentStatus } = req.body || {}

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient is required' })
    }

    if (!drugName || !String(drugName).trim()) {
      return res.status(400).json({ success: false, message: 'Drug name is required' })
    }

    if (!dosage || !String(dosage).trim()) {
      return res.status(400).json({ success: false, message: 'Dosage is required' })
    }

    const role = normalizeRole(req.user?.role)
    const doctorId = req.user && (role === 'doctor' || role === 'admin') ? req.user._id : doctor

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor is required' })
    }

    const patientDoc = await User.findById(patient)
    if (!patientDoc) {
      return res.status(404).json({ success: false, message: 'Patient not found' })
    }

    const doctorDoc = await User.findById(doctorId)
    if (!doctorDoc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' })
    }

    if (appointment) {
      const appointmentDoc = await Appointment.findById(appointment)
      if (!appointmentDoc) {
        return res.status(404).json({ success: false, message: 'Appointment not found' })
      }
    }

    const prescription = new Prescription({
      patient,
      doctor: doctorId,
      appointment: appointment || null,
      drugName: String(drugName).trim(),
      dosage: String(dosage).trim(),
      instructions: instructions ? String(instructions).trim() : '',
      status: status || 'unpaid',
      paymentStatus: paymentStatus || 'pending'
    })

    const savedPrescription = await prescription.save()

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription: savedPrescription
    })
  } catch (error) {
    console.error('createPrescription error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create prescription' })
  }
}

const getPrescriptions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    let filter = {}
    const role = normalizeRole(req.user.role)

    if (role === 'patient') {
      filter.patient = req.user._id
    } else if (role === 'doctor') {
      filter.doctor = req.user._id
    } else if (role === 'admin') {
      filter = {}
    } else if (role === 'pharmacy') {
      filter.status = { $in: ['unpaid', 'paid', 'dispensed'] }
    }

    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 })
      .populate('patient', 'name email role')
      .populate('doctor', 'name email role')
      .populate('appointment')
      .lean()

    return res.status(200).json({
      success: true,
      prescriptions
    })
  } catch (error) {
    console.error('getPrescriptions error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch prescriptions' })
  }
}

module.exports = {
  createPrescription,
  getPrescriptions
}
