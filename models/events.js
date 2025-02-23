const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  planner: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // foreign key : user qui a créé l'event
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }], // foreign key : tableau des users qui ont liké l'event
  title: String,
  category: String,
  date: {
    day: Date,
    start: Date,
    end: Date,
  },
  identityPlace: String,
  place: {
    number: Number,
    street: String,
    code: Number,
    city: String,
  },
  description: String, // penser à utiliser substring pour limiter le nb de caracteres
  eventImage: String, // url de l'image
  url: String, //url de l'event (site externe par exemple)
  location: {
    // Coordonnées GPS au format GeoJSON
    type: { type: String, default: "Point" },
    coordinates: [Number], // [longitude, latitude]
  },
  /* Objet location/place/date directement stocké avec l'événement. 
    Il ne bénéficie pas des fonctionnalités avancées des sous-documents, mais il est simple et parfaitement adapté à des champs 
    qui ne nécessitent pas de gestion indépendante. Pas réutilisable donc pas besoin d'un sous-document */
});

const Event = mongoose.model("events", eventSchema);
module.exports = Event;
