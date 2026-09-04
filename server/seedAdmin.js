const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')
const User = require('./models/user.models')
const Hospital = require('./models/hospital.models')

dotenv.config({ path: path.join(__dirname, '.env') })

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.uri

async function main() {
  if (!mongoUri) {
    console.error('MISSING_MONGO_URI')
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

    const passwordHash = await bcrypt.hash('Admin123!', 10)
    const email = 'admin.test@clinicflow.com'
    const hospital = await Hospital.findOneAndUpdate(
      { email: 'admin.hospital@clinicflow.com' },
      {
        $setOnInsert: {
          name: 'Carevyn Test Hospital',
          email: 'admin.hospital@clinicflow.com',
          password: passwordHash,
          address: '18 Wellness Avenue, Lagos',
          phone: '+234 800 000 0000',
          contactLine: 'Emergency: +234 800 000 0001'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const result = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: 'Admin Test',
          email,
          password: passwordHash,
          role: 'admin',
          hospitalId: hospital._id,
          isActive: true
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    await Hospital.findByIdAndUpdate(hospital._id, { adminId: result._id })

    console.log(JSON.stringify({
      message: 'USER_READY',
      id: result._id.toString(),
      email: result.email,
      role: result.role,
      hospitalId: hospital._id.toString()
    }))

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('CREATE_USER_ERR', err && err.message ? err.message : err)
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1)
  }
}

main()
