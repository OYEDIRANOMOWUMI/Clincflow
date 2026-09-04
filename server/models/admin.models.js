const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    name:{required:true, type:String},
    email: { required: true, type: String, unique: true },
    password:{required:true, type:String},
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    hospitalAddress: { type: String, default: '' },
    hospitalPhone: { type: String, default: '' },
    contactLine: { type: String, default: '' }
})

module.exports = mongoose.model('Admin', userModel)