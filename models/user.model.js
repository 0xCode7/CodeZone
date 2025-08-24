const mongoose = require('mongoose')
const validator = require('validator')
const userRole = require('../utils/userRole')


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: [true],
        validate: [validator.isEmail, 'field must be a valid email address']
    },
    password: {
        type: String,
        required: true,
    },
    token: {type: String},
    role: {
        type: String,
        enum: [
            userRole.USER,
            userRole.ADMIN,
            userRole.MANAGER
        ],
        default: userRole.USER
    },
    avatar : {
        type: String,
        default: 'uploads/default_avatar.jpg'
    }

})

module.exports = mongoose.model('User', userSchema)