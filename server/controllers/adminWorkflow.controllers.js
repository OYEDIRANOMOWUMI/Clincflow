const bcrypt = require('bcryptjs')
const User = require('../models/user.models')
const Patient = require('../models/patient.models')
const AuditLog = require('../models/auditLog.models')

const staffRoles = ['doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist']

const nextPatientId = async () => {
  const latest = await Patient.findOne({}).sort({ patientId: -1 }).select('patientId').lean()
  const current = Number(latest?.patientId?.match(/\d+$/)?.[0] || 0) + 1
  return `CF-PAT-${String(current).padStart(6, '0')}`
}

const audit = (req, action, targetType, targetId) => AuditLog.create({ userId: req.user._id, action, targetType, targetId })

const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone = '' } = req.body || {}
    const hospitalId = req.user.hospitalId
    const normalizedRole = String(role || '').trim().toLowerCase()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!hospitalId) return res.status(400).json({ success: false, message: 'Admin is not linked to a hospital' })
    if (!name || !normalizedEmail || !password || !staffRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'name, email, password, and a valid staff role are required' })
    }
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'Email already exists' })

    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(String(password), 10), role: normalizedRole, phone: String(phone).trim(), hospitalId })
    await audit(req, `Added ${normalizedRole}`, 'User', user._id)
    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to add staff member' })
  }
}

const createHospitalPatient = async (req, res) => {
  try {
    const { name, email, password, phone = '', dob, sex, address, emergencyContact } = req.body || {}
    const hospitalId = req.user.hospitalId
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!hospitalId) return res.status(400).json({ success: false, message: 'Admin is not linked to a hospital' })
    if (!name || !normalizedEmail || !password) return res.status(400).json({ success: false, message: 'name, email, and password are required' })
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'Email already exists' })

    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(String(password), 10), role: 'patient', phone: String(phone).trim(), hospitalId })
    const patient = await Patient.create({ userId: user._id, hospitalId, patientId: await nextPatientId(), dob: dob || null, sex, address, emergencyContact })
    await audit(req, 'Added patient', 'Patient', patient._id)
    return res.status(201).json({ success: true, patient: { id: patient._id, patientId: patient.patientId, userId: user._id, name: user.name, email: user.email } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to add patient' })
  }
}

const listHospitalStaff = async (req, res) => {
  const users = await User.find({ hospitalId: req.user.hospitalId, role: { $in: staffRoles }, isActive: true }).select('-password -passwordHash').sort({ name: 1 }).lean()
  return res.json({ success: true, users })
}

const listHospitalPatients = async (req, res) => {
  const patients = await Patient.find({ hospitalId: req.user.hospitalId }).populate('userId', 'name email phone isActive').sort({ createdAt: -1 }).lean()
  return res.json({ success: true, patients })
}

const updateStaffStatus = async (req, res) => {
  try {
    const { isActive } = req.body || {}
    if (typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: 'isActive must be true or false' })

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId, role: { $ne: 'patient' } },
      { isActive },
      { new: true }
    ).select('-password -passwordHash')

    if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' })
    await audit(req, `${isActive ? 'Activated' : 'Deactivated'} staff account`, 'User', user._id)
    return res.json({ success: true, user })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update staff status' })
  }
}

module.exports = { createStaff, createHospitalPatient, listHospitalStaff, listHospitalPatients, updateStaffStatus }
