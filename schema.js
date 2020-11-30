const { gql } = require('apollo-server-express')

const typeDefs = gql`

  scalar PollLogic

  type Poll {
    id: ID!,
    title: String!,
    shortTitle: String!,
    startDate: String!,                                "// объявить собственный ТИП Date"
    endDate: String!,
    code: String!,
    liter: String!,
    sample: Int!,                                      "// Выборка"
    complete: Int,                                     "// Сколько закончено"
    questionsCount: Int,
    answersCount: Int,
    type: Int!,                                        "// Тип опроса"
    way: Int!,                                         "// Метод проведения"
    comment: String!,
    color: String!,
    cities: [City],                                    "// Города проведения"
    questions: [Question]!,
    files: [PollFile],
    logic: Logic,
    active: Boolean!,
    created: String!,                                  "// DATE"
    lastModified: String!,                             "// DATE"
    deleted: Boolean!
  }

  type Question {
    id: ID!,
    title: String!,
    shortTitle: String!,
    limit: Int,
    type: Int,
    order: Int,
    parentPool: ID!,
    answers: [Answer]
  }

  type Answer {
    id: ID!,
    title: String!,
    shortTitle: String!,
    code: String!,
    parentPool: ID!,
    order: Int!
  }

  type PollFile {
    id: ID!,
    title: String!,
    originalFile: String!,
    pdfClone: String!,
    path: String!,
    created: String!,                                  "// DATE"
    deleted: Boolean!
  }

  type Topic {
    id: String!,
    title: String!
  }

  type Logic {
    id: ID!,
    poll: String!,
    path: String!
  }

  type City {
    id: ID!,
    title: String!,
    population: Int!,
    category: CityCategory!
  }

  type CityCategory {
    value: String!,
    label: String!
  }

  input ReorderedArray {
    id: ID!,
    order: Int!
  }

  type Respondent {
    id: String!,
    poll: Poll!,
    city: City,
    user: User,
    created: String,
    lastModified: String,
    processed: Boolean,
    result: [Result]!
  }

  type Result {
    id: String!,
    respondent: Respondent!,
    question: Question!,
    code: String!,
    text: String
  }

  type Query {
    users: [User],
    userRights: [UserRights],
    userStatus: [UserStatus],
    currentUser: User,

    polls: [Poll],
    poll(id: ID!): Poll,
    questions: [Question],
    answers: [Answer],
    logics: [Logic],

    cities: [City],
    intervievers: [User],

    question(id: ID!): Question,
    logicById(id:ID!): Logic,
    pollLogic(id:ID!): Logic,

    result(id:ID!): [Respondent],
    pollResults(id:String!): [Respondent],
    
    city(id: ID!): City,
    cityCategories: [CityCategory],
    pollCities(id: String!): [City]
  }

  type Mutation {
    addNewUser(user: UserDataCreate): User,
    deleteUsers(users: [String]): [User],
    updateUser(id: String, data: UserDataUpdate): User,
    signin(login: String!, password: String!): AuthPayload,
    resetPassword(id: String, password: String): Boolean,
    logout: Boolean,
    
    newCity(title: String!, population: Int!, category: String!): City!,
    cityEdit(id: String!, title: String!, population: Int!, category: String!): City!,
    deleteCity(id: String!): Boolean,

    setPollCity(id: ID!, cities: [String]): Poll,
    deleteCityFromActive(id: ID!, cities: [String]): Poll,

    addPoll(poll: PollWithConfig, questions: [QuestionInput], logic: LogicInput, topic: [TopicInput]): Poll,
    deletePoll(id: ID!): Poll,

    newLimit(id: ID!, limit: Int!): Question,
    newOrder(neworder: [ReorderedArray]): [Question],

    saveConfig(path: String!, text: String!): Boolean,

    saveResult(poll: String!, city: String!, user: String!, pool: [String], data: [ResultData]): Boolean,
    deleteResults(results: [String]): [Respondent]
  }

  input UserDataCreate {
    username: String!,
    login: String!,
    password: String!,
    status: String!,
    rights: String
  }

  input UserDataUpdate {
    username: String,
    login: String,
    status: String,
    rights: String
  }

  input ResultData {
    id: String!,
    data: [resultInput]
  }

  input resultInput {
    code: String!
    text: String
  }

  input CityType {
    value: String!
  }

  input PollWithConfig {
    title: String!,
    shortTitle: String,
    startDate: String!,
    endDate: String!,
    code: String!,
    sample: Int!,
    type: Int!,
    way: Int!,
    comment: String,
    active: Boolean!
  }

  input QuestionInput {
    title: String!,
    shortTitle: String,
    limit: Int,
    type: Int,
    topic: Int,
    order: Int,
    answers: [AnswerInput]
  }

  input AnswerInput {
    title: String!,
    shortTitle: String,
    code: String!,
    order: Int!,
    type: Int
  }

  input TopicInput {
    id: String!,
    title: String!
  }

  input LogicInput {
    diffUniq: [String],
    difficult: [String],
    exclude: PollLogic,
    freeAnswers: [String],
    unique: [String]
  }

  "======= USERS ========"
  type User {
    id: String,
    username: String,
    login: String,
    password: String,
    status: UserStatus,
    rights: UserRights
  }

  type UserStatus {
    value: String,
    label: String
  }

  type UserRights {
    value: String,
    label: String
  }

  enum Status {
    MILITARY
    CIVILIAN
  }

  enum Rights {
    SUPERADMIN
    ADMIN
    OPERATOR
    USER
    GUEST
  }

  type AuthPayload {
    user: User
  }

`
module.exports = typeDefs;