const Prescription = require('../models/prescription.models')
const Payment = require('../models/payment.models')

const getInvoices = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const filter = isAdmin
      ? { hospitalId: req.user.hospitalId }
      : { hospitalId: req.user.hospitalId, patient: req.user._id }

    if (!filter.hospitalId || (!isAdmin && !filter.patient)) {
      return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    const prescriptionIds = prescriptions.map((item) => item._id)
    const payments = await Payment.find({ prescription: { $in: prescriptionIds } })
      .sort({ createdAt: -1 })
      .lean()

    const latestPaymentByPrescription = new Map()
    payments.forEach((payment) => {
      const key = String(payment.prescription)
      if (!latestPaymentByPrescription.has(key)) latestPaymentByPrescription.set(key, payment)
    })

    const invoices = prescriptions.map((prescription) => {
      const payment = latestPaymentByPrescription.get(String(prescription._id))
      return {
        id: prescription._id,
        prescriptionId: prescription._id,
        invoiceNumber: `INV-${String(prescription._id).slice(-8).toUpperCase()}`,
        patient: prescription.patient,
        doctor: prescription.doctor,
        medications: prescription.medications || [{ name: prescription.drugName, dose: prescription.dosage, frequency: '', duration: '', quantity: 1 }],
        amount: Number(payment?.amount || prescription.amount || 0),
        status: payment?.status === 'paid' || prescription.paymentStatus === 'paid' || prescription.status === 'paid' ? 'paid' : 'unpaid',
        paymentMethod: payment?.paymentMethod || null,
        issuedAt: prescription.createdAt,
        paidAt: payment?.paymentDate || null
      }
    })

    const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const totalPaid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
    return res.json({ success: true, invoices, summary: { total: invoices.length, paid: invoices.filter((invoice) => invoice.status === 'paid').length, unpaid: invoices.filter((invoice) => invoice.status !== 'paid').length, totalBilled, totalPaid, outstanding: totalBilled - totalPaid } })
  } catch (error) {
    console.error('getInvoices error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load invoices' })
  }
}

module.exports = { getInvoices }
