const mongoose = require("mongoose");

const storySchema = mongoose.Schema({
  writer: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // foreign key : user qui a créé la story
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }], // foreign key : tableau des users qui ont liké l'event
  createdAt: Date,
  title: String, // Autre écriture rencontrée à confirmer : {type:String, require: true},
  isAdult: Boolean, // par défaut = false
  category: String,
  description: String,
  coverImage: String, // url de l'image
  storyFile: String, // url du fichier
});

const Story = mongoose.model("stories", storySchema);

module.exports = Story;
