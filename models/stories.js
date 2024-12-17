const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },   // foreign keys pour relier les stories créées par le même utilisateur.
    title: String, // Autre écriture rencontrée à confirmer : {type:String, require: true},
    isAdult : Boolean, // par défaut = false
    category: String,
    description: String,
    coverImage: String, // url de l'image
    storyFile: String, // url du fichier
    isLiked: Boolean, // par défaut = false
    
}, { timestamps: { 
    createdAt: 'createdAt', // Nom personnalisé pour createdAt
    updatedAt: 'updatedAt'  // Nom personnalisé pour updatedAt
}
} );

const Story = mongoose.model('stories', storySchema);

module.exports = Story;