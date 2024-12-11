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
const Event = require('../models/events');

// route POST pour ajouter un nouvel évènement avec upload Cloudinary
router.post('/addevent', async (req, res) => {
    try {
        const { planner, title, category, date, place, description, url, isLiked } = req.body;

        // Validation avec au moins ces champs obligatoires
        if (!title || !date || !place || !description || !category) {
            return res.json({ result: false, error: 'Les champs obligatoires ne sont pas remplis'});
        }

        // Valeur par défaut si aucune image n'est envoyé par l'organisateur
        let eventImage = null;

        // Vérifier uniquement si un fichier est présent => Si aucun fichier n'est fourni, l'évènement est créé avec eventImage à null
        // eventImage= nom de la propriété à réutiliser côté frontend
        if (req.files && req.files.eventImage) {

        // // Récupérer le mimetype du fichier et extraire l'extension
        const file = req.files.eventImage;
        const fileExtension = mime.extension(file.mimetype);

        // Vérifier que le fichier est une image valide acceptée par Cloudinary
        // les extensions dynamiques sont supportées
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!validExtensions.includes(fileExtension)) {
        return res.json({ result: false, error: 'Type de fichier non pris en charge' });
        }

        const eventPath = `./tmp/${uniqid()}.${fileExtension}`;

        // Déplacer le fichier temporairement sur le backend
        const resultMove = await req.files.eventImage.mv(eventPath);

        // Charger le fichier sur Cloudinary
        const resultCloudinary = await cloudinary.uploader.upload(eventPath)
    
        // Supprimer le fichier temporaire local
        fs.unlinkSync(eventPath);

        // Mise à jour de l'URL de l'image
        eventImage = resultCloudinary.secure_url;
    };

        // Création de l'évènement avec ou sans image
        const newEvent = new Event({
            planner,
            title,
            category,
            date,
            place,
            description,
            eventImage,
            url,
            isLiked: isLiked || false,
        });

        // Sauvegarde dans MongoDB
        const savedEvent = await newEvent.save();

        res.json({ result: true, message: 'Événement créé avec succès', event: savedEvent });
        } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur lors de la création de l\'événement.' });
        };

})


module.exports = router;
