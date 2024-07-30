const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const userSchema = new Schema({
    sub: Number,
    name: String,
    refreshToken:String
})

module.exports = mongoose.model('users', userSchema)