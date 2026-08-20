const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const dns = require('dns')
const User = require('../models/user.models')
const { signToken } = require('../middlewares/authMiddleware')

const allowedRoles = ['patient', 'doctor', 'nurse', 'pharmacy', 'laboratory', 'admin']
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedLocalDomains = ['clinicflow.com', 'clinicflow.local', 'localhost', 'example.com', 'test.com', 'mailtest.com']

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
      subject: 'ClinicFlow account created successfully',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #064E3B;">Welcome to ClinicFlow</h2>
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
    const { name, email, password, role, hospitalAddress, hospitalPhone, contactLine } = req.body || {}

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
      return res.status(400).json({ message: 'Valid role is required: patient, doctor, nurse, pharmacy, laboratory, or admin' })
    }

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
      hospitalAddress: hospitalAddress ? String(hospitalAddress).trim() : '',
      hospitalPhone: hospitalPhone ? String(hospitalPhone).trim() : '',
      contactLine: contactLine ? String(contactLine).trim() : ''
    })

    await newUser.save()
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
    const { email, password } = req.body || {}

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

    const token = signToken(existingUser)

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      }
    })
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  registerUser,
  loginUser
}
