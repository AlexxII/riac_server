const mongoose = require('mongoose')
const Schema = mongoose.Schema

const resultSchema = new Schema({
  _id: String,
  respondent: String,
  question: String,
  answer: String,
  code: String,
  text: String
})

module.exports = mongoose.model('Results', resultSchema)