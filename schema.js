const { gql } = require('apollo-server-express')

const typeDefs = gql`

  scalar PollLogic

  type Poll {
    id: ID!,
    title: String!,
    shortTitle: String!,
    startDate: String!,                                "// объявить собственный ТИП Date"
    endDate: String!,
    dateOrder: String!,                                "// дата для очередности"
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
    results: [Respondent],
    resultsCount: Int,
    files: [PollFile],
    logic: Logic,
    filters: Filters,
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
    poll: Poll,
    topic: Topic,
    answers: [Answer],
    codesPool: [String]
  }

  type Answer {
    id: ID!,
    title: String!,
    shortTitle: String!,
    code: String!,
    poll: Poll,
    order: Int!,
    results: [Result],
    distribution: [Distribution]
  }

  type Distribution {
    id: ID!,
    data: String!,
    parentAnswer: Answer,
    refPoll: Poll,
    refAnswer: Answer,
    order: Int
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

  type Filters {
    age: [FilterType],
    sex: [FilterType],
    custom: [FilterType]
  }
  
  "// пара ключ - код"
  type FilterType {
    id: String!,
    code: String!,
    active: Boolean!
  }

  type Logic {
    id: ID!,
    poll: String!,
    path: String!
  }

  type City {
    id: ID!,
    title: String!,
    population: Int,
    type: String,
    order: Int,
    category: CityCategory
  }

  type CityCategory {
    id: String!,
    title: String!,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  type Respondent {
    id: String!,
    poll: Poll!,
    city: City,
    user: User,
    driveinUser: User,
    created: String,
    lastModified: String,
    timestamp: Int,
    processed: Boolean,
    result: [Result]!
  }

  type Result {
    id: String!,
    respondent: Respondent!,
    question: Question!,
    answer: Answer!,
    code: String!,
    text: String
  }

  type Sex {
    id: String,
    title: String,
    order: Int
  }

  type AgeCategory {
    id: String!,
    title: String!,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  type CustomFilter {
    id: String!,
    title: String!,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  type Query {
    users: [User],
    protectedUsersInfo: [User],
    userRights: [UserRights],
    userStatus: [UserStatus],
    currentUser: User,

    polls: [Poll],
    archivePolls: [Poll],
    poll(id: ID!): Poll,
    questions: [Question],
    answers: [Answer],
    logics: [Logic],

    topics: [Topic],

    cities: [City],
    city(id: ID!): City,
    cityCategories: [CityCategory],
    cityCategoriesAll: [CityCategory],
    pollCities(id: String!): [City]

    intervievers: [User],
    sex: [Sex],
    ageCategories: [AgeCategory],
    ageCategoriesAll: [AgeCategory],
    question(id: ID!): Question,
    logicById(id:ID!): Logic,
    pollLogic(id:ID!): Logic,

    ## pollResults(id:String!): [Respondent],
    respondent(id:String): Respondent,
    customFilters: [CustomFilter],
    customFiltersAll: [CustomFilter],

    sameQuestions(topics: [String!], poll: String!): [Question],
    answersWithResults(id: String!): Question
  }

  type Mutation {
    addNewUser(user: UserDataCreate): User,
    deleteUsers(users: [String]): [User],
    updateUser(id: String, data: UserDataUpdate): User,
    signin(login: String!, password: String!): AuthPayload,
    resetPassword(id: String, password: String): Boolean,
    logout: Boolean,
    
    newCity(title: String!, type: String!, population: Int, category: String!): City!,
    newCities(cities: [CityInput]): [City],
    cityEdit(id: String!, type: String, title: String!, population: Int!, category: String!): City!,
    deleteCity(id: String!): City,

    saveNewCityCategory(title: String!): CityCategory!,
    updateCityCategory(id: String!, title: String!): CityCategory!,
    changeCityCategoryStatus(id: String!, status: Boolean): CityCategory!,
    deleteCityCategory(id: String!): CityCategory,
    saveCityCategoryOrder(categories: [ItemsReorder]): [CityCategory],

    saveNewAgeCategory(title: String!): AgeCategory!,
    updateAgeCategory(id: String!, title: String!): AgeCategory!,
    changeAgeCategoryStatus(id: String!, status: Boolean): AgeCategory!,
    deleteAgeCategory(id: String!): AgeCategory!,
    saveAgeCategoryOrder(ages: [ItemsReorder]): [AgeCategory],

    saveNewCustomFilter(title: String!): CustomFilter!,
    updateCustomFilter(id: String!, title: String!): CustomFilter!,
    changeCustomFilterStatus(id: String!, status: Boolean): CustomFilter!,
    deleteCustomFilter(id: String!): CustomFilter!,
    saveCustomFilterOrder(filters: [ItemsReorder]): [CustomFilter],

    savePollFilters(poll: String, data: FilterTypeInputEx): Filters,

    setPollCity(id: ID!, cities: [String]): Poll,
    deleteCityFromActive(id: ID!, cities: [String]): Poll,

    addPoll(poll: PollWithConfig, questions: [QuestionInput], logic: LogicInput, topic: [TopicInput]): Poll,
    savePollStatus(id: ID!, active:Boolean!): Poll,
    deletePoll(id: ID!): Poll,

    newLimit(id: ID!, limit: Int!): Question,
    newOrder(neworder: [ReorderedArray]): [Question],

    saveConfig(path: String!, text: String!): Boolean,

    saveResult(poll: String!, city: String!, user: String!, driveinUser: String!, data: [ResultData]): Respondent,
    updateResult(id: String!, data: [ResultData]): Respondent,
    deleteResults(results: [String]): [Respondent]
    saveResultStatus(results: [String], type: String): [Respondent]

    updateResultCity(results: [String], city: String): [Respondent],
    updateResultUser(results: [String], user: String): [Respondent],

    saveBatchResults(poll: String!, results: [BatchResults]): [Respondent],

    saveAnswersDistribution(poll: String!, answers: [AnswerDistribution]): [Distribution]
  }

  input ReorderedArray {
    id: ID!,
    order: Int!
  }

  input ItemsReorder {
    id: String!,
    order: Int!
  }

  input AnswerDistribution {
    id: String!,
    distribution: [DistributionInput]
  }

  input DistributionInput {
    id: String,
    data: String!,
    refPoll: String,
    refAnswer: String,
    order: Int!
  }

  input UserDataCreate {
    username: String!,
    login: String!,
    password: String!,
    status: String!,
    rights: String
  }

  input FilterTypeInputEx {
    age: [FilterTypeInput],
    sex: [FilterTypeInput],
    custom: [FilterTypeInput]
  }

  input FilterTypeInput {
    id: String,
    code: String,
    active: Boolean
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
    answer: String!,
    code: String!,
    text: String
  }

  input BatchResults {
    city: String,
    date: String,
    user: String,
    result: [resultInputEx]
  }

  input resultInputEx {
    question: String!,
    answer: String!,
    code: String!,
    text: String
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
    importId: String!,
    title: String!,
    shortTitle: String,
    limit: Int,
    type: Int,
    topic: Int,
    order: Int,
    answers: [AnswerInput]
  }

  input AnswerInput {
    importId: String!,
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

  input CityInput {
    title: String!,
    order: Int!,
    type: String!,
    population: Int,
    category: String
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
    id: String,
    title: String,
    order: Int,
    default: Boolean,
    active: Boolean
  }

  type UserRights {
    id: String,
    title: String,
    order: Int,
    default: Boolean,
    root: Boolean,
    active: Boolean
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