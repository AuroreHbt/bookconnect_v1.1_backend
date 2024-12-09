const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  canCreateBook: Boolean, //par défaut = true
  canCreateEvent: Boolean, //par défaut = true
  canLikeBook: Boolean, //par défaut = false
  canLikeEvent: Boolean, //par défaut = false
});

const User = mongoose.model('users', userSchema);

module.exports = User;
