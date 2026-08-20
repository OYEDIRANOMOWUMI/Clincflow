const express = require('express')
const router = express.Router()
const { createAppointment, getPatientAppointments } = require('../controllers/user.contollers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.get('/', (req, res) => {
  res.render('form')
})

router.post('/appointment', createAppointment)
router.get('/appointments', authMiddleware, requireRole('patient', 'doctor', 'admin'), getPatientAppointments)

module.exports = router
