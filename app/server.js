const dotenv = require('dotenv')

const express = require('express')
const session = require('express-session')
const morgan = require('morgan');
const path = require('path')
const methodOverride = require('method-override')
//const cors = require('cors');

const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

const passport = require('passport');

console.log( "Starting up " + Date() )

dotenv.config( {path: './app/config/config.env' })

require( './config/passport' )(passport)
const PORT = process.env.PORT || 8080

connectDB()

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development"

if( NODE_ENV === 'development') {
/*
  const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
  }
  app.use(cors(corsOptions));
*/
  app.use( morgan( 'dev' ) )
}

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

// Session & Passport
console.log( process.env.MONGO_URI )
app.use(session({ secret: 'yoursecret'
                   , resave: false
                   , saveUninitialized: false
                   , cookie: { path: '/'
                             , httpOnly: true
                             , maxAge: 365 * 24 * 3600 * 1000   // One year for example
                             }
                   , store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
                   }));

app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

//app.use(cors())

//Routes
const public_path = path.join(__dirname, '../client/public')
console.log( public_path )

app.use(express.static(public_path));
//app.use('/', require('./routes/index' ))
//app.use('/api/user', require('./routes/api/user'))
//app.use('/auth', require('./routes/auth' ))
//app.use('/users', require('./routes/users' ))

app.get('*', (req, res) => {
  res.redirect('/')
})

app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

const server = app.listen( PORT, () => {
	console.log( "Server Listening on " + PORT )
})

console.log( "Done" )
