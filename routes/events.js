const express = require("express");
const router = express.Router();


const axios = require("axios"); // Pour appeler OpenCage. Gestion automatique des JSON. Compatible avec Node.js

// Créer un fichier avec un nom aléatoire via le module uniqid
const uniqid = require("uniqid");

// import Cloudinary, url dans le fichier .env
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Module pour gérer les extensions
const mime = require("mime-types");

// import du Model
const Event = require("../models/events");
const User = require("../models/users");
const { checkBody } = require('../modules/checkBody');

const API_KEY_MAP = process.env.EXPO_PUBLIC_MAP_API_KEY;

<<<<<<< HEAD
// route POST pour ajouter un nouvel évènement avec upload Cloudinary
router.post("/addevent", async (req, res) => {
  try {
    const { planner, title, category, date, place, description, url, isLiked } =
      req.body;

    // Vérification que l'auteur est fourni
    if (!planner) {
      console.log("planner non fourni dans la requête.");
      return res.json({ result: false, error: "planner non spécifié." });
    }

    const user = await User.findOne({ username: planner });
    if (!user) {
      console.log("Organisateur introuvable dans la base de données :", author);
      return res.json({ result: false, error: "Organisateur non trouvé." });
    }

    // Validation avec au moins ces champs obligatoires
    if (!title || !date || !place || !description || !category) {
      return res.json({
        result: false,
        error: "Les champs obligatoires ne sont pas remplis",
      });
    }

    // Appeler l'API OpenCage pour récupérer les coordonnées GPS
    // fonction encode l'adresse (place) pour garantir que les caractères spéciaux (comme les espaces ou les accents) soient correctement inclus dans l'URL sans provoquer d'erreur.
    const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      place
    )}&key=${API_KEY_MAP}`;
    const geocodingResponse = await axios.get(openCageUrl);

    console.log(geocodingResponse.data);

    // Cette ligne envoie une requête HTTP de type GET à l'API OpenCage pour obtenir les coordonnées géographiques (latitude et longitude) correspondant à l'adresse place
    if (
      !geocodingResponse.data ||
      geocodingResponse.data.results.length === 0
    ) {
      return res.json({ result: false, error: "Adresse introuvable" });
    }
=======
router.post('/addevent', async (req, res) => {
    try {
        const { planner, title, category, date, place, description, url, isLiked } = req.body;

        // Vérification que l'auteur (planner) est fourni
        if (!planner) {
            return res.json({ result: false, error: "planner non spécifié." });
        }

        // Vérification que l'utilisateur (planner) existe dans la base de données
        const user = await User.findById(planner); // On vérifie par ID plutôt que par username
        if (!user) {
            return res.json({ result: false, error: "Organisateur non trouvé." });
        }

        // Validation des champs obligatoires
        if (!title || !category || !description || !date || !place || !place.number || !place.street || !place.city) {
            return res.json({ result: false, error: "Tous les champs obligatoires doivent être remplis." });
        }

        if (!date.day || !date.start || !date.end) {
            return res.json({ result: false, error: "Les champs date.day, date.start et date.end sont requis." });
        }

        // Créer l'adresse pour géocodage (OpenCage API)
        const address = `${place.number} ${place.street}, ${place.code} ${place.city}`;
        console.log("Adresse pour géocodage :", address);

        // Utiliser l'API OpenCage pour obtenir les coordonnées GPS
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${API_KEY_MAP}`;
        const geocodingResponse = await axios.get(openCageUrl);

        if (!geocodingResponse.data || geocodingResponse.data.results.length === 0) {
            return res.json({ result: false, error: "Adresse introuvable." });
        }
>>>>>>> 158251dbe863c115e438c5841c00856530f488ff

    const { lat, lng } = geocodingResponse.data.results[0].geometry;

<<<<<<< HEAD
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
      const validExtensions = ["jpg", "jpeg", "png", "gif"];
      if (!validExtensions.includes(fileExtension)) {
        return res.json({
          result: false,
          error: "Type de fichier non pris en charge",
=======
        // Gestion de l'image de l'événement (si présente)
        let eventImage = null;
        if (req.files && req.files.eventImage) {
            const file = req.files.eventImage;
            const fileExtension = mime.extension(file.mimetype);
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (!validExtensions.includes(fileExtension)) {
                return res.json({ result: false, error: "Type de fichier image non pris en charge." });
            }

            // Enregistrement de l'image temporairement avant de l'envoyer à Cloudinary
            const eventPath = `./tmp/${uniqid()}.${fileExtension}`;
            await file.mv(eventPath);

            const resultCloudinary = await cloudinary.uploader.upload(eventPath);
            fs.unlinkSync(eventPath); // Supprimer le fichier temporaire après le téléchargement sur Cloudinary

            eventImage = resultCloudinary.secure_url;
        }

        // Création de l'événement avec les données validées
        const { day, start, end } = date;
        const { number, street, city, code } = place;

        const newEvent = new Event({
            planner: user._id,  // Utiliser l'ID de l'utilisateur (organisateur)
            title,
            category,
            date: { day, start, end },
            place: { number, street, city, code },
            description,
            eventImage,
            url,
            isLiked: isLiked || false,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
            },
>>>>>>> 158251dbe863c115e438c5841c00856530f488ff
        });
      }

<<<<<<< HEAD
      const eventPath = `./tmp/${uniqid()}.${fileExtension}`;

      // Déplacer le fichier temporairement sur le backend
      const resultMove = await req.files.eventImage.mv(eventPath);

      // Charger le fichier sur Cloudinary
      const resultCloudinary = await cloudinary.uploader.upload(eventPath);

      // Supprimer le fichier temporaire local
      fs.unlinkSync(eventPath);

      // Mise à jour de l'URL de l'image
      eventImage = resultCloudinary.secure_url;
    }

    // Création de l'évènement avec ou sans image
    const newEvent = new Event({
      planner: user._id, // Utilisation de l'ID MongoDB de l'utilisateur
      title,
      category,
      date: {
        day,
        start,
        end,
      },
      place: {
        number,
        street,
        code,
        city,
      },
      description,
      eventImage,
      url,
      isLiked: isLiked || false,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });

    // Sauvegarde dans MongoDB
    const savedEvent = await newEvent.save();

    // Récupérer et populate les informations du planner
    const populatedEvent = await Event.findById(savedEvent._id).populate(
      "planner"
    );

    res.json({
      result: true,
      message: "Événement créé avec succès",
      event: populatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.json({
      result: false,
      error: "Erreur lors de la création de l'événement.",
    });
  }
});

