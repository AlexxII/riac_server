const mongoose = require('mongoose')
const Schema = mongoose.Schema

const respondentSchema = new Schema({
  _id: String,
  poll: String,
  city: String,
  user: String,
  dirveinUser: String,
  created: Date,
  lastModified: Date,
  processed: Boolean,
  data: [String]
})

module.exports = mongoose.model('Respondents', respondentSchema)