const express = require('express')
const router = express.Router()
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  getAppointmentStats
} = require('../controllers/appointment.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

// Patient booking an appointment
router.post('/', authMiddleware, requireRole('patient', 'admin'), createAppointment)

// Get appointments for a specific patient
router.get('/patient/:patientId', authMiddleware, getPatientAppointments)

// Get appointments for a specific doctor
router.get('/doctor/:doctorId', authMiddleware, getDoctorAppointments)

// Get all appointments for hospital (admin/staff view)
router.get('/', authMiddleware, requireRole('admin', 'nurse', 'receptionist', 'doctor', 'patient'), getAllAppointments)

// Get appointment statistics
router.get('/stats', authMiddleware, requireRole('admin', 'receptionist'), getAppointmentStats)

// Update appointment status
router.put('/:id/status', authMiddleware, requireRole('admin', 'doctor', 'nurse', 'receptionist'), updateAppointmentStatus)

// Reschedule appointment
router.put('/:id/reschedule', authMiddleware, requireRole('admin', 'doctor', 'nurse', 'receptionist', 'patient'), rescheduleAppointment)

// Cancel appointment
router.delete('/:id', authMiddleware, requireRole('admin', 'doctor', 'patient', 'receptionist'), cancelAppointment)

module.exports = router
