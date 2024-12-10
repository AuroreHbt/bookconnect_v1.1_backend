const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  canCreateBook: Boolean, //par défaut = true
  canCreateEvent: Boolean, //par défaut = true
  canLikeBook: Boolean, //par défaut = true
  canLikeEvent: Boolean, //par défaut = true
});

const User = mongoose.model('users', userSchema);

module.exports = User;
