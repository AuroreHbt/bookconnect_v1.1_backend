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

// import du module checkBody
const { checkBody } = require("../modules/checkBody");

const API_KEY_MAP = process.env.EXPO_PUBLIC_MAP_API_KEY;

router.post("/addevent", async (req, res) => {
    console.log("Requête body :", req.body);  // Log du corps de la requête pour débogage
    
    try {
        // Vérifie si req.body.eventData est déjà un objet ou une chaîne JSON
        let eventData = req.body.eventData;
        if (typeof eventData === "string") {
            eventData = JSON.parse(eventData);
        }
    
        console.log("Données de l'événement :", eventData);
        
        const { planner, title, category, date, identityPlace, place, description, url, isLiked } = eventData;
    
        // Vérification que l'organisateur (planner) est fourni
        if (!planner) {
            return res.json({ result: false, error: "planner non spécifié." });
        }
    
        // Vérification que l'utilisateur (planner) existe dans la base de données
        console.log("Nom de l'organisateur envoyé :", planner);
        const user = await User.findById(planner);
        if (!user) {
            console.log("Planner introuvable dans la base de données :", planner);
            return res.json({ result: false, error: `Organisateur "${planner}" non trouvé.` });
        }
    
        // Validation des champs obligatoires
        if (
          !planner ||
          !title ||
          !category ||
          !date ||
          !date.day ||
          !date.start ||
          !date.end ||
          !identityPlace ||
          !place ||
          !place.number ||
          !place.street ||
          !place.city ||
          !description
        ) {
            return res.json({
                result: false,
                error: "Tous les champs obligatoires doivent être remplis.",
            });
        }
    
        if (!date.day || !date.start || !date.end) {
            return res.json({
                result: false,
                error: "Les champs date.day, date.start et date.end sont requis.",
            });
        }
    
        // Créer l'adresse pour géocodage (OpenCage API)
        const address = `${place.number} ${place.street}, ${place.code} ${place.city}`;
        console.log("Adresse pour géocodage :", address);
    
        // Utiliser l'API OpenCage pour obtenir les coordonnées GPS
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            address
        )}&key=${API_KEY_MAP}`;
        const geocodingResponse = await axios.get(openCageUrl);
    
        if (
            !geocodingResponse.data ||
            geocodingResponse.data.results.length === 0
        ) {
            return res.json({ result: false, error: "Adresse introuvable." });
        }
    
        const { lat, lng } = geocodingResponse.data.results[0].geometry;
    
        // Gestion de l'image de l'événement (si présente)
        let eventImage = null;
        if (req.files && req.files.eventImage) {
            const file = req.files.eventImage;
            const fileExtension = mime.extension(file.mimetype);
            const validExtensions = ["jpg", "jpeg", "png", "gif"];
            console.log("Fichiers reçus :", req.files);

    
            if (!validExtensions.includes(fileExtension)) {
                return res.json({
                    result: false,
                    error: "Type de fichier image non pris en charge.",
                });
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
            planner: user._id, // Utiliser l'ID de l'utilisateur (organisateur)
            title,
            category,
            date: { day, start, end },
            identityPlace,
            place: { number, street, city, code },
            description,
            eventImage,
            url,
            isLiked: isLiked || false,
            location: {
                type: "Point",
                coordinates: [lng, lat],
            },
        });
    
        // Sauvegarde de l'événement dans la base de données
        const savedEvent = await newEvent.save();
    
        // Récupération de l'événement peuplé avec les informations de l'organisateur (planner)
        const populatedEvent = await Event.findById(savedEvent._id).populate("planner");
        console.log("Événement peuplé :", populatedEvent); // Vérifie si eventImage contient l'URL
        res.json({
            result: true,
            message: "Événement créé avec succès.",
            event: populatedEvent,
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'événement :", error);
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
    console.log("Requête reçue avec place:", place);
    // Est-ce que le paramètre place est renseigné ?
    if (!place) {
      return res.json({ result: false, error: "Adresse requise" });
    }

    // Rechercher des événements correspondant à la localisation
    const searchConditions = [
      { "place.city": { $regex: new RegExp(place, "i") } },
      { "place.street": { $regex: new RegExp(place, "i") } },
    ];

    if (!isNaN(parseInt(place, 10))) {
      searchConditions.push({ "place.code": parseInt(place, 10) });
    }

    const events = await Event.find({ $or: searchConditions });

    console.log("Événements trouvés:", events);

    // Vérifier si des événements ont été trouvés
    if (events.length === 0) {
      console.log("Aucun événement trouvé pour ce lieu");
      return res.json({
        result: false,
        error: "Aucun évènement à cette adresse",
      });
    }

    // Populate les informations du planner pour chaque événement
    const populatedEvents = await Promise.all(
      events.map(async (event) => {
        try {
          const populatedEvent = await event.populate("planner");
          return populatedEvent;
        } catch (err) {
          console.error("Erreur de populate pour l'événement:", event, err);
          throw err;
        }
      })
    );
    console.log("Événements après populate:", populatedEvents);
                                                                                                                   
    // Formater les données si nécessaire (par ex., adresse formatée)
    const formattedEvents = populatedEvents.map((event) => {
      const place = event.place || {};
      const { number = "", street = "", code = "", city = "" } = place;
      const formattedAddress = `${number} ${street}, ${code} ${city}`;
      return {
        ...event.toObject(),
        formattedAddress,
      };
    });

    // Retourner les événements
    res.json({ result: true, data: formattedEvents });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des évènements:",
      error.message
    );
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.get('/searcheventByUser/:planner', (req, res) => {
    console.log('Requête reçue pour planner :', req.params.planner);

    // Recherche de l'utilisateur dans la base de données
    User.findOne({ username: req.params.planner })
        .then(user => {
            // Si aucun utilisateur trouvé, renvoie une erreur
            if (!user) {
                return res.json({ result: false, error: 'Planner non trouvé' });
            }
            // Si l'utilisateur est trouvé, rechercher toutes les histoires associées à son ID
            Event.find({ planner: user._id })
                .populate('planner', ['username', 'email']) // Remplit les détails de l'auteur (nom d'utilisateur et email) pour chaque histoire
                .populate('category')
                .sort({ createdAt: 'desc' }) // Trie les histoires par ordre décroissant de date de création
                .then(events => {
                    console.log('evenements trouvés :', events); // stories = [{...}]
                    res.json({ result: true, events }); // Renvoyer les histoires trouvées
                });
        });
});


router.delete("/deleteevent", (req, res) => {
  console.log("relou");
  console.log("Requête body :", req.body);
  if (!checkBody(req.body, ["token", "id"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  User.findOne({ token: req.body.token }).then((user) => {
    if (user === null) {
      res.json({ result: false, error: "Utilisateur non trouvé" });
      return;
    }
    console.log("Recherche de l'événement avec ID :", req.body.id);
    Event.findById(req.body.id)
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
        }).catch((error) => {
          res.json({ result: false, error: "Erreur lors de la suppression de l'événement" });
          console.error(error);
        });
      })
      .catch((error) => {
        res.json({ result: false, error: "Erreur interne du serveur" });
        console.error(error);
      });
  });
});


module.exports = router;
