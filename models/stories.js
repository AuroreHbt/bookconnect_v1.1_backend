const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   // foreign keys pour relier les stories créées par le même utilisateur.
    title: String, // Autre écriture rencontrée à confirmer : {type:String, require: true},
    isAdult : Boolean, // par défaut = false
    category: String,
    description: String, // penser à utiliser substring pour limiter le nb de caracteres
    coverImage: String, // url de l'image
    storyFile: String, // url du fichier
    isLiked: Boolean, // par défaut = false    
});

const Story = mongoose.model('stories', storySchema);

module.exports = Story;