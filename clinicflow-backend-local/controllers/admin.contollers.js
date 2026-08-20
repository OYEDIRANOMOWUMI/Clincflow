const bcrypt = require('bcryptjs')
const saltRounds = 10
const userModel = require('../models/admin.models')
const doctorModel = require('../models/doctor.models')
const patientModel = require('../models/user.models')

const getAuth = async (req, res) => {
  try {
    const { name, email, password } = req.body || {}

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const existingUser = await userModel.findOne({ email: email.trim() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser = new userModel({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword
    })

    await newUser.save()

    return res.status(201).json({ success: true, message: 'user registered' })
  } catch (err) {
    console.error('error saving user', err)
    return res.status(500).json({ message: 'Server error' })
  }
}


const getLogin = (req, res) => {
  console.log('req.body:', req.body)
  const { email, password } = req.body

  if (!email || !password) {
    console.log('all fields are required');
    return res.status(400).json({ success: false, message: 'email and password required' })
  }

  userModel.findOne({ email: email })
    .then((foundUser) => {
      if (!foundUser) {
        console.log('user not found');
        return res.status(404).json({ success: false, message: 'user not found' })
      }

      return bcrypt.compare(password, foundUser.password)
        .then((matched) => {
          if (matched) {
            console.log('successful')
            return res.status(200).json({ success: true, message: 'user found' })
          } else {
            console.log('invalid mail or pass');
            return res.status(401).json({ success: false, message: 'invalid email or password' })
          }
        })
    })
    .catch((err) => {
      console.error('error during login:', err);
      return res.status(500).json({ success: false, message: 'internal server error' })
    })
}


const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).lean().exec();
    res.status(200).json(doctors); // You MUST send the data back
  } catch (err) {
    console.error('getAllPatients error', err);
    res.status(500).json({ error: 'internal server error' });
  }
};
const getAllPatients = async (req, res) => {
  try {
    const patients = await patientModel.find({}).lean().exec();
    res.status(200).json(patients); // You MUST send the data back
  } catch (err) {
    console.error('getAllPatients error', err);
    res.status(500).json({ error: 'internal server error' });
  }
};

module.exports = { getAuth, getLogin, getAllDoctors ,getAllPatients}