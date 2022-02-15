const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')
const fs = require('fs')

const filesDir = './files'
const pollFilesDir = './files/polls'

const { userRightsTml, userStatusTml } = require('./constants/auth')
const { cityCategoriesTml, agecategories } = require('./constants/poll_constants')

const User = require('./models/common/user')
const Rights = require('./models/common/rights')
const UserStatus = require('./models/common/userStatus')
const CityCategory = require('./models/common/citycategory')
const AgeCategory = require('./models/polls/agecategory')

mongoose.connect('mongodb://127.0.0.1:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

// добавление суперправа в БД
const rights = Rights.create({
  _id: uuidv4(),
  title: userRightsTml[0],
  order: 0,
  default: true,
  root: true,
  active: true
}, (err, data) => {
  if (err) {
    console.log('Ошибка при создании БД - права пользователя (СуперАдмин)', err);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
  try {
    const superAdmin = {
      _id: uuidv4(),
      username: 'Администратор по умолчанию',
      login: 'root',
      password: 'vinegar',
      status: '',
      rights: data._id,
      default: true,
      active: true
    }
    User.create(superAdmin)
  } catch (e) {
    console.log('Ошибка добавлении суперадмина', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
})

// добавление основных ПРАВ в БД
for (let i = 1; i < userRightsTml.length; i++) {
  try {
    const r = {
      _id: uuidv4(),
      title: userRightsTml[i],
      order: i,
      default: true,
      root: false,
      active: true
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
      title: userStatusTml[i],
      order: i,
      default: true,
      active: true
    })
  } catch (e) {
    console.log('Ошибка при создании БД - статус пользователя', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}

// добавление ТИПА ГОРОДОВ в БД
for (let i = 0; i < cityCategoriesTml.length; i++) {
  try {
    CityCategory.create({
      _id: uuidv4(),
      title: cityCategoriesTml[i],
      order: i,
      default: true,
      active: true
    }, () => {
      // ноебходимо отсоединится от БД
      if (i === cityCategoriesTml.length - 1) {
        mongoose.disconnect();                                                                      // отключение от базы данных
      }
    })
  } catch (e) {
    console.log('Ошибка при создании БД - категории населенных пунктов', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}

// добавление категории возраста респондентов
for (let i = 0; i < agecategories.length; i++) {
  try {
    AgeCategory.create({
      _id: uuidv4(),
      title: agecategories[i],
      order: i,
      default: true,
      active: true
    }, () => {
      // ноебходимо отсоединится от БД
      if (i === agecategories.length - 1) {
        mongoose.disconnect();                                                                      // отключение от базы данных
      }
    })
  } catch (e) {
    console.log('Ошибка при создании БД - категории населенных пунктов', e);
    mongoose.disconnect();                                                                          // отключение от базы данных
  }
}