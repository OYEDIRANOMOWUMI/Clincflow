const express = require('express')
const router = express.Router()
const { getPatients, getPatientVolume, updatePatientRecord, deletePatientRecord } = require('../controllers/patient.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'), getPatients)
router.get('/stats/volume', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'), getPatientVolume)
router.put('/:id', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'), updatePatientRecord)
router.delete('/:id', authMiddleware, requireRole('doctor', 'nurse', 'pharmacy', 'laboratory', 'receptionist', 'admin'), deletePatientRecord)

module.exports = router
