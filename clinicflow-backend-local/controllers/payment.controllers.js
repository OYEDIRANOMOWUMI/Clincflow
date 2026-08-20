const Payment = require('../models/payment.models')
const Prescription = require('../models/prescription.models')
const User = require('../models/user.models')

const createPaymentCheckout = async (req, res) => {
  try {
    const {
      prescriptionId,
      patientId,
      amount,
      paymentMethod,
      cardName,
      cardNumber,
      expiry,
      cvv
    } = req.body || {}

    if (!prescriptionId) {
      return res.status(400).json({ success: false, message: 'Prescription is required' })
    }

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient is required' })
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' })
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' })
    }

    const patient = await User.findById(patientId)
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' })
    }

    const prescription = await Prescription.findById(prescriptionId)
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' })
    }

    if (String(prescription.patient) !== String(patientId)) {
      return res.status(400).json({ success: false, message: 'Prescription does not belong to this patient' })
    }

    const paymentPayload = {
      patient: patientId,
      prescription: prescriptionId,
      amount: Number(amount),
      status: 'paid',
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'card',
      cardName: cardName ? String(cardName).trim() : '',
      cardNumber: cardNumber ? String(cardNumber).trim().slice(-4) : '',
      expiry: expiry ? String(expiry).trim() : '',
      cvv: cvv ? String(cvv).trim() : ''
    }

    const payment = await Payment.create(paymentPayload)
    prescription.status = 'paid'
    prescription.paymentStatus = 'paid'
    prescription.updatedAt = new Date()
    await prescription.save()

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate
      }
    })
  } catch (error) {
    console.error('createPaymentCheckout error:', error)
    return res.status(500).json({ success: false, message: 'Unable to process payment' })
  }
}

const getPaymentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params || {}

    if (!req.user && !patientId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const targetPatientId = patientId || req.user._id

    const payments = await Payment.find({ patient: targetPatientId })
      .populate('prescription')
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, payments })
  } catch (error) {
    console.error('getPaymentsForPatient error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load payment history' })
  }
}

module.exports = {
  createPaymentCheckout,
  getPaymentsForPatient
}
