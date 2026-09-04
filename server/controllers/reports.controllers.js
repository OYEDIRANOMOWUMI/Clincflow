const mongoose = require('mongoose')
const Appointment = require('../models/appointment.models')
const Patient = require('../models/patient.models')
const Payment = require('../models/payment.models')
const Prescription = require('../models/prescription.models')

const parseDate = (value, fallback) => {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const monthKey = (date) => date.toISOString().slice(0, 7)

const getReports = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId
    if (!hospitalId) return res.status(400).json({ success: false, message: 'User is not linked to a hospital' })

    const endDate = parseDate(req.query.to, new Date())
    const defaultStart = new Date(endDate)
    defaultStart.setMonth(defaultStart.getMonth() - 11, 1)
    defaultStart.setHours(0, 0, 0, 0)
    const startDate = parseDate(req.query.from, defaultStart)
    if (!startDate || !endDate || startDate > endDate) {
      return res.status(400).json({ success: false, message: 'from and to must be valid dates with from before to' })
    }

    const dateRange = { $gte: startDate, $lte: endDate }
    const monthlyPatientRegistrations = await Patient.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId), createdAt: dateRange } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $project: { _id: 0, month: '$_id', count: 1 } },
      { $sort: { month: 1 } }
    ])

    const [appointmentSummary, appointmentsByStatus, monthlyAppointments, revenueSummary, monthlyRevenue] = await Promise.all([
      Appointment.aggregate([
        { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId), date: dateRange } },
        { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $in: ['$status', ['completed', 'Completed']] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $in: ['$status', ['cancelled', 'Cancelled', 'Rejected']] }, 1, 0] } } } },
        { $project: { _id: 0, total: 1, completed: 1, cancelled: 1 } }
      ]),
      Appointment.aggregate([
        { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId), date: dateRange } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
        { $sort: { status: 1 } }
      ]),
      Appointment.aggregate([
        { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId), date: dateRange } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, count: { $sum: 1 } } },
        { $project: { _id: 0, month: '$_id', count: 1 } },
        { $sort: { month: 1 } }
      ]),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $lookup: { from: Prescription.collection.name, localField: 'prescription', foreignField: '_id', as: 'prescriptionRecord' } },
        { $unwind: '$prescriptionRecord' },
        { $match: { 'prescriptionRecord.hospitalId': new mongoose.Types.ObjectId(hospitalId) } },
        { $set: { transactionDate: { $ifNull: ['$paymentDate', '$createdAt'] } } },
        { $match: { transactionDate: dateRange } },
        { $group: { _id: null, total: { $sum: '$amount' }, transactions: { $sum: 1 } } },
        { $project: { _id: 0, total: 1, transactions: 1 } }
      ]),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $lookup: { from: Prescription.collection.name, localField: 'prescription', foreignField: '_id', as: 'prescriptionRecord' } },
        { $unwind: '$prescriptionRecord' },
        { $match: { 'prescriptionRecord.hospitalId': new mongoose.Types.ObjectId(hospitalId) } },
        { $set: { transactionDate: { $ifNull: ['$paymentDate', '$createdAt'] } } },
        { $match: { transactionDate: dateRange } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$transactionDate' } }, total: { $sum: '$amount' }, transactions: { $sum: 1 } } },
        { $project: { _id: 0, month: '$_id', total: 1, transactions: 1 } },
        { $sort: { month: 1 } }
      ])
    ])

    const appointments = appointmentSummary[0] || { total: 0, completed: 0, cancelled: 0 }
    const revenue = revenueSummary[0] || { total: 0, transactions: 0 }
    return res.json({
      success: true,
      period: { from: startDate, to: endDate },
      patients: {
        registered: monthlyPatientRegistrations.reduce((total, item) => total + item.count, 0),
        perMonth: monthlyPatientRegistrations
      },
      appointments: {
        ...appointments,
        byStatus: appointmentsByStatus,
        perMonth: monthlyAppointments
      },
      revenue: {
        total: revenue.total,
        transactions: revenue.transactions,
        perMonth: monthlyRevenue
      }
    })
  } catch (error) {
    console.error('getReports error:', error)
    return res.status(500).json({ success: false, message: 'Unable to generate reports' })
  }
}

module.exports = { getReports, parseDate, monthKey }
