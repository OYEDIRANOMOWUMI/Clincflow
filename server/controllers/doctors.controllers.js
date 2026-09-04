const bcrypt = require('bcryptjs')
const saltRounds = 10
const userModel = require('../models/doctor.models')
const patientModel = require('../models/user.models')

const allowedRoles = ['doctor', 'nurse', 'pharmacy', 'laboratory']

const getAuth = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {}

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const selectedRole = role && allowedRoles.includes(role) ? role : 'doctor'

    const existingUser = await userModel.findOne({ email: email.trim().toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser = new userModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: selectedRole
    })

    await newUser.save()

    return res.status(201).json({ success: true, message: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} registered` })
  } catch (err) {
    console.error('error saving doctor', err)
    return res.status(500).json({ message: 'Server error' })
  }
}


const getLogin = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (!email || !password) {
      console.log('all fields are required')
      return res.status(400).json({ success: false, message: 'email and password required' })
    }

    const foundUser = await userModel.findOne({ email })
    if (!foundUser) {
      console.log('user not found')
      return res.status(404).json({ success: false, message: 'user not found' })
    }

    const matched = await bcrypt.compare(password, foundUser.password)
    if (matched) {
      console.log('successful')
      return res.status(200).json({ success: true, message: 'user found' })
    }

    console.log('invalid mail or pass')
    return res.status(401).json({ success: false, message: 'invalid email or password' })
  } catch (err) {
    console.error('error during login:', err)
    return res.status(500).json({ success: false, message: 'internal server error' })
  }
}


const getAllPatients = async (req, res) => {
  try {
    const patients = await patientModel.find({ hospitalId: req.user.hospitalId }).lean().exec();
    res.status(200).json(patients); // You MUST send the data back
  } catch (err) {
    console.error('getAllPatients error', err);
    res.status(500).json({ error: 'internal server error' });
  }
};

module.exports = { getAuth, getLogin, getAllPatients }