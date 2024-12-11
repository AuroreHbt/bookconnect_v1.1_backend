<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Story = require("../models/story");
const User = require("../models/user");
=======
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


// route POST pour ajouter un book avec upload Cloudinary
router.post('/addstory', async (req, res) => {
    try {
        const { author, title, isAdult, category, description } = req.body;
        // correspondent aux champs à compléter
        // coverImage et textContent sont des upload et pas des champs à compléter
        console.log(req.body);
        // Validation avec au moins ces champs obligatoires
        if (!title || !category || !isAdult || !description) {
            return res.json({ result: false, error: 'Les champs obligatoires ne sont pas remplis' });
        }

        // Valeur par défaut si aucune image n'est envoyée par l'auteur
        let coverFile = null;

        // Valeur par défaut si aucun texte n'est envoyé par l'auteur
        let contentFile = null;

        // Vérifier uniquement si un fichier est présent
        // => Si aucun fichier n'est fourni, l'histoire est créée avec coverFile = null
        // coverFile et contentFile = noms des propriétés à réutiliser côté frontend
        if (req.files.coverFile || req.files.contentFile) {
            console.log(req.files.coverFile);
            console.log(req.files.contentFile);

            // Récupérer le mimetype du fichier et extraire l'extension
            const imgFile = req.files.coverFile;
            const txtFile = req.files.contentFile;
            const imgFileExtension = mime.extension(imgFile.mimetype);
            const txtFileExtension = mime.extension(txtFile.mimetype);
            console.log(imgFileExtension);
            console.log(txtFileExtension);

            // Vérifier que le fichier est une image valide acceptée par Cloudinary
            // les extensions dynamiques sont supportées
            const imgValidExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            if (!imgValidExtensions.includes(imgFileExtension)) {
                return res.json({ result: false, error: 'Type de fichier image non pris en charge' });
            }

            // Vérifier que le fichier est un texte valide accepté par Cloudinary
            const txtValidExtensions = ['pdf', 'docx'];
            if (!txtValidExtensions.includes(txtFileExtension)) {
                return res.json({ result: false, error: 'Type de fichier texte non pris en charge' });
            }

            // attribution d'un id unique pour save dans cloudinary
            const coverPath = `./tmp/${uniqid()}.${imgFileExtension}`;
            const contentPath = `./tmp/${uniqid()}.${txtFileExtension}`;
            console.log(coverPath);
            console.log(contentPath);

            // Déplacer le fichier temporairement sur le backend (dossier tmp)
            const resultMoveCover = await req.files.coverFile.mv(coverPath);
            const resultMoveContent = await req.files.contentFile.mv(contentPath);

            // Charger le fichier sur Cloudinary
            const resultCloudinaryCover = await cloudinary.uploader.upload(coverPath);
            const resultCloudinaryContent = await cloudinary.uploader.upload(contentPath);

            // Après l'upload sur le cloud, supprimer les fichiers temporaires en local
            fs.unlinkSync(coverPath);
            fs.unlinkSync(contentPath);

            // Mise à jour des URL des fichiers image et texte
            coverFile = resultCloudinaryCover.secure_url;
            contentFile = resultCloudinaryContent.secure_url;
            console.log(coverFile);
            console.log(contentFile);
        };

        // Création de l'évènement avec ou sans image
        const newStory = new Story({
            author,
            title,
            isAdult: isAdult || false,
            category,
            description,
            coverFile,
            contentFile,
        });

        // Sauvegarde dans MongoDB
        const savedStory = await newStory.save();

        res.json({ result: true, message: 'Histoire publiée avec succès', story: savedStory });
    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur lors de la publication de l\'histoire.' });
    };
});


module.exports = router;
>>>>>>> f4a297b7551ef128fe43d473b903a7b68431afdf
