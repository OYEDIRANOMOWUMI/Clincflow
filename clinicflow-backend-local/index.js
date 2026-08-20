const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: '.env' })

const app = express()
const port = Number(process.env.PORT || process.env.port || 3700)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.uri
const isVercelRuntime = Boolean(process.env.VERCEL)

mongoose.set('strictQuery', true)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://clinicflow.vercel.app',
      'https://www.clinicflow.vercel.app'
    ]

    const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')

    if (!origin || allowedOrigins.includes(origin) || isLocalOrigin) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))


const userRoutes = require('./routes/user.routes')
const doctorRoutes = require('./routes/doctors.routes')
const adminRoutes = require('./routes/admin.routes')
const userAuthRoutes = require('./routes/userAuth.routes')
const hospitalRoutes = require('./routes/hospital.routes')
const prescriptionRoutes = require('./routes/prescription.routes')
const availabilityRoutes = require('./routes/availability.routes')
const paymentRoutes = require('./routes/payment.routes')
const patientRoutes = require('./routes/patient.routes')

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'ClinicFlow backend',
    message: 'API is running',
    routes: ['/api/health', '/api/user/login', '/api/user/register']
  })
})

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ClinicFlow backend' })
})

app.get('/api', (req, res) => {
  res.json({
    ok: true,
    service: 'ClinicFlow backend',
    prefix: '/api',
    routes: ['/api/health', '/api/user/login', '/api/user/register']
  })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'ClinicFlow backend', prefix: '/api' })
})

app.use('/api/patient', userRoutes)
app.use('/api/doctor', doctorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userAuthRoutes)
app.use('/api/auth', userAuthRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/patients', patientRoutes)

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
    path: req.originalUrl,
    hint: 'Use /api/health to verify the backend and /api/user/login or /api/user/register for auth endpoints.'
  })
})

async function connectDatabase() {
  if (!mongoUri) {
    throw new Error('Missing required environment variable MONGODB_URI. Create a .env file based on .env.example and set a valid MongoDB connection string.')
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    throw err
  }
}

async function startServer() {
  try {
    await connectDatabase()
    app.listen(port, () => {
      console.log(`ClinicFlow backend active on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Backend startup failed because MongoDB is required for login, registration, patients, appointments, and records.')
    process.exit(1)
  }
}

if (require.main === module && !isVercelRuntime) {
  startServer()
}

module.exports = app
