const express = require('express');
const router = express.Router();

// Créer un fichier avec un nom aléatoire via le module uniqid
const uniqid = require('uniqid');

// import Cloudinary, url dans le fichier .env
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Module pour gérer les extensions
const mime = require('mime-types');

// import du Model
const Story = require('../models/stories');



router.post('/addstory', async (req, res) => {
    try {
        
        console.log("req.body :", req.body); // Contient les champs textuels (title, description, etc.)
        console.log("req.files :", req.files); // Contient les fichiers envoyés (coverImage, storyFile)

        // Déstructuration des champs textuels envoyés dans le body
        const { author, title, isAdult, category, description } = req.body;

        // Validation des champs obligatoires (title, isAdult, description)
        if (!title || !isAdult || !description) {
            return res.json({ result: false, error: 'Les champs obligatoires ne sont pas remplis' });
        }

        let coverImage = null; // URL de l'image de couverture (si fournie)
        let storyFile = null; // URL du fichier texte (obligatoire)

        // Vérification si des fichiers sont envoyés
        if (req.files) {
            // Traitement de l'image de couverture si elle est envoyée
            if (req.files.coverImage) {
                const imgFile = req.files.coverImage; // Récupération de l'image
                const imgFileExtension = mime.extension(imgFile.mimetype); // Extraction de l'extension
                const imgValidExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Extensions d'image valides

                // Vérification du type de fichier image
                if (!imgValidExtensions.includes(imgFileExtension)) {
                    return res.json({ result: false, error: 'Type de fichier image non pris en charge' });
                }

                // Chemin temporaire pour stocker le fichier localement
                const coverPath = `./tmp/${uniqid()}.${imgFileExtension}`;
                await imgFile.mv(coverPath); // Déplacement du fichier en local

                // Upload de l'image sur Cloudinary
                const resultCloudinaryCover = await cloudinary.uploader.upload(coverPath);

                // Suppression du fichier temporaire
                fs.unlinkSync(coverPath);

                // URL sécurisée de l'image sur Cloudinary
                coverImage = resultCloudinaryCover.secure_url;
            }

            // Traitement du fichier texte si envoyé
            if (req.files.storyFile) {
                const txtFile = req.files.storyFile; // Récupération du fichier texte
                const txtFileExtension = mime.extension(txtFile.mimetype);
                const txtValidExtensions = ['pdf', 'docx']; 

                // Vérification du type de fichier texte
                if (!txtValidExtensions.includes(txtFileExtension)) {
                    return res.json({ result: false, error: 'Type de fichier texte non pris en charge' });
                }

                const contentPath = `./tmp/${uniqid()}.${txtFileExtension}`;
                await txtFile.mv(contentPath); 

                // Upload du fichier texte sur Cloudinary
                const resultCloudinaryContent = await cloudinary.uploader.upload(contentPath);

                // Suppression du fichier temporaire
                fs.unlinkSync(contentPath);

                
                storyFile = resultCloudinaryContent.secure_url;
            }
        }

        // Création d'une nouvelle histoire dans la base de données
        const newStory = new Story({
            author, 
            title, 
            isAdult, 
            category, 
            description, 
            coverImage, 
            storyFile,
        });

        // Sauvegarde de l'histoire dans MongoDB
        const savedStory = await newStory.save();

        // Réponse envoyée au front-end
        res.json({ result: true, message: 'Histoire publiée avec succès', story: savedStory });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur lors de la publication de l\'histoire.' });
    }
});

module.exports = router;



