const mongoose = require('mongoose')
const Schema = mongoose.Schema

const distributionSchema = new Schema({
  _id: String,
  data: String,
  parentAnswer: String,
  refPoll: String,
  refAnswer: String,
  order: Number
})

module.exports = mongoose.model('Distribution', distributionSchema)