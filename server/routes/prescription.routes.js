const express = require('express')
const router = express.Router()
const { createPrescription, getPrescriptions } = require('../controllers/prescription.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, requireRole('patient', 'doctor', 'admin', 'pharmacy'), getPrescriptions)
router.post('/', authMiddleware, requireRole('doctor', 'admin'), createPrescription)

module.exports = router
