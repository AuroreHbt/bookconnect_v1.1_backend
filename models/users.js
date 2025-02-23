const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String, // à utiliser pour authentifier le user connecté + gestion des droits d'accès

  // prévoir profil admin
  canUpdateUser: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canDeleteUser: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré

  // parcours events
  canCreateEvent: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canLikeEvent: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré

  // parcours stories
  canCreateStory: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canLikeStory: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré

  // parcours shop
  canCreateBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canBuyBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canSellBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canLikeBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
});

const User = mongoose.model("users", userSchema);

module.exports = User;
