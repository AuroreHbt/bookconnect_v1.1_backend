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
router.post('/signup', async (req, res) => {
  console.log(req.body);

  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  await User.findOne({ username: { $regex: new RegExp(req.body.username, 'i') } })
    .then(data => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          token: uid2(32),
        });

        newUser.save().then(newDoc => {
          console.log(newDoc);
          res.json({ result: true, username: newDoc.username, token: newDoc.token });
        });
      } else {
        // User already exists in database
        res.json({ result: false, error: 'User already exists' });
      }
    });
});

// route POST pour se connecter (user déjà inscrit)
router.post('/signin', async (req, res) => {
  console.log('req.body: ', req.body);

  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;  //l'utilisateur n'a pas (ou mal) rempli tous les champs (early return)
  }

  // Vérifier que l'email existe dans la BDD
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  console.log('Recherche user par son email :', req.body.email.toLowerCase());
  console.log('user: ', user);

  // si le user est trouvé par son mail dans la BDD et que le mdp correspond => connexion ok
  if (user !== null) {
    // Comparer le mot de passe uniquement si l'utilisateur existe
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.json({
        result: true,
        username: user.username,
        email: user.email,
        token: user.token,
        _id: user._id
      });
      // si le mdp est ok, user trouvé => la connexion s'effectue
    } else {
      res.json({ result: false, error: 'Utilisateur non trouvé ou erreur de mot de passe' });
      // Mot de passe incorrect => connexion annulée
    }
  } else {
    res.json({ result: false, error: 'Utilisateur non trouvé ou erreur de mot de passe' });
    // Utilisateur non trouvé => pas de comparaison de mdp et connexion annulée
  }
});

module.exports = router;
