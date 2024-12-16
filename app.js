// import de dotenv en noter en ligne 1 pour lier les variables d'environnement
require('dotenv').config();

// import du fichier connection pour la co avec la BDD
require('./models/connection');

const express = require('express');

// import de body-parser pour les req DELETE (body)
const bodyParser = require('body-parser');

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// import des routes définies dans le dossier routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const storiesRouter = require('./routes/stories');

const app = express();

// Middleware pour parser le JSON
app.use(bodyParser.json());
app.use(express.json());

// Middleware pour parser les données URL-encodées
app.use(bodyParser.urlencoded({ extended: true }));

// import pour CORS
const cors = require('cors');
app.use(cors());

// import pour express-fileupload
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration Express pour accepter le corps des requêtes DELETE (Content-Type est 'application/json'):
app.use((req, res, next) => {
    if (req.method === 'DELETE' && req.headers['content-type'] === 'application/json') {
        bodyParser.json()(req, res, next);
    } else {
        next();
    }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);
app.use('/stories', storiesRouter);

module.exports = app;
