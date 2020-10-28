const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pollSchema = new Schema({
  _id: String,
  title: String,
  shortTitle: String,
  startDate: Date,
  endDate: Date,
  code: String,
  sample: Number,
  type: Number,
  way: Number,
  questions: [
    String
  ],
  comment: String,
  files: [
    String
  ],
  active: Boolean,
  created: Date,
  lastModified: Date,
  deleted: Boolean
})

module.exports = mongoose.model('Polls', pollSchema)