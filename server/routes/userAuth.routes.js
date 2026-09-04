const express = require('express')
const router = express.Router()
const { registerUser, loginUser, registerPatient } = require('../controllers/userAuth.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')
const { createStaff, createHospitalPatient } = require('../controllers/adminWorkflow.controllers')
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: { success: false, message: 'Too many login attempts. Please try again later.' }
})

router.post('/register', registerUser)
router.post('/login', loginLimiter, loginUser)
router.post('/patient/register', registerPatient)
router.post('/staff', authMiddleware, requireRole('admin'), createStaff)
router.post('/hospital-patient', authMiddleware, requireRole('admin'), createHospitalPatient)

module.exports = router
