const mongoose = require('mongoose')
const Schema = mongoose.Schema

const statusSchema = new Schema({
  _id: String,
  title: String
})

module.exports = mongoose.model('Userstatus', statusSchema)