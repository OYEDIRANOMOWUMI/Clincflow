const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.uri;

async function main() {
  if (!mongoUri) {
    console.error('MISSING_MONGO_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isAdmin: Boolean,
      createdAt: Date
    }, { collection: 'users' });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const email = 'admin.test@clinicflow.com';

    const result = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: 'Admin Test',
          email,
          password: passwordHash,
          role: 'admin',
          isAdmin: true,
          createdAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(JSON.stringify({
      message: 'USER_READY',
      id: result._id.toString(),
      email: result.email,
      role: result.role
    }));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('CREATE_USER_ERR', err && err.message ? err.message : err);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

main();
