const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const Appointment = require('../models/appointment.models')
const Department = require('../models/department.models')
const Hospital = require('../models/hospital.models')
const Patient = require('../models/patient.models')
const User = require('../models/user.models')
const ConsultationRecord = require('../models/consultationRecord.models')
const NursingAssessment = require('../models/nursingAssessment.models')
const LabRequest = require('../models/labRequest.models')
const Prescription = require('../models/prescription.models')
const PharmacyDispense = require('../models/pharmacyDispense.models')
const MedicationReminder = require('../models/medicationReminder.models')
const Notification = require('../models/notification.models')
const AuditLog = require('../models/auditLog.models')

const createReferenceCode = () => `CF-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getPatientProfile = async (userId) => Patient.findOne({ userId }).lean()

const notify = (userId, type, message) => Notification.create({ userId, type, message })
const audit = (req, action, targetType, targetId) => AuditLog.create({
  userId: req.user._id,
  action,
  targetType,
  targetId
})

const updateAppointmentStatus = async (req, res, status) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.body?.appointmentId, hospitalId: req.user.hospitalId })
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })
    appointment.status = status
    await appointment.save()
    await notify(appointment.patient, `appointment_${status.toLowerCase()}`, `Your appointment ${appointment.referenceCode || ''} is ${status}.`)
    await audit(req, `Appointment ${status}`, 'Appointment', appointment._id)
    return res.json({ success: true, appointment })
  } catch (error) {
    return res.status(500).json({ success: false, message: `Unable to mark appointment ${status.toLowerCase()}` })
  }
}

const approveAppointment = (req, res) => updateAppointmentStatus(req, res, 'Approved')
const rejectAppointment = (req, res) => updateAppointmentStatus(req, res, 'Rejected')
const checkInAppointment = (req, res) => updateAppointmentStatus(req, res, 'Checked-in')

const createNursingAssessment = async (req, res) => {
  try {
    const { appointmentId, temperature, bloodPressure, pulse, respiratoryRate, oxygenSaturation, weight, height, notes } = req.body || {}
    const appointment = await Appointment.findOne({ _id: appointmentId, hospitalId: req.user.hospitalId })
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })
    const patient = appointment.patientId || (await Patient.findOne({ userId: appointment.patient }))?._id
    const assessment = await NursingAssessment.create({ patientId: patient, appointmentId, nurseId: req.user._id, temperature, bloodPressure, pulse, respiratoryRate, oxygenSaturation, weight, height, notes })
    appointment.status = 'Waiting'
    await appointment.save()
    await audit(req, 'Created nursing assessment', 'NursingAssessment', assessment._id)
    return res.status(201).json({ success: true, assessment })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to save nursing assessment' })
  }
}

const createConsultation = async (req, res) => {
  try {
    const { appointmentId, chiefComplaint, symptoms, examinationFindings, diagnosis, treatmentPlan, notes, followUpInstructions } = req.body || {}
    const appointment = await Appointment.findOne({ _id: appointmentId, hospitalId: req.user.hospitalId })
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })
    const assessment = await NursingAssessment.findOne({ appointmentId }).lean()
    const patientId = appointment.patientId || (await Patient.findOne({ userId: appointment.patient }))?._id
    const record = await ConsultationRecord.create({ appointmentId, patientId, doctorId: req.user._id, chiefComplaint, symptoms, examinationFindings, vitalsRef: assessment?._id, diagnosis, treatmentPlan, notes, followUpInstructions, createdBy: req.user._id, updatedBy: req.user._id })
    appointment.status = 'In Consultation'
    await appointment.save()
    if (followUpInstructions) await notify(appointment.patient, 'follow_up_scheduled', `Follow-up instructions: ${followUpInstructions}`)
    await audit(req, 'Created consultation record', 'ConsultationRecord', record._id)
    return res.status(201).json({ success: true, record })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to save consultation' })
  }
}

const createLabRequest = async (req, res) => {
  try {
    const { appointmentId, patientId, test, reason, priority, instructions } = req.body || {}
    const appointment = appointmentId ? await Appointment.findOne({ _id: appointmentId, hospitalId: req.user.hospitalId }).lean() : null
    const resolvedPatient = patientId || appointment?.patientId
    if (!resolvedPatient || !test) return res.status(400).json({ success: false, message: 'patientId and test are required' })
    const patientProfile = await Patient.findById(resolvedPatient).lean()
    const request = await LabRequest.create({ hospitalId: appointment?.hospitalId || req.user.hospitalId, patientId: resolvedPatient, patient: patientProfile?.userId || appointment?.patient, doctorId: req.user._id, requestedBy: req.user._id, test, testType: test, reason, notes: instructions, priority, submittedBy: req.user._id })
    await audit(req, 'Created lab request', 'LabRequest', request._id)
    return res.status(201).json({ success: true, request })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create lab request' })
  }
}

const submitLabResult = async (req, res) => {
  try {
    const request = await LabRequest.findOneAndUpdate({ _id: req.params.id, hospitalId: req.user.hospitalId }, { result: String(req.body?.result || '').trim(), status: 'completed' }, { new: true })
    if (!request) return res.status(404).json({ success: false, message: 'Lab request not found' })
    await notify(request.doctorId || request.requestedBy, 'new_lab_result', 'A laboratory result is ready for review.')
    await audit(req, 'Submitted lab result', 'LabRequest', request._id)
    return res.json({ success: true, request })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to submit lab result' })
  }
}

const createWorkflowPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications } = req.body || {}
    if (!patientId || !Array.isArray(medications) || medications.length === 0) return res.status(400).json({ success: false, message: 'patientId and medications are required' })
    const first = medications[0]
    const appointment = appointmentId ? await Appointment.findOne({ _id: appointmentId, hospitalId: req.user.hospitalId }).lean() : null
    const prescription = await Prescription.create({ hospitalId: appointment?.hospitalId || req.user.hospitalId, patientId, patient: (await Patient.findById(patientId).lean())?.userId, doctorId: req.user._id, doctor: req.user._id, appointment: appointmentId || null, medications, drugName: first.name, dosage: first.dose, instructions: first.frequency })
    await notify(prescription.patient, 'new_prescription', 'A new prescription is available for dispensing.')
    await audit(req, 'Created prescription', 'Prescription', prescription._id)
    return res.status(201).json({ success: true, prescription })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create prescription' })
  }
}

const dispensePrescription = async (req, res) => {
  try {
    const { prescriptionId, quantityDispensed, status } = req.body || {}
    const prescription = await Prescription.findOne({ _id: prescriptionId, hospitalId: req.user.hospitalId }).lean()
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' })
    const dispense = await PharmacyDispense.create({ prescriptionId, pharmacistId: req.user._id, quantityDispensed, status })
    await Prescription.findOneAndUpdate({ _id: prescriptionId, hospitalId: req.user.hospitalId }, { status: 'dispensed' })
    const medications = prescription.medications || []
    await MedicationReminder.insertMany(medications.map((medication) => ({ patientId: prescription.patientId, prescriptionId, medicationName: medication.name, frequency: medication.frequency, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), reminderTimes: [], status: 'active' })))
    await notify(prescription.patient, 'medication_reminder', 'Medication reminders have been created for your prescription.')
    await audit(req, 'Dispensed prescription', 'PharmacyDispense', dispense._id)
    return res.status(201).json({ success: true, dispense })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to dispense prescription' })
  }
}

const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
  return res.json({ success: true, notifications })
}

const sendStaffNotification = async (req, res) => {
  try {
    const { recipientId, message } = req.body || {}
    if (!recipientId || !message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'recipientId and message are required' })
    }

    const recipient = await User.findOne({ _id: recipientId, hospitalId: req.user.hospitalId, role: { $in: ['doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist'] } }).lean()
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Staff member not found in this hospital' })
    }

    const notification = await Notification.create({
      userId: recipient._id,
      type: 'admin_message',
      message: `${req.user.name || 'Hospital Admin'}: ${String(message).trim()}`
    })

    return res.status(201).json({ success: true, notification })
  } catch (error) {
    console.error('sendStaffNotification error:', error)
    return res.status(500).json({ success: false, message: 'Unable to send message to staff' })
  }
}

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true }, { new: true })
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' })
  return res.json({ success: true, notification })
}

const listScoped = (Model, key, roles = [], select = '') => async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : roles.includes(req.user.role)
        ? { [key]: req.user._id }
        : { _id: null }
    const records = await Model.find(filter).select(select).sort({ createdAt: -1 }).lean()
    return res.json({ success: true, records })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load records' })
  }
}

const listConsultations = listScoped(ConsultationRecord, 'doctorId', ['doctor'], 'appointmentId patientId doctorId diagnosis treatmentPlan followUpInstructions createdAt updatedAt')
const listNursingAssessments = listScoped(NursingAssessment, 'nurseId', ['nurse'], 'patientId appointmentId nurseId temperature bloodPressure pulse respiratoryRate oxygenSaturation weight height notes createdAt updatedAt')
const listLabRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : req.user.role === 'doctor' ? { doctorId: req.user._id } : { hospitalId: req.user.hospitalId }
    const records = await LabRequest.find(filter).select('patientId doctorId test reason priority status result submittedBy createdAt updatedAt').sort({ createdAt: -1 }).lean()
    return res.json({ success: true, records })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load lab requests' })
  }
}
const listDispenses = listScoped(PharmacyDispense, 'pharmacistId', ['pharmacy'], 'prescriptionId pharmacistId quantityDispensed status dispensedAt createdAt updatedAt')
const listPrescriptions = listScoped(Prescription, 'doctorId', ['doctor'], 'patientId doctorId medications status appointment createdAt updatedAt')
const listQueue = async (req, res) => {
  try {
    const queue = await Appointment.find({ hospitalId: req.user.hospitalId, status: { $in: ['Checked-in', 'Waiting', 'In Consultation'] } }).sort({ date: 1, time: 1 }).lean()
    return res.json({ success: true, queue })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load queue' })
  }
}

const updateQueueStatus = async (req, res) => {
  const allowedStatuses = ['Checked-in', 'Waiting', 'In Consultation', 'Completed', 'No-show']
  if (!allowedStatuses.includes(req.body?.status)) return res.status(400).json({ success: false, message: 'Invalid queue status' })
  const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, hospitalId: req.user.hospitalId }, { status: req.body.status }, { new: true })
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })
  await audit(req, `Queue status changed to ${appointment.status}`, 'Appointment', appointment._id)
  return res.json({ success: true, appointment })
}

const registerPatient = async (req, res) => {
  try {
    const { name, email, phone = '', password } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'name, email, and password are required' })
    const normalizedEmail = String(email).trim().toLowerCase()
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'Email already exists' })
    const hospitalId = req.user?.hospitalId
    if (!hospitalId) return res.status(400).json({ success: false, message: 'Hospital context is required' })
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: String(phone).trim(), password: await bcrypt.hash(String(password), 10), role: 'patient', hospitalId })
    const sequence = (await Patient.countDocuments({ hospitalId })) + 1
    const patient = await Patient.create({ userId: user._id, hospitalId, patientId: `CF-PAT-${String(sequence).padStart(6, '0')}` })
    await audit(req, 'Registered patient', 'Patient', patient._id)
    return res.status(201).json({ success: true, patient: { id: patient._id, patientId: patient.patientId, userId: user._id, name: user.name, email: user.email } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to register patient' })
  }
}

const listHospitals = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().slice(0, 100)
    const safeSearch = escapeRegex(search)
    const filter = safeSearch ? { $or: [
      { name: new RegExp(safeSearch, 'i') },
      { state: new RegExp(safeSearch, 'i') },
      { lga: new RegExp(safeSearch, 'i') }
    ] } : {}

    const hospitals = await Hospital.find(filter)
      .select('name type address state lga departments services operatingHours email phone contactLine')
      .sort({ name: 1 })
      .lean()

    return res.json({ success: true, hospitals })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load hospitals' })
  }
}

const updateHospitalProfile = async (req, res) => {
  try {
    const { name, address, email, phone, contactLine } = req.body || {}
    const hospitalId = req.user?.hospitalId

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Hospital context is required' })
    }

    const nextPayload = {
      ...(name ? { name: String(name).trim() } : {}),
      ...(address !== undefined ? { address: String(address).trim() } : {}),
      ...(email ? { email: String(email).trim().toLowerCase() } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
      ...(contactLine !== undefined ? { contactLine: String(contactLine).trim() } : {})
    }

    if (!Object.keys(nextPayload).length) {
      return res.status(400).json({ success: false, message: 'No profile fields were provided' })
    }

    const hospital = await Hospital.findByIdAndUpdate(hospitalId, nextPayload, { new: true }).lean()
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' })
    }

    if (email || phone || contactLine) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(email ? { email: String(email).trim().toLowerCase() } : {}),
        ...(phone !== undefined ? { hospitalPhone: String(phone).trim() } : {}),
        ...(contactLine !== undefined ? { contactLine: String(contactLine).trim() } : {})
      })
    }

    return res.json({ success: true, hospital })
  } catch (error) {
    console.error('updateHospitalProfile error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update hospital profile' })
  }
}

const getHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Hospital context is required' })
    }

    const hospital = await Hospital.findById(hospitalId)
      .select('name type address state lga departments services operatingHours email phone contactLine')
      .lean()

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' })
    }

    return res.json({ success: true, hospital })
  } catch (error) {
    console.error('getHospitalProfile error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load hospital profile' })
  }
}

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body || {}
    const hospitalId = req.user?.hospitalId

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Hospital context is required' })
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' })
    }

    const department = await Department.create({
      hospitalId,
      name: String(name).trim(),
      description: String(description || '').trim()
    })

    await Hospital.findByIdAndUpdate(hospitalId, { $addToSet: { departments: department._id } })

    return res.status(201).json({ success: true, department })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A department with this name already exists for this hospital' })
    }
    console.error('createDepartment error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create department' })
  }
}

const updateDepartment = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId
    const { id } = req.params
    const { name, description } = req.body || {}

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Hospital context is required' })
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Department id is required' })
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, hospitalId },
      {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description: String(description).trim() } : {})
      },
      { new: true }
    )

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    return res.json({ success: true, department })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A department with this name already exists for this hospital' })
    }
    console.error('updateDepartment error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update department' })
  }
}

const deleteDepartment = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId
    const { id } = req.params

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Hospital context is required' })
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Department id is required' })
    }

    const department = await Department.findOneAndDelete({ _id: id, hospitalId })

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' })
    }

    await Hospital.findByIdAndUpdate(hospitalId, { $pull: { departments: department._id } })

    return res.json({ success: true, message: 'Department deleted successfully', departmentId: id })
  } catch (error) {
    console.error('deleteDepartment error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete department' })
  }
}

const listDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ hospitalId: req.params.hospitalId })
      .select('name hospitalId description')
      .sort({ name: 1 })
      .lean()

    return res.json({ success: true, departments })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load departments' })
  }
}

const listDoctors = async (req, res) => {
  try {
    const filter = {
      role: 'doctor',
      isActive: true,
      ...(req.query.hospitalId ? { hospitalId: req.query.hospitalId } : {})
    }
    const doctors = await User.find(filter).select('name email phone hospitalId').sort({ name: 1 }).lean()
    return res.json({ success: true, doctors })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load doctors' })
  }
}

const createPatientAppointment = async (req, res) => {
  try {
    const { hospitalId, departmentId, doctorId, date, time, reason, notes } = req.body || {}
    if (!hospitalId || !departmentId || !doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'hospitalId, departmentId, doctorId, date, and time are required' })
    }

    const appointmentDate = new Date(date)
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ success: false, message: 'A valid appointment date is required' })
    }

    const [patient, hospital, department, doctor] = await Promise.all([
      getPatientProfile(req.user._id),
      Hospital.findById(hospitalId).lean(),
      Department.findOne({ _id: departmentId, hospitalId }).lean(),
      User.findOne({ _id: doctorId, role: 'doctor', isActive: true, ...(req.body.hospitalId ? { hospitalId } : {}) }).lean()
    ])

    if (!patient) return res.status(400).json({ success: false, message: 'Patient profile is required before booking' })
    if (!hospital || !department || !doctor) return res.status(404).json({ success: false, message: 'Selected hospital, department, or doctor was not found' })

    const appointment = await Appointment.create({
      patientId: patient._id,
      hospitalId,
      departmentId,
      doctorId,
      patient: req.user._id,
      doctor: doctor._id,
      patientName: req.user.name,
      phoneNumber: req.user.phone || '',
      department: department.name,
      issue: reason || '',
      date: appointmentDate,
      time: String(time).trim(),
      status: 'Pending',
      referenceCode: createReferenceCode(),
      reason: String(reason || '').trim(),
      notes: String(notes || '').trim()
    })

    const admins = await User.find({ hospitalId, role: 'admin', isActive: true }).select('_id').lean()
    await Promise.all([
      notify(doctor._id, 'appointment_requested', `New appointment request at ${hospital.name}, ${department.name}, ${appointment.referenceCode}.`),
      ...admins.map((admin) => notify(admin._id, 'appointment_requested', `A patient requested an appointment with ${doctor.name} in ${department.name} on ${appointmentDate.toLocaleDateString()} at ${time}.`))
    ])

    return res.status(201).json({ success: true, message: 'Appointment request submitted', appointment })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Please retry: reference code collision' })
    return res.status(500).json({ success: false, message: 'Unable to create appointment' })
  }
}

const getMyAppointments = async (req, res) => {
  try {
    const patient = await getPatientProfile(req.user._id)
    const query = patient ? { $or: [{ patientId: patient._id }, { patient: req.user._id }] } : { patient: req.user._id }
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 }).lean()
    return res.json({ success: true, appointments })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load appointments' })
  }
}

const getRoleAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'receptionist'
      ? { hospitalId: req.user.hospitalId }
      : { $or: [{ doctorId: req.user._id }, { doctor: req.user._id }] }
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 }).lean()
    return res.json({ success: true, appointments })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load appointments' })
  }
}

module.exports = {
  listHospitals,
  listDepartments,
  listDoctors,
  createPatientAppointment,
  getMyAppointments,
  getRoleAppointments,
  approveAppointment,
  rejectAppointment,
  checkInAppointment,
  createNursingAssessment,
  createConsultation,
  createLabRequest,
  submitLabResult,
  createWorkflowPrescription,
  dispensePrescription,
  listNotifications,
  sendStaffNotification,
  markNotificationRead,
  listConsultations,
  listNursingAssessments,
  listLabRequests,
  listDispenses,
  listPrescriptions,
  listQueue,
  updateQueueStatus,
  registerPatient,
  getHospitalProfile,
  updateHospitalProfile,
  createDepartment,
  updateDepartment,
  deleteDepartment
}
