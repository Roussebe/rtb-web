/*var {AsyncNedb} = require('nedb-async');
const path = require('path')

const DB_path = path.join(__dirname, '../../DB/users.nedb')
const User = new AsyncNedb( {filename: DB_path, autoload: true});

module.exports = User
*/

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: false,
    default: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('User', UserSchema)
