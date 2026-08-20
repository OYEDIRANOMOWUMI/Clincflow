const express = require('express')
const router = express.Router()
const { getPatients, updatePatientRecord } = require('../controllers/patient.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'admin', 'patient'), getPatients)
router.put('/:id', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'admin'), updatePatientRecord)

module.exports = router
