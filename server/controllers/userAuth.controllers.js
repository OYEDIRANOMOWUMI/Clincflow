const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const dns = require('dns')
const User = require('../models/user.models')
const Patient = require('../models/patient.models')
const Hospital = require('../models/hospital.models')
const { signToken } = require('../middlewares/authMiddleware')

const allowedRoles = ['patient']
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedLocalDomains = ['clinicflow.com', 'clinicflow.local', 'localhost', 'example.com', 'test.com', 'mailtest.com']

const createPatientId = async () => {
  const count = await Patient.countDocuments()
  let sequence = count + 1
  let patientId = `CF-PAT-${String(sequence).padStart(6, '0')}`
  while (await Patient.exists({ patientId })) {
    sequence += 1
    patientId = `CF-PAT-${String(sequence).padStart(6, '0')}`
  }
  return patientId
}

const validateEmailExists = async (email) => {
  if (!email || !emailRegex.test(email)) return false

  const domain = String(email).split('@')[1]?.toLowerCase()
  if (!domain) return false

  if (allowedLocalDomains.includes(domain) || domain.endsWith('.clinicflow.local') || domain.endsWith('.clinicflow.com')) {
    return true
  }

  try {
    const mxRecords = await dns.promises.resolveMx(domain)
    return Array.isArray(mxRecords) && mxRecords.length > 0
  } catch (error) {
    return false
  }
}

const sendAccountEmail = async (email, name, role) => {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`Email notification for ${email} skipped: SMTP credentials not configured.`)
    return true
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: email,
      subject: 'Carevyn account created successfully',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #064E3B;">Welcome to Carevyn</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Your ${role} account has been created successfully.</p>
          <p>You can now login to your dashboard and continue managing patient care.</p>
        </div>
      `
    })

    return true
  } catch (error) {
    console.error('EMAIL SEND ERROR:', error)
    return false
  }
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId, hospitalAddress, hospitalPhone, contactLine } = req.body || {}

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const normalizedRole = String(role || '').trim().toLowerCase()
    if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Public registration is for patients only' })
    }

    if (!hospitalId) return res.status(400).json({ message: 'Hospital is required for patient registration' })

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(String(password), 10)

    const newUser = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      hospitalId,
      hospitalAddress: hospitalAddress ? String(hospitalAddress).trim() : '',
      hospitalPhone: hospitalPhone ? String(hospitalPhone).trim() : '',
      contactLine: contactLine ? String(contactLine).trim() : ''
    })

    await newUser.save()
    if (newUser.role === 'patient') {
      await Patient.create({
        userId: newUser._id,
        hospitalId,
        patientId: await createPatientId()
      })
    }
    const token = signToken(newUser)
    await sendAccountEmail(newUser.email, newUser.name, newUser.role)

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        hospitalId: newUser.hospitalId,
        hospitalAddress: newUser.hospitalAddress,
        hospitalPhone: newUser.hospitalPhone
      }
    })
  } catch (error) {
    console.error('REGISTER ERROR:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body || {}

    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    const emailExists = await validateEmailExists(normalizedEmail)
    if (!emailExists) {
      return res.status(400).json({ message: 'This email address does not exist or is not valid' })
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordMatches = await bcrypt.compare(String(password), existingUser.password)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (role && String(role).trim().toLowerCase() !== existingUser.role) {
      return res.status(403).json({ message: 'This account does not have access to the selected portal' })
    }

    const token = signToken(existingUser)

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        hospitalId: existingUser.hospitalId
      }
    })
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dob, hospitalId } = req.body || {}
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!String(name || '').trim()) return res.status(400).json({ message: 'Name is required' })
    if (!emailRegex.test(normalizedEmail)) return res.status(400).json({ message: 'Please enter a valid email address' })
    if (!password || String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    if (!hospitalId || !mongoose.isValidObjectId(hospitalId)) return res.status(400).json({ message: 'A valid hospital is required' })
    if (dob && Number.isNaN(new Date(dob).getTime())) return res.status(400).json({ message: 'Please enter a valid date of birth' })
    if (!await Hospital.exists({ _id: hospitalId })) return res.status(400).json({ message: 'Selected hospital was not found' })
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already exists' })

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(String(password), 10),
      role: 'patient',
      phone: String(phone || '').trim(),
      hospitalId
    })
    const patient = await Patient.create({
      userId: user._id,
      hospitalId,
      patientId: await createPatientId(),
      dob: dob ? new Date(dob) : null
    })
    const token = signToken(user)

    return res.status(201).json({
      success: true,
      message: 'Patient account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, patientId: patient.patientId }
    })
  } catch (error) {
    console.error('PATIENT REGISTER ERROR:', error)
    return res.status(500).json({ message: 'Unable to register patient' })
  }
}

module.exports = {
  registerUser,
  loginUser,
  registerPatient
}
