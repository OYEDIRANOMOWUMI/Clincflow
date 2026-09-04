const Appointment = require('../models/appointment.models')
const User = require('../models/user.models')

const sendTwilioMessage = async ({ to, from, body, type }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken || !from) {
    console.log(`Twilio ${type} notification skipped: credentials missing.`)
    return true
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${type} send failed: ${response.status} ${text}`)
  }

  return true
}

const sendAppointmentNotifications = async (appointment) => {
  if (!appointment?.phoneNumber) {
    return false
  }

  const rawPhone = String(appointment.phoneNumber).trim()
  const digitsOnly = rawPhone.replace(/\D/g, '')
  const e164 = digitsOnly.startsWith('0') ? `+234${digitsOnly.slice(1)}` : digitsOnly.startsWith('+') ? digitsOnly : `+${digitsOnly}`

  if (!e164 || e164 === '+') {
    return false
  }

  const messageBody = `Hello ${appointment.patientName || 'patient'}, your appointment request for ${appointment.department || 'Carevyn'} has been received. Our team will contact you shortly.`
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM
  const smsFrom = process.env.TWILIO_FROM || whatsappFrom

  if (whatsappFrom) {
    try {
      await sendTwilioMessage({
        to: `whatsapp:${e164}`,
        from: whatsappFrom.startsWith('whatsapp:') ? whatsappFrom : `whatsapp:${whatsappFrom}`,
        body: messageBody,
        type: 'WhatsApp'
      })
      return true
    } catch (error) {
      console.warn('WhatsApp send failed, falling back to SMS:', error.message)
    }
  }

  if (smsFrom) {
    try {
      await sendTwilioMessage({
        to: e164,
        from: smsFrom,
        body: messageBody,
        type: 'SMS'
      })
      return true
    } catch (error) {
      console.error('SMS send failed:', error.message)
      return false
    }
  }

  console.log(`Appointment notification prepared for ${e164}. Twilio not configured, so no real message was sent.`)
  return false
}

const createAppointment = async (req, res) => {
  try {
    const { firstName, phoneNumber, issue, department, patient, doctor, date, time, reason, notes } = req.body || {}

    const trimmedFirstName = firstName?.toString().trim()
    const trimmedPhoneNumber = phoneNumber?.toString().trim()
    const trimmedIssue = issue?.toString().trim()
    const trimmedDepartment = department?.toString().trim()
    const trimmedDate = date ? new Date(date) : null
    const trimmedTime = time?.toString().trim()

    if (!trimmedDate && !date) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date is required'
      })
    }

    if (!trimmedTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is required'
      })
    }

    if (Number.isNaN(trimmedDate?.getTime()) || trimmedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'A future appointment date and time is required'
      })
    }

    if (!req.user && (!trimmedFirstName || !trimmedPhoneNumber || !trimmedIssue || !trimmedDepartment)) {
      return res.status(400).json({
        success: false,
        message: 'firstName, phoneNumber, issue, and department are required'
      })
    }

    const appointmentPayload = {
      patient: req.user ? req.user._id : (patient || null),
      doctor: doctor || null,
      patientName: trimmedFirstName || (req.user ? req.user.name : ''),
      phoneNumber: trimmedPhoneNumber || (req.user ? req.user.phone : ''),
      issue: trimmedIssue || '',
      department: trimmedDepartment || '',
      date: trimmedDate,
      time: trimmedTime,
      reason: reason?.toString().trim() || '',
      notes: notes?.toString().trim() || ''
    }

    if (appointmentPayload.patient && appointmentPayload.patient !== null) {
      const patientUser = await User.findOne({ _id: appointmentPayload.patient, hospitalId: req.user?.hospitalId }).lean()
      if (!patientUser) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        })
      }
    }

    if (appointmentPayload.doctor && appointmentPayload.doctor !== null) {
      const doctorUser = await User.findOne({ _id: appointmentPayload.doctor, hospitalId: req.user?.hospitalId, role: 'doctor', isActive: true }).lean()
      if (!doctorUser) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        })
      }
    }

    const appointment = new Appointment({ ...appointmentPayload, hospitalId: req.user?.hospitalId || null })
    const savedAppointment = await appointment.save()
    await sendAppointmentNotifications(savedAppointment)

    return res.status(201).json({
      success: true,
      message: 'Appointment saved',
      appointment: savedAppointment
    })
  } catch (error) {
    console.error('createAppointment error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to save appointment',
      error: error.message
    })
  }
}

const getPatientAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const query = req.user.role === 'admin'
      ? { hospitalId: req.user.hospitalId }
      : {
          hospitalId: req.user.hospitalId,
          $or: [
            { patient: req.user._id },
            { doctor: req.user._id }
          ]
        }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean()

    return res.status(200).json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('getPatientAppointments error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch appointments' })
  }
}

module.exports = { createAppointment, getPatientAppointments }