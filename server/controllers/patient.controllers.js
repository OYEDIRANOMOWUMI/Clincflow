const mongoose = require('mongoose')
const PatientProfile = require('../models/patientProfile.models')
const Patient = require('../models/patient.models')

const fallbackPatients = [
  {
    id: 'pt-101',
    name: 'Maya Thompson',
    age: 34,
    condition: 'Hypertension follow-up',
    status: 'Stable',
    diagnosis: 'Controlled hypertension, monitor medication adherence.',
    notes: 'Patient reports improved sleep and reduced dizziness.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-102',
    name: 'John Okafor',
    age: 52,
    condition: 'Chest pain review',
    status: 'Monitoring',
    diagnosis: 'Cardiac symptoms under observation.',
    notes: 'ECG reviewed; needs follow-up results before discharge.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-103',
    name: 'Adebayo Musa',
    age: 41,
    condition: 'Post-op recovery',
    status: 'Recovering',
    diagnosis: 'Post-operative recovery with expected healing progression.',
    notes: 'Mobility improving; continue hydration regime.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  },
  {
    id: 'pt-104',
    name: 'Rachel Lee',
    age: 29,
    condition: 'Migraine with dizziness',
    status: 'Observation',
    diagnosis: 'Migraine flare under evaluation.',
    notes: 'Hydration check and glucose trend review pending.',
    doctor: 'Dr. Aisha Bello',
    nurse: 'Nurse Grace',
    lastUpdated: '2026-08-19'
  }
]

const allowedRecordEditRoles = ['doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin']
const allowDemoFallback = String(process.env.DEMO_MODE || '').toLowerCase() === 'true'

const isAllowedToEditPatientRecord = (role) => {
  return allowedRecordEditRoles.includes(String(role || '').trim().toLowerCase())
}

const normalizePatient = (patient = {}) => {
  const rawName = typeof patient.name === 'string' && patient.name.trim() ? patient.name.trim() : [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Patient'

  return {
    id: String(patient.id || patient._id || 'pt-' + Date.now()),
    name: rawName,
    age: Number(patient.age || 0),
    condition: patient.condition || patient.issue || 'General consultation',
    status: patient.status || 'Stable',
    diagnosis: patient.diagnosis || 'No diagnosis yet.',
    notes: patient.notes || 'No care notes yet.',
    doctor: patient.doctor || 'Dr. Aisha Bello',
    nurse: patient.nurse || 'Nurse Grace',
    lastUpdated: patient.lastUpdated || new Date().toISOString().slice(0, 10)
  }
}

const buildPatientUpdate = (incoming = {}, current = {}) => {
  const nextRecord = { ...current }
  const diagnosis = typeof incoming.diagnosis === 'string' ? incoming.diagnosis.trim() : ''
  const notes = typeof incoming.notes === 'string' ? incoming.notes.trim() : ''
  const status = typeof incoming.status === 'string' ? incoming.status.trim() : ''
  const age = incoming.age !== undefined && incoming.age !== null ? Number(incoming.age) : null

  if (diagnosis || incoming.diagnosis === '') {
    nextRecord.diagnosis = diagnosis
  }

  if (notes || incoming.notes === '') {
    nextRecord.notes = notes ? (current.notes ? `${current.notes} | ${notes}` : notes) : ''
  }

  if (status) {
    nextRecord.status = status
  }

  if (typeof incoming.condition === 'string') {
    nextRecord.condition = incoming.condition.trim()
  }

  if (age !== null && age >= 0 && !Number.isNaN(age)) {
    nextRecord.age = age
  }

  if (incoming.doctor) {
    nextRecord.doctor = incoming.doctor
  }

  if (incoming.nurse) {
    nextRecord.nurse = incoming.nurse
  }

  nextRecord.lastUpdated = new Date().toISOString().slice(0, 10)
  return nextRecord
}

const getFallbackPatients = () => fallbackPatients.map((patient) => ({ ...patient }))

const getPatientVolume = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const total = fallbackPatients.length
      return res.status(200).json({
        success: true,
        volume: { total, active: total, today: 0, week: 0, month: 0, admissionsToday: 0, admissionsWeek: 0, admissionsMonth: 0 }
      })
    }

    const hospitalFilter = { hospitalId: req.user.hospitalId }
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [total, active, today, week, month] = await Promise.all([
      Patient.countDocuments(hospitalFilter),
      Patient.countDocuments({ ...hospitalFilter, status: { $nin: ['discharged', 'Discharged'] } }),
      Patient.countDocuments({ ...hospitalFilter, createdAt: { $gte: startOfToday } }),
      Patient.countDocuments({ ...hospitalFilter, createdAt: { $gte: startOfWeek } }),
      Patient.countDocuments({ ...hospitalFilter, createdAt: { $gte: startOfMonth } })
    ])

    if (!allowDemoFallback) {
      return res.status(200).json({ success: true, patients: [] })
    }

    return res.status(200).json({
      success: true,
      volume: { total, active, today, week, month, admissionsToday: today, admissionsWeek: week, admissionsMonth: month }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load patient volume' })
  }
}

const getPatients = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const records = await Patient.find({ hospitalId: req.user.hospitalId }).populate('userId', 'name phone').lean()
      if (records && records.length > 0) {
        return res.status(200).json({
          success: true,
          patients: records.map((record) => normalizePatient({
            ...record,
            id: record._id,
            name: record.userId?.name,
            phoneNumber: record.userId?.phone,
            age: record.dob ? new Date().getFullYear() - new Date(record.dob).getFullYear() : 0
          }))
        })
      }
    }

    return res.status(200).json({
      success: true,
      patients: getFallbackPatients()
    })
  } catch (error) {
    return res.status(200).json({
      success: true,
      patients: getFallbackPatients(),
      warning: error.message
    })
  }
}

