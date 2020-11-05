const mongoose = require('mongoose')
const Schema = mongoose.Schema

const questionSchema = new Schema({
  _id: String,
  title: String,
  shortTitle: String,
  limit: Number,
  type: Number,
  order: Number,
  topic: Number,
  poll: String,
  answers: [String]
})

module.exports = mongoose.model('Questions', questionSchema)