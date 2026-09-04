const { createAppointment } = require('../controllers/user.contollers')
const Appointment = require('../models/appointment.models')
const User = require('../models/user.models')

// Mock Appointment.prototype.save to avoid DB
Appointment.prototype.save = async function() {
  // emulate mongoose returned doc
  return { ...this, _id: 'mock-id', createdAt: new Date(), updatedAt: new Date() }
}

// Mock User.findById to always return null
User.findById = async (id) => null

const run = async () => {
  const req = {
    body: {
      firstName: 'Test User',
      phoneNumber: '08012345678',
      department: 'Others',
      issue: 'Testing appointment submission via script'
      // note: no date/time provided, matching the frontend form
    },
    user: null
  }

  const res = {
    status(code) {
      this._status = code
      return this
    },
    json(payload) {
      console.log('RES STATUS:', this._status)
      console.log('RES JSON:', JSON.stringify(payload, null, 2))
      return payload
    }
  }

  await createAppointment(req, res)
}

run().catch(err => console.error(err))
