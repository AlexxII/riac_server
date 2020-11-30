const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')

const { userRightsTml, userStatusTml } = require('./config/auth')

const User = require('./models/common/user')
const Rights = require('./models/common/rights')
const UserStatus = require('./models/common/userStatus')

mongoose.connect('mongodb://localhost:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

// добавление суперправа в БД
const rights = Rights.create({
  _id: uuidv4(),
  title: userRightsTml[0],
  flag: 0
}, (err, data) => {
  if (err) {
    console.log('Ошибка при создании БД - права пользователя', err);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
  try {
    const superAdmin = {
      _id: uuidv4(),
      username: 'Администратор по умолчанию',
      login: 'root',
      password: 'vinegar',
      default: true,
      status: '',
      rights: data._id
    }
    User.create(superAdmin)
  } catch (e) {
    console.log('Ошибка при создании БД - права пользователя', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
})

// добавление основных ПРАВ в БД
for (let i = 1; i < userRightsTml.length; i++) {
  try {
    const r = {
      _id: uuidv4(),
      title: userRightsTml[i],
      flag: 1
    }
    Rights.create(r)
  } catch (e) {
    console.log('Ошибка при создании БД - права пользователя', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}

// добавление СТАТУСА в БД
for (let i = 0; i < userStatusTml.length; i++) {
  try {
    UserStatus.create({
      _id: uuidv4(),
      title: userStatusTml[i]
    }, () => {
      // ноебходимо отсоединится от БД
      if (i === userStatusTml.length - 1) {
        mongoose.disconnect();                                                                          // отключение от базы данных
      }
    })
  } catch (e) {
    console.log('Ошибка при создании БД - статус пользователя', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}