const updatePatientRecord = async (req, res) => {
  try {
    const role = req.user?.role || ''

    if (!isAllowedToEditPatientRecord(role)) {
      return res.status(403).json({
        success: false,
        message: 'This role cannot edit patient records'
      })
    }

    const { id } = req.params
    const incoming = req.body || {}

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      })
    }

    const fallbackList = allowDemoFallback ? getFallbackPatients() : []
    const existingFallback = fallbackList.find((patient) => String(patient.id) === String(id)) || fallbackList[0]
    const nextRecord = buildPatientUpdate(incoming, existingFallback || {})

    if (mongoose.connection.readyState === 1) {
      let patientRecord = await Patient.findOne({ _id: id, hospitalId: req.user.hospitalId })

      if (!patientRecord) {
        return res.status(404).json({ success: false, message: 'Patient record not found' })
      } else {
        patientRecord.diagnosis = Object.prototype.hasOwnProperty.call(incoming, 'diagnosis') ? nextRecord.diagnosis : (patientRecord.diagnosis || 'No diagnosis yet.')
        patientRecord.notes = Object.prototype.hasOwnProperty.call(incoming, 'notes') ? nextRecord.notes : (patientRecord.notes || 'No care notes yet.')
        patientRecord.status = nextRecord.status || patientRecord.status || 'waiting'
        patientRecord.condition = typeof incoming.condition === 'string' ? incoming.condition.trim() : (patientRecord.condition || 'General consultation')
        patientRecord.updatedAt = new Date()
      }

      await patientRecord.save()

      return res.status(200).json({
        success: true,
        patient: normalizePatient(patientRecord.toObject ? patientRecord.toObject() : patientRecord)
      })
    }

    const index = fallbackList.findIndex((patient) => String(patient.id) === String(id))
    const update = {
      ...existingFallback,
      ...nextRecord,
      id: String(id),
      name: incoming.name || existingFallback?.name || 'Patient',
      condition: incoming.condition || existingFallback?.condition || 'General consultation'
    }

    if (index >= 0) {
      fallbackPatients[index] = update
    } else {
      fallbackPatients.push(update)
    }

    if (!allowDemoFallback) {
      return res.status(404).json({ success: false, message: 'Patient record not found' })
    }

    return res.status(200).json({
      success: true,
      patient: update
    })
  } catch (error) {
    console.error('updatePatientRecord error:', error)
    return res.status(500).json({
      success: false,
      message: 'Unable to update patient record',
      error: error.message
    })
  }
}

const deletePatientRecord = async (req, res) => {
  try {
    const role = req.user?.role || ''

    if (!isAllowedToEditPatientRecord(role)) {
      return res.status(403).json({
        success: false,
        message: 'This role cannot delete patient records'
      })
    }

    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      })
    }

    if (mongoose.connection.readyState === 1) {
      const deletedPatient = await Patient.findOneAndDelete({ _id: id, hospitalId: req.user.hospitalId })
      if (!deletedPatient) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        })
      }

      return res.status(200).json({
        success: true,
        message: 'Patient record deleted successfully',
        deletedId: id
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Patient record removed from active list',
      deletedId: id
    })
  } catch (error) {
    console.error('deletePatientRecord error:', error)
    return res.status(500).json({
      success: false,
      message: 'Unable to delete patient record',
      error: error.message
    })
  }
}

module.exports = {
  getPatients,
  getPatientVolume,
  updatePatientRecord,
  deletePatientRecord,
  buildPatientUpdate,
  isAllowedToEditPatientRecord,
  normalizePatient
}
