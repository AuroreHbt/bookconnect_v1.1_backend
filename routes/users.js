var express = require('express');
var router = express.Router();

// import du Model
const User = require('../models/users');

// import du module checkBody
const { checkBody } = require('../modules/checkBody');

// imports pour l'authentification (hash/token) 
const bcrypt = require('bcrypt');
const uid2 = require('uid2');


// route POST pour s'inscrire (new user)
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: { $regex: new RegExp(req.body.username, 'i') } }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

// route POST pour se connecter (user déjà inscrit)

//l'utilisateur n'a pas (ou mal) rempli tous les champs
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: { $regex: new RegExp(req.body.username, 'i') } }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, email: data.email }); // L'utilisateur est trouvé, la connexion s'effectue
    } else {
      res.json({ result: false, error: 'User not found or wrong password' }); // L'utilisateur n'est pas trouvé, soit il n'a pas de compte soit il a un compte mais il s'est trompé de mdp 
    }
  });
});

module.exports = router;
