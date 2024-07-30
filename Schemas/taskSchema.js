const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const taskSchema = new Schema({
    name: String,
    id: Number,
    order: Number,
})

module.exports = mongoose.model('tasks', taskSchema)