// route GET pour rechercher un évènement existant dans la BDD, par adresse (place)
router.get("/searchevent/:place", async (req, res) => {
  const { place } = req.params;

  try {
    // Est-ce que le paramètre place est renseigné ?
    if (!place) {
      return res.json({ result: false, error: "Adresse requise" });
    }

    // Chercher des évènements correspondant avec la localisation, insensible à la casse avec la regex
    const events = await Event.find({
      place: { $regex: new RegExp(place, "i") },
    });

    // Check des évènements trouvés ou non
    if (events.length === 0) {
      return res.json({
        result: false,
        error: "Aucun évènement à cette adresse",
      });
    }

    // Populate les informations du planner pour chaque événement trouvé
    // .map() pour itérer sur chaque élément event
    // Promise.all() opération asynchrone pour attendre que tous les évènements soient populés avant de renvoyer la réponse
    const populatedEvents = await Promise.all(
      events.map(async (event) => {
        const populatedEvent = await event.populate("planner");
        return populatedEvent;
      })
    );

    // Si évenement trouvé, retourne le résultat ci-dessous
    res.json({ result: true, data: populatedEvents });
  } catch {
    console.log("erreur lors de la récupération des évènements");
  }
});

router.delete("/deleteevent", (req, res) => {
  console.log("relou");
  if (!checkBody(req.body, ["token", "eventId"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ token: req.body.token }).then((user) => {
    if (user === null) {
      res.json({ result: false, error: "User not found" });

      return;
    }

    Event.findById(req.body.eventId)
      .populate("planner")
      .then((event) => {
        if (!event) {
          res.json({ result: false, error: "event not found" });
          return;
        } else if (String(event.planner._id) !== String(user._id)) {
          // ObjectId needs to be converted to string (JavaScript cannot compare two objects)
          res.json({
            result: false,
            error: "event can only be deleted by its author",
          });
          return;
        }

        event.deleteOne({ _id: event._id }).then(() => {
          res.json({ result: true });
          console.log("event deleted");
        });
      });
  });
});
=======
        // Sauvegarde de l'événement dans la base de données
        const savedEvent = await newEvent.save();

        // Récupération de l'événement peuplé avec les informations de l'organisateur (planner)
        const populatedEvent = await Event.findById(savedEvent._id).populate('planner');

        res.json({
            result: true,
            message: "Événement créé avec succès.",
            event: populatedEvent
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'événement :", error);
        res.json({ result: false, error: "Erreur lors de la création de l'événement." });
    }
});




// route GET pour rechercher un évènement existant dans la BDD, par adresse (place)
router.get('/searchevent/:place', async (req, res) => {
    const { place } = req.params;
  
    try {
        console.log('Requête reçue avec place:', place);
      // Est-ce que le paramètre place est renseigné ?
      if (!place) {
        return res.json({ result: false, error: 'Adresse requise' });
      }
  
      // Rechercher des événements correspondant à la localisation
      const searchConditions = [
        { 'place.city': { $regex: new RegExp(place, 'i') } },
        { 'place.street': { $regex: new RegExp(place, 'i') } },
      ];
      
      if (!isNaN(parseInt(place, 10))) {
        searchConditions.push({ 'place.code': parseInt(place, 10) });
      }
      
      const events = await Event.find({ $or: searchConditions });

      console.log('Événements trouvés:', events);
  
      // Vérifier si des événements ont été trouvés
      if (events.length === 0) {
        console.log('Aucun événement trouvé pour ce lieu');
        return res.json({ result: false, error: 'Aucun évènement à cette adresse' });
      }
  
      // Populate les informations du planner pour chaque événement
      const populatedEvents = await Promise.all(
        events.map(async (event) => {
          try {
            const populatedEvent = await event.populate('planner');
            return populatedEvent;
          } catch (err) {
            console.error('Erreur de population pour l\'événement:', event, err);
            throw err;
          }
        })
      );
      console.log('Événements après population:', populatedEvents);
  
      // Formater les données si nécessaire (par ex., adresse formatée)
      const formattedEvents = populatedEvents.map((event) => {
        const place = event.place || {};
        const { number = '', street = '', code = '', city = '' } = place;
        const formattedAddress = `${number} ${street}, ${code} ${city}`;
        return {
          ...event.toObject(),
          formattedAddress,
        };
      });
  
      // Retourner les événements
      res.json({ result: true, data: formattedEvents });
    } catch (error) {
      console.error('Erreur lors de la récupération des évènements:', error.message);
      res.status(500).json({ result: false, error: 'Erreur serveur' });
    }
  });
  
>>>>>>> 158251dbe863c115e438c5841c00856530f488ff

module.exports = router;
