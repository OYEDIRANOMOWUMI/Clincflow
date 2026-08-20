const express = require('express')
const router = express.Router()
const {
  setDoctorAvailability,
  getDoctorAvailability,
  getAllAvailability
} = require('../controllers/availability.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.post('/doctor', authMiddleware, requireRole('doctor'), setDoctorAvailability)
router.get('/doctor', authMiddleware, requireRole('doctor'), getDoctorAvailability)
router.get('/admin', authMiddleware, requireRole('admin'), getAllAvailability)

module.exports = router
