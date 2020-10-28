const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fileSchema = new Schema({
  title: String,
  originalFile: String,
  pdfClone: String,
  path: String,
  name: String,
  parentPoll: String,
  created: Date,
  lastModified: Date,
  deleted: Boolean
})

module.exports = mongoose.model('Pollfiles', fileSchema)