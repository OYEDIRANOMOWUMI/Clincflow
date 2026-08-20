const express = require('express')
const router = express.Router()
const { createPaymentCheckout, getPaymentsForPatient } = require('../controllers/payment.controllers')
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware')

router.post('/checkout', authMiddleware, requireRole('patient'), createPaymentCheckout)
router.get('/patient/:patientId', authMiddleware, requireRole('patient', 'admin'), getPaymentsForPatient)

module.exports = router
