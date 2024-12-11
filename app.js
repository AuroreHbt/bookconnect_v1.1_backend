// import de dotenv en noter en ligne 1 pour lier les variables d'environnement
require('dotenv').config();

// import du fichier connection pour la co avec la BDD
require('./models/connection');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// import des routes définies dans le dossier routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');

const app = express();

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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/events', eventsRouter);

module.exports = app;
