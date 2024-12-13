const express = require('express');
const router = express.Router();

const axios = require('axios'); // Pour appeler OpenCage

// Créer un fichier avec un nom aléatoire via le module uniqid
const uniqid = require('uniqid');

// import Cloudinary, url dans le fichier .env
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Module pour gérer les extensions
const mime = require('mime-types');

// import du Model
const Event = require('../models/events');

const API_KEY_MAP = process.env.EXPO_PUBLIC_MAP_API_KEY

// route POST pour ajouter un nouvel évènement avec upload Cloudinary
router.post('/addevent', async (req, res) => {
    try {
        const { planner, title, category, date, place, description, url, isLiked } = req.body;

        // Validation avec au moins ces champs obligatoires
        if (!title || !date || !place || !description || !category) {
            return res.json({ result: false, error: 'Les champs obligatoires ne sont pas remplis'});
        }

        // Appeler l'API OpenCage pour récupérer les coordonnées GPS
        // fonction encode l'adresse (place) pour garantir que les caractères spéciaux (comme les espaces ou les accents) soient correctement inclus dans l'URL sans provoquer d'erreur.
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${API_KEY_MAP}`;
        const geocodingResponse = await axios.get(openCageUrl);

        console.log(geocodingResponse.data);

        // Cette ligne envoie une requête HTTP de type GET à l'API OpenCage pour obtenir les coordonnées géographiques (latitude et longitude) correspondant à l'adresse place
        if (!geocodingResponse.data || geocodingResponse.data.results.length === 0) {
            return res.json({ result: false, error: 'Adresse introuvable'});
        };

        const { lat, lng } = geocodingResponse.data.results[0].geometry;

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
            location: {
                type: 'Point',
                coordinates: [lng, lat],
            },
        });
        

        // Sauvegarde dans MongoDB
        const savedEvent = await newEvent.save();

        // Récupérer et populate les informations du planner
        const populatedEvent = await Event.findById(savedEvent._id).populate('planner');


        res.json({ result: true, message: 'Événement créé avec succès', event: populatedEvent });
        } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur lors de la création de l\'événement.' });
        };

});


// route GET pour rechercher un évènement existant dans la BDD, par adresse (place)
router.get('/searchevent/:place', async (req, res) => {
    const { place }= req.params;

    try {
        // Est-ce que le paramètre place est renseigné ?
        if (!place) {
           return res.json({ result: false, error: 'Adresse requise'})
        }

        // Chercher des évènements correspondant avec la localisation, insensible à la casse avec la regex
        const events = await Event.find({ place: { $regex: new RegExp(place, 'i') } });

        // Check des évènements trouvés ou non
        if (events.length === 0) {
            return res.json({ result: false, error: 'Aucun évènement à cette adresse'})
        };

        // Populate les informations du planner pour chaque événement trouvé
        // .map() pour itérer sur chaque élément event
        // Promise.all() opération asynchrone pour attendre que tous les évènements soient populés avant de renvoyer la réponse
        const populatedEvents = await Promise.all(
            events.map(async (event) => {
                const populatedEvent = await event.populate('planner');
                return populatedEvent;
            })
        );

        // Si évenement trouvé, retourne le résultat ci-dessous
        res.json({ result: true, data: populatedEvents});
    } catch {
        console.log('erreur lors de la récupération des évènements');
    }
})


module.exports = router;
