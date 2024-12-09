const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    planner: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   // foreign keys pour relier les stories créées par le même utilisateur.
    title: String,
    category: String,
    date: Date,
    place: String,
    description: String, // penser à utiliser substring pour limiter le nb de caracteres
    eventImage: String, // url de l'image
    url: String, //url de l'event (site externe par exemple)
    isLiked: Boolean, // par défaut = false    
})

const Event = mongoose.model('events', eventSchema);
module.exports = Event;
