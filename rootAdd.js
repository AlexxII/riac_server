const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')

const { userRights } = require('./config/auth')

const User = require('./models/common/user')

mongoose.connect('mongodb://localhost:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

const user = new User({
  _id: uuidv4(),
  username: 'Администратор по умолчанию',
  login: 'root',
  password: 'vinegar',
  status: '',
  rights: userRights[0].value
})

user.save(function (err) {
  mongoose.disconnect();                                                                          // отключение от базы данных
  if (err) return console.log(err);
  console.log("Создан и добавлен стандартный Администратор - ", user);
})