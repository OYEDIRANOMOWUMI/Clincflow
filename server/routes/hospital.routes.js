const express = require('express')
const bcrypt = require('bcryptjs')
const Hospital = require('../models/hospital.models')
const User = require('../models/user.models')
const { signToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const {
      hospitalName,
      adminEmail,
      password,
      hospitalAddress = '',
      hospitalPhone = ''
    } = req.body || {}

    if (!hospitalName || !String(hospitalName).trim()) {
      return res.status(400).json({ message: 'Hospital name is required' })
    }

    if (!adminEmail || !String(adminEmail).trim()) {
      return res.status(400).json({ message: 'Admin email is required' })
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const normalizedEmail = String(adminEmail).trim().toLowerCase()

    const existingHospital = await Hospital.findOne({ email: normalizedEmail })
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital admin already exists' })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(String(password), 10)

    const hospital = await Hospital.create({
      name: String(hospitalName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      address: String(hospitalAddress).trim(),
      phone: String(hospitalPhone).trim(),
      contactLine: String(hospitalPhone).trim(),
      adminId: null
    })

    const adminUser = await User.create({
      name: String(hospitalName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
      hospitalId: hospital._id,
      hospitalAddress: String(hospitalAddress).trim(),
      hospitalPhone: String(hospitalPhone).trim(),
      contactLine: String(hospitalPhone).trim()
    })

    hospital.adminId = adminUser._id
    await hospital.save()

    const token = signToken(adminUser)

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      token,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        address: hospital.address,
        phone: hospital.phone
      },
      adminUser: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('HOSPITAL REGISTER ERROR:', error)
    return res.status(500).json({ message: 'Server error while registering hospital' })
  }
})

module.exports = router
