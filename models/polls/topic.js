const mongoose = require('mongoose')
const Schema = mongoose.Schema

const topicSchema = new Schema({
  _id: String,
  title: String
})

module.exports = mongoose.model('Topics', topicSchema)