const express = require('express')
const router = express.Router()
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware')
const {
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
  markNotificationRead,
  sendStaffNotification,
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
} = require('../controllers/workflow.controllers')
const {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventory.controllers')
const { getReports } = require('../controllers/reports.controllers')
const { getReferrals, createReferral, updateReferral } = require('../controllers/internalReferral.controllers')
const { createReminder, getReminders, updateReminderStatus } = require('../controllers/medicationReminder.controllers')

const scaffold = (feature) => (req, res) => {
  res.status(501).json({
    ok: false,
    feature,
    message: `${feature} endpoint is scaffolded; implementation is pending.`
  })
}

const guarded = (roles, feature) => [authMiddleware, roleMiddleware(...roles), scaffold(feature)]

router.get('/hospitals', listHospitals)
router.get('/hospitals/:hospitalId/departments', listDepartments)
router.get('/doctors', listDoctors)
router.get('/appointments', authMiddleware, roleMiddleware('patient', 'doctor', 'admin', 'receptionist'), (req, res) => req.user.role === 'patient' ? getMyAppointments(req, res) : getRoleAppointments(req, res))
router.post('/appointments', authMiddleware, roleMiddleware('patient'), createPatientAppointment)
router.post('/appointments/approve', authMiddleware, roleMiddleware('doctor', 'admin', 'receptionist'), approveAppointment)
router.post('/appointments/reject', authMiddleware, roleMiddleware('doctor', 'admin', 'receptionist'), rejectAppointment)
router.post('/appointments/check-in', authMiddleware, roleMiddleware('admin', 'receptionist'), checkInAppointment)

router.get('/consultations', authMiddleware, roleMiddleware('doctor', 'admin', 'nurse', 'laboratory', 'pharmacy'), listConsultations)
router.post('/consultations', authMiddleware, roleMiddleware('doctor'), createConsultation)
router.get('/nursing-assessments', authMiddleware, roleMiddleware('doctor', 'admin', 'nurse'), listNursingAssessments)
router.post('/nursing-assessments', authMiddleware, roleMiddleware('nurse'), createNursingAssessment)

router.get('/lab-requests', authMiddleware, roleMiddleware('doctor', 'admin', 'laboratory'), listLabRequests)
router.post('/lab-requests', authMiddleware, roleMiddleware('doctor'), createLabRequest)
router.patch('/lab-requests/:id/result', authMiddleware, roleMiddleware('laboratory'), submitLabResult)

router.get('/pharmacy/dispenses', authMiddleware, roleMiddleware('pharmacy', 'admin', 'doctor'), listDispenses)
router.post('/pharmacy/dispenses', authMiddleware, roleMiddleware('pharmacy'), dispensePrescription)
router.get('/inventory', authMiddleware, roleMiddleware('pharmacy', 'admin'), getInventory)
router.post('/inventory', authMiddleware, roleMiddleware('pharmacy', 'admin'), createInventoryItem)
router.patch('/inventory/:id', authMiddleware, roleMiddleware('pharmacy', 'admin'), updateInventoryItem)
router.delete('/inventory/:id', authMiddleware, roleMiddleware('pharmacy', 'admin'), deleteInventoryItem)

router.get('/queue', authMiddleware, roleMiddleware('admin', 'doctor', 'nurse', 'receptionist'), listQueue)
router.patch('/queue/:id/status', authMiddleware, roleMiddleware('admin', 'doctor', 'nurse', 'receptionist'), updateQueueStatus)
router.get('/notifications', authMiddleware, roleMiddleware('patient', 'admin', 'doctor', 'nurse', 'laboratory', 'pharmacy', 'receptionist'), listNotifications)
router.post('/notifications/message', authMiddleware, roleMiddleware('admin'), sendStaffNotification)
router.patch('/notifications/:id/read', authMiddleware, roleMiddleware('patient', 'admin', 'doctor', 'nurse', 'laboratory', 'pharmacy', 'receptionist'), markNotificationRead)

router.post('/patients/register', authMiddleware, roleMiddleware('admin', 'doctor', 'nurse', 'receptionist'), registerPatient)
router.get('/reports', authMiddleware, roleMiddleware('admin', 'doctor', 'nurse', 'laboratory', 'pharmacy'), getReports)
router.get('/referrals', authMiddleware, roleMiddleware('admin', 'doctor'), getReferrals)
router.post('/referrals', authMiddleware, roleMiddleware('admin', 'doctor'), createReferral)
router.patch('/referrals/:id', authMiddleware, roleMiddleware('admin', 'doctor'), updateReferral)
router.post('/medication-reminders', authMiddleware, roleMiddleware('patient'), createReminder)
router.get('/medication-reminders', authMiddleware, roleMiddleware('patient', 'nurse', 'admin'), getReminders)
router.patch('/medication-reminders/:id/status', authMiddleware, roleMiddleware('patient', 'nurse', 'admin'), updateReminderStatus)
router.patch('/hospital/profile', authMiddleware, roleMiddleware('admin'), updateHospitalProfile)
router.get('/hospital/profile', authMiddleware, roleMiddleware('admin'), getHospitalProfile)
router.post('/hospital/departments', authMiddleware, roleMiddleware('admin'), createDepartment)
router.patch('/hospital/departments/:id', authMiddleware, roleMiddleware('admin'), updateDepartment)
router.delete('/hospital/departments/:id', authMiddleware, roleMiddleware('admin'), deleteDepartment)

module.exports = router