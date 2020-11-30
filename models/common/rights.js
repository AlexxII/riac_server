const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rightsSchema = new Schema({
  _id: String,
  title: String,
  flag: Number
})

module.exports = mongoose.model('Rights', rightsSchema)