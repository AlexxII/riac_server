const express = require('express')
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')
const path = require('path');
const cors = require('cors')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const { GraphQLLocalStrategy, buildContext } = require('graphql-passport');
const User = require('./models/common/user')

const SESSION_SECRET = 'sdkhflkwjqheflkjhJHGKJHG231223487$#%@asdfjkashdasdfhKGKJHGjhgl2342jghkjGHJHKG'
const PORT = 4000

mongoose.connect('mongodb://localhost:27017/poll', { useNewUrlParser: true });
const dbConnection = mongoose.connection
dbConnection.on('error', err => console.log(`Connsetcion error: ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

const corsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
};

const app = express()

app.use(cors(corsOptions))

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
});

// REDIS!!!!!!! нужно добавить
passport.use('local-login',
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      return err
        ? done(err)
        : user
          ? password === user.password
            ? done(null, user)
            : done(null, false, { message: 'Неправильный пароль.' })
          : done(null, false, { message: 'Неправильный логин' })
    });
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return ({
      authenticate: function authenticate(name) {
        return {
          username: 'TEST',
          password: '123123'
        }
      },
      login: function login(user) {
        return req.login(user, function (err) {
          if (err) {
            return next(err)
          }
        })
      },
      getUser: function getUser() {
        return req.user;
      }
    })
  }
})

app.use(express.static(path.join(__dirname, 'asset')));

app.get('/files*', function (req, res) {
  const filePath = `.${req.originalUrl}`
  res.download(filePath)
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'asset', 'index.html'));
});

server.applyMiddleware({ app, cors: false })

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
)