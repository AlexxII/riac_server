const { AuthenticationError } = require('apollo-server-express')
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const ini = require('ini')
const Poll = require('./models/polls/poll')
const Question = require('./models/polls/question')
const Answer = require('./models/polls/answer')
const PollFile = require('./models/polls/pollfile')
const Topic = require('./models/polls/topic')
const Logic = require('./models/polls/logic')
const City = require('./models/polls/city');
const Respondent = require('./models/polls/respondent');
const Result = require('./models/polls/result')

const { GraphQLScalarType } = require('graphql');
const moment = require('moment')

module.exports = {
  Query: {
    currentUser: (_, __, context) => context.getUser(),
    polls: () => Poll.find({}),
    poll: (_, args) => Poll.findById(args.id),
    questions: () => {
      return Question.find({});
    },
    answers: () => {
      return Answer.find({});
    },
    logics: () => {
      return Logic.find({})
    },
    cities: () => {
      return City.find({})
    },
    question: (_, args) => Question.findById(args.id),
    logicById: (_, args) => Logic.findById(args.id),
    pollLogic: async (_, args) => {
      const res = await Logic.findOne({ "poll": args.id }).exec()
      return res
    },
    result: async (_, args) => {
      const res = await Respondent.find({ "poll": args.id }).exec()
      return res
    }
  },
  Mutation: {
    signup: async (_, { username, password }, context) => {
      const res = await Logic.findOne({ "username": username }).exec()
      if (res) {
        throw new Error('Пользователь с таким ИМЕНЕМ уже существует');
      } else {
        const newUser = {
          _id: uuidv4(),
          username,
          password
        };
        context.User.create(newUser)
        return { user: newUser }
      }
    },
    signin: async (_, { username, password }, context) => {
      const { user } = await context.authenticate('graphql-local', { username, password });
      if (!user) {
        throw new AuthenticationError('Такого пользователя не существует');
      } else {
        await context.login(user);
        return { user }
      }
    },
    logout: (_, __, context) => context.logout(),
    newCity: async (_, args) => {
      const city = {
        _id: uuidv4(),
        title: args.title,
        population: args.population,
        category: args.category
      }
      const res = await City.create(city)
      return res
    },
    cityEdit: async (_, args) => {
      const filter = { _id: args.id }
      const update = {
        title: args.title,
        population: args.population,
        category: args.category
      }
      let city = await City.findOneAndUpdate(filter, update, {
        new: true
      })
      return city
    },
    deleteCity: async (_, args) => {
      const city = await City.findOne({ _id: args.id })
      const res = await city.deleteOne()
      return res._id === args.id
    },
    addPoll(_, args) {
      const questions = args.questions
      const topics = args.topic
      const logic = args.logic
      const qLength = questions.length
      let questionsPool = []
      const pollId = uuidv4()
      for (let i = 0; i < qLength; i++) {
        const answers = questions[i].answers
        lAnswers = answers.length
        let answersPool = []
        for (let i = 0; i < lAnswers; i++) {
          const answer = {
            _id: uuidv4(),
            poll: pollId,
            title: answers[i].title,
            code: answers[i].code,
            order: answers[i].order,
            type: answers[i].types
          }
          Answer.create(answer)
          answersPool.push(answer._id)
        }
        const question = {
          _id: uuidv4(),
          title: questions[i].title,
          limit: questions[i].limit,
          order: questions[i].order,
          type: questions[i].type,
          topic: questions[i].topic,
          poll: pollId,
          answers: answersPool
        }
        Question.create(question)
        questionsPool.push(question._id)
      }
      const pollData = {
        _id: pollId,
        ...args.poll,
        created: new Date(),
        lastModified: new Date(),
        deleted: false,
        questions: questionsPool
      }
      const poll = Poll.create(pollData)
      for (let i = 0; i < topics.length; i++) {
        const topicData = {
          _id: topics[i].id,
          title: topics[i].title
        }
        const topic = Topic.create(topicData)
      }
      // Сохранение кофигурации в файл
      const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
      let text = ''
      for (let key in logic) {
        if (Array.isArray(logic[key])) {
          text += `[${key}]${newLineChar}`
          text += `answers = ${logic[key]}${newLineChar}`
          text += ` ${newLineChar}`
        } else {
          const obj = logic[key]
          let suffix = 1
          for (let k in obj) {
            text += `[${key}_${suffix}]${newLineChar}`
            text += `answers = ${k}${newLineChar}`
            text += `exclude = ${obj[k].restrict}${newLineChar}`
            text += `critical = 1${newLineChar}`
            text += ` ${newLineChar}`
            suffix++
          }
        }
      }
      const t = +new Date
      const logicFile = `/files/polls/pollconfig_${t}.ini`
      fs.writeFileSync(`.${logicFile}`, text)
      const logicData = {
        _id: uuidv4(),
        poll: pollId,
        path: logicFile
      }
      Logic.create(logicData)
    },
    deletePoll(_, args) {
      const pollId = args.id
      Poll.findById(pollId, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          const questions = result.questions
          const qLength = questions.length
          for (let i = 0; i < qLength; i++) {
            const qId = questions[i]
            Question.findById(qId, function (err, result) {
              if (err) {
                console.log(err)
              } else {
                const answers = result.answers
                const aLength = answers.length
                for (let i = 0; i < aLength; i++) {
                  const aId = answers[i]
                  Answer.deleteOne({ _id: aId }, function (err) { });
                }
                result.deleteOne()
              }
            })
          }
          Logic.findOne({ "poll": pollId }, function (err, result) {
            const filePath = `.${result.path}`
            try {
              fs.unlinkSync(filePath)
              result.deleteOne()
              //file removed
            } catch (err) {
              console.error(err)
            }
          })
          result.deleteOne()
        }
      })
    },
    newLimit(_, args) {
      const questionId = args.id
      const limit = args.limit
      // return Question.findByIdAndUpdate({ "_id": questionId }, { "limit": limit }, { new: true })
      Question.findByIdAndUpdate({ "_id": questionId }, { "limit": limit }, function (err, result) {
        return err ? false : true
      })
      return true
    },
    newOrder(_, args) {
      const questions = args.neworder
      const qLength = questions.length
      let answer = true
      for (let i = 0; i < qLength; i++) {
        const qId = questions[i].id
        Question.findByIdAndUpdate({ "_id": qId }, { "order": questions[i].order }, function (err, result) {
          if (err) {
            answer = false
            // break
          }
        })
      }
      return true
    },
    saveConfig(_, args) {
      const filePath = args.path
      const text = args.text
      fs.writeFileSync(`.${filePath}`, text)
      return true
    },
    saveResult(_, args) {
      const questions = args.data
      let resultPool = []
      const respondentId = uuidv4()
      for (let i = 0; i < questions.length; i++) {
        const questionId = questions[i].id
        const answers = questions[i].data
        for (let j = 0; j < answers.length; j++) {
          const result = {
            _id: uuidv4(),
            respondent: respondentId,
            question: questionId,
            code: answers[j].code,
            text: answers[j].text
          }
          Result.create(result)
          resultPool.push(result._id)
        }
      }
      const resp = {
        _id: respondentId,
        poll: args.poll,
        city: args.city,
        data: resultPool
      }
      Respondent.create(resp)
    }
  },
  Poll: {
    questions: (parent) => {
      return Question.find({ "poll": parent._id }).sort('order')
    },
    files: (parent) => {
      return PollFile.find({ "_id": { $in: parent.files } })
    },
    liter: (parent) => {
      const reg = /\D{3}/
      return parent.code.match(reg)[0]
    },
    complete: () => 0,
    questionsCount: (parent) => {
      return parent.questions.length
    },
    answersCount: (parent) => {
      return Answer.find({ "poll": parent._id }).count()
    },
    color: () => 'red',
    logic: async (parent) => {
      const res = await Logic.findOne({ "poll": parent._id })
      return res
    },
    startDate: parent => {
      return moment(parent.startDate).format('DD.MM.YYYY')
    },
    endDate: (parent) => {
      return moment(parent.endDate).format('DD.MM.YYYY')
    }
  },
  Question: {
    answers: (parent) => {
      return Answer.find({ "_id": { $in: parent.answers } }).sort('order')
    }
  },
  Respondent: {
    poll: async (parent) => {
      return await Poll.findById(parent.poll)
    },
    city: async (parent) => {
      return await City.findById(parent.city)
    },
    result: (parent) => {
      return Result.find({ "_id": { $in: parent.result } })
    }
  },
  PollLogic: new GraphQLScalarType({
    name: "PollLogic",
    description: "Poll logic scalar type",
    parseValue: value => value,
    serialize: value => value,
    parseLiteral: ast => ast.value
  })
}