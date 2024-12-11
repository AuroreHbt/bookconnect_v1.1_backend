const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   // foreign keys pour relier les stories créées par le même utilisateur.
    title: String,
    category: String,
    isAdult : Boolean, // par défaut = false
    textContent : String, // url du fichier
    coverImage: String, // url de l'image
    description: String, // penser à utiliser substring pour limiter le nb de caracteres
    isLiked: Boolean, // par défaut = false    
});

const Story = mongoose.model('stories', storySchema);

module.exports = Story;