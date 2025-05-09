const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  auth0Id: {
    type: String, // This stores the Auth0 user ID
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
