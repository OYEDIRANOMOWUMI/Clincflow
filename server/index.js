const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = Number(process.env.PORT || process.env.port || 3700)
const defaultMongoUri = 'mongodb://127.0.0.1:27017/clinicflow'
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.uri || defaultMongoUri
const isVercelRuntime = Boolean(process.env.VERCEL)
const allowDemoFallback = String(process.env.DEMO_MODE || '').toLowerCase() === 'true'
let databaseConnectionPromise = null

mongoose.set('strictQuery', true)

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cors({
  origin: (origin, callback) => {
    const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const allowedOrigins = [
      'https://clinicflow.vercel.app',
      'https://www.clinicflow.vercel.app',
      'https://clincflow.vercel.app',
      'https://www.clincflow.vercel.app',
      ...configuredOrigins
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
const appointmentRoutes = require('./routes/appointment.routes')
const workflowRoutes = require('./routes/workflow.routes')

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'Carevyn backend',
    message: 'API is running',
    routes: ['/api/health', '/api/user/login', '/api/user/register']
  })
})

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'Carevyn backend' })
})

app.get('/api', (req, res) => {
  res.json({
    ok: true,
    service: 'Carevyn backend',
    prefix: '/api',
    routes: ['/api/health', '/api/user/login', '/api/user/register']
  })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Carevyn backend', prefix: '/api' })
})

app.get('/api/ready', async (req, res) => {
  try {
    databaseConnectionPromise ||= connectDatabase()
    const connected = await databaseConnectionPromise
    if (!connected) {
      return res.status(503).json({ ok: false, ready: false, message: 'Database is unavailable' })
    }
    return res.json({ ok: true, ready: true, service: 'Carevyn backend' })
  } catch (error) {
    console.error('Readiness check failed:', error)
    return res.status(503).json({ ok: false, ready: false, message: 'Database is unavailable' })
  }
})

async function ensureDatabaseForRequest(req, res, next) {
  if (!req.path.startsWith('/api/')) return next()
  if (mongoose.connection.readyState === 1) return next()

  try {
    databaseConnectionPromise ||= connectDatabase()
    const connected = await databaseConnectionPromise
    if (!connected) {
      return res.status(503).json({ ok: false, message: 'Database is unavailable' })
    }
    return next()
  } catch (error) {
    console.error('Database request connection error:', error)
    return res.status(503).json({ ok: false, message: 'Database is unavailable' })
  }
}

app.use(ensureDatabaseForRequest)

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
app.use('/api/appointments', appointmentRoutes)
app.use('/api', workflowRoutes)

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
    path: req.originalUrl,
    hint: 'Use /api/health to verify the backend and /api/user/login or /api/user/register for auth endpoints.'
  })
})

app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, message: 'Request body is too large' })
  }

  if (err?.message?.startsWith('Origin ') && err.message.endsWith('not allowed by CORS')) {
    return res.status(403).json({ ok: false, message: 'Origin is not allowed' })
  }

  console.error('Unhandled API error:', err)
  return res.status(500).json({ ok: false, message: 'Internal server error' })
})

async function connectDatabase() {
  if (!mongoUri) {
    console.warn('MONGODB_URI not set. Starting in demo mode.')
    return false
  }

  const candidates = Array.from(new Set([
    mongoUri,
    mongoUri === defaultMongoUri ? null : defaultMongoUri,
  ].filter(Boolean)))

  let lastError = null

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      console.log(`✓ MongoDB connected using: ${uri}`)
      return true
    } catch (err) {
      lastError = err
      console.warn(`MongoDB connection failed for ${uri}: ${err.message}`)
    }
  }

  if (!allowDemoFallback) {
    console.error('Database unavailable. Set DEMO_MODE=true only for non-persistent demos.')
    return false
  }

  // Use an in-memory database only when demo mode is explicitly enabled.
  try {
    console.log('Attempting in-memory MongoDB fallback (this may take 30-60 seconds)...')
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Memory server setup timeout')), 30000)
    )
    const memoryServer = await Promise.race([
      MongoMemoryServer.create({ binary: { version: '7.0.14', skipDownload: false } }),
      timeoutPromise
    ])
    const memoryUri = memoryServer.getUri()
    await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 5000 })
    console.log(`✓ MongoDB connected using in-memory server`)
    return true
  } catch (memoryError) {
    console.warn(`In-memory server not available: ${memoryError.message}`)
  }

  console.warn('⚠ Running in demo mode: database features unavailable. Set MONGODB_URI for production.')
  return false
}

async function startServer() {
  try {
    const connected = await connectDatabase()
    if (!connected && !allowDemoFallback) {
      process.exitCode = 1
      return
    }
  } catch (error) {
    console.warn(`Database connection error (continuing in demo mode): ${error.message}`)
    if (!allowDemoFallback) {
      process.exitCode = 1
      return
    }
  }

  const server = app.listen(port, () => {
    console.log(``)
    console.log(`╔═══════════════════════════════════════════════════════════╗`)
    console.log(`║  Carevyn Hospital Management System Backend               ║`)
    console.log(`║  🚀 Server running at http://localhost:${port}${' '.repeat(17 - String(port).length)}║`)
    console.log(`║  📡 API endpoint: /api                                    ║`)
    console.log(`║  🏥 Health check: /api/health                             ║`)
    console.log(`╚═══════════════════════════════════════════════════════════╝`)
    console.log(``)
  })

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`)
    server.close(async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
      }
      process.exit(0)
    })
  }

  process.once('SIGTERM', () => shutdown('SIGTERM'))
  process.once('SIGINT', () => shutdown('SIGINT'))
}

if (require.main === module && !isVercelRuntime) {
  startServer()
}

module.exports = app
