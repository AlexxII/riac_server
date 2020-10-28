const mongoose = require('mongoose')
const Schema = mongoose.Schema

const answerSchema = new Schema({
  _id: String,
  poll: String,
  title: String,
  shortTitle: String,
  code: String,
  order: Number
})

module.exports = mongoose.model('Answers', answerSchema)