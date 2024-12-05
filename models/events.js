const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    name: String,
    place: String,
    date: Date,
    description: String,    // penser à utiliser subtring pour limiter le nb de caractères affichés sur l'appli
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   // foreign keys pour relier les events de l'utilisateur entre eux => 2 collections en BDD;
})

const Event = mongoose.model('events', eventSchema);
module.exports = Event;
