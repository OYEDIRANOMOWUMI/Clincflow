const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    name: { required: true, type: String, trim: true },
    email: { required: true, type: String, unique: true, trim: true, lowercase: true },
    password: { required: true, type: String },
    role: {
        type: String,
        required: true,
        enum: ['doctor', 'nurse', 'pharmacy', 'laboratory'],
        default: 'doctor'
    }
})

module.exports = mongoose.model('Doctors', userModel)