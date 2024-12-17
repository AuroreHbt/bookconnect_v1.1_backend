const express = require("express");
const router = express.Router();

// Créer un fichier avec un nom aléatoire via le module uniqid
const uniqid = require("uniqid");

// import Cloudinary, url dans le fichier .env
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Module pour gérer les extensions
const mime = require("mime-types");

// import du Model
const Story = require("../models/stories");
const User = require("../models/users");

// import du module checkBody
const { checkBody } = require("../modules/checkBody");

// Routes pour poster une nouvelle histoire
router.post("/addstory", async (req, res) => {
    try {
        console.log("Requête reçue - req.body :", req.body); // Champs textuels
        console.log("Requête reçue - req.files :", req.files); // Fichiers envoyés

        // Déstructuration des champs textuels
        const { author, title, isAdult, category, description } = req.body;

        // Vérification que l'auteur est fourni
        if (!author) {
            console.log("Auteur non fourni dans la requête.");
            return res.json({ result: false, error: "Auteur non spécifié." });
        }

        // Log des champs textuels reçus
        console.log("Auteur reçu :", author);
        console.log("Titre :", title);
        console.log("Adulte :", isAdult);
        console.log("Description :", description);
        console.log("Catégorie :", category);

        // Validation des champs obligatoires
        if (!title || !isAdult || !description || !category) {
            console.log("Champs obligatoires manquants :", {
                title,
                isAdult,
                description,
                category,
            });
            return res.json({
                result: false,
                error: "Les champs obligatoires ne sont pas remplis.",
            });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ username: author });
        if (!user) {
            console.log("Auteur introuvable dans la base de données :", author);
            return res.json({ result: false, error: "Auteur non trouvé." });
        }

        console.log("Utilisateur trouvé :", user);

        let coverImage = null; // URL de l'image de couverture (si fournie)
        let storyFile = null; // URL du fichier texte (si fourni)

        // Vérification et traitement des fichiers envoyés
        if (req.files) {
            console.log("Fichiers reçus :", req.files);

            // Traitement de l'image de couverture si présente
            if (req.files.coverImage) {
                console.log("Traitement de l'image de couverture...");
                const imgFile = req.files.coverImage;
                const imgFileExtension = mime.extension(imgFile.mimetype);
                console.log("Extension de l'image :", imgFileExtension);

                // Vérification des extensions valides pour les images
                const imgValidExtensions = ["jpg", "jpeg", "png", "gif"];
                if (!imgValidExtensions.includes(imgFileExtension)) {
                    console.log("Type d'image non pris en charge :", imgFileExtension);
                    return res.json({
                        result: false,
                        error: "Type de fichier image non pris en charge",
                    });
                }

                // Chemin temporaire pour stocker l'image
                const coverPath = `./tmp/${uniqid()}.${imgFileExtension}`;
                await imgFile.mv(coverPath);
                console.log("Fichier temporaire déplacé :", coverPath);

                // Upload de l'image sur Cloudinary
                const resultCloudinaryCover = await cloudinary.uploader.upload(
                    coverPath
                );
                console.log(
                    "Image uploadée sur Cloudinary :",
                    resultCloudinaryCover.secure_url
                );

                // Suppression du fichier temporaire local
                fs.unlinkSync(coverPath);
                console.log("Fichier temporaire supprimé :", coverPath);

                coverImage = resultCloudinaryCover.secure_url;
            }

            // Traitement du fichier texte
            if (req.files.storyFile) {
                console.log("Traitement du fichier texte...");
                const txtFile = req.files.storyFile;
                const txtFileExtension = mime.extension(txtFile.mimetype);
                console.log("Extension du fichier texte :", txtFileExtension);

                // Vérification des extensions valides pour les fichiers texte
                const txtValidExtensions = ["pdf", "docx", "txt"];
                if (!txtValidExtensions.includes(txtFileExtension)) {
                    console.log(
                        "Type de fichier texte non pris en charge :",
                        txtFileExtension
                    );
                    return res.json({
                        result: false,
                        error: "Type de fichier texte non pris en charge",
                    });
                }

                // Chemin temporaire pour stocker le fichier texte
                const contentPath = `./tmp/${uniqid()}.${txtFileExtension}`;
                await txtFile.mv(contentPath);
                console.log("Fichier temporaire déplacé :", contentPath);

                // Upload du fichier texte sur Cloudinary
                const resultCloudinaryContent = await cloudinary.uploader.upload(
                    contentPath
                );
                console.log(
                    "Fichier texte uploadé sur Cloudinary :",
                    resultCloudinaryContent.secure_url
                );

                // Suppression du fichier temporaire local
                fs.unlinkSync(contentPath);
                console.log("Fichier temporaire supprimé :", contentPath);

                // Mise à jour de l'URL du fichier texte
                storyFile = resultCloudinaryContent.secure_url;
            }
        } else {
            console.log("Aucun fichier reçu.");
        }

        // Création d'un nouvel objet histoire
        const newStory = new Story({
            author: user._id, // Utilisation de l'ID MongoDB de l'utilisateur
            title,
            isAdult,
            category,
            description,
            coverImage,
            storyFile,
        });

        console.log("Nouvelle histoire à sauvegarder :", newStory);

        // Sauvegarde de l'histoire dans la base de données
        const savedStory = await newStory.save();
        console.log("Histoire sauvegardée :", savedStory);
        res.json({
            result: true,
            message: "Histoire publiée avec succès",
            story: savedStory,
        });
    } catch (error) {
        console.error("Erreur lors de la publication de l'histoire :", error);
    }
});

// Route pour chercher les nouvelles histoires postées par un auteur
router.get("/mypublishedstory/:author", (req, res) => {
    console.log("Requête reçue pour auteur :", req.params.author);

    // Recherche de l'utilisateur dans la base de données
    User.findOne({ username: req.params.author }).then((user) => {
        // Si aucun utilisateur trouvé, renvoie une erreur
        if (!user) {
            return res.json({ result: false, error: "Auteur non trouvé" });
        }
        // Si l'utilisateur est trouvé, rechercher toutes les histoires associées à son ID
        Story.find({ author: user._id })
            .populate("author", ["username", "email"]) // Remplit les détails de l'auteur (nom d'utilisateur et email) pour chaque histoire
            .populate("category")
            .sort({ createdAt: "desc" }) // Trie les histoires par ordre décroissant de date de création
            .then((stories) => {
                console.log("histoires trouvées :", stories); // stories = [{...}]
                res.json({ result: true, stories }); // Renvoyer les histoires trouvées
            });
    });
});

// Route pour supprimer une histoire spécifique d'un auteur
router.delete("/deletepublishedstory", async (req, res) => {
    try {
        // Debug => ok
        // console.log('connexion route ok')
        // console.log("Requête :", req.body)
        // console.log("Requête reçue - req.body.token :", req.body.token);
        // console.log("Requête reçue - req.body.storyId :", req.body.id);

        if (!checkBody(req.body, ["token", "id"])) {
            res.json({ result: false, error: "User ou story non trouvés" });
            return; // early return : stop le code si la condition n'est pas remmplie
        }

        // recherche du user qui correspond à l'author
        User.findOne({ token: req.body.token }).then((user) => {
            if (user === null) {
                res.json({ result: false, error: "User not found" });
                return;
            }

            // recherche de l'histoire qui correspond à l'author
            Story.findById(req.body.id)
                .populate("author")
                .then((story) => {
                    if (!story) {
                        res.json({ result: false, error: "story not found" });
                        return;
                    } else if (String(story.author._id) !== String(user._id)) { // ObjectId doit être converti en format string (JS ne peut pa comparer 2 objets) : vérifie si l'histoire existe et si l'utilisateur est l'author de la story
                        res.json({
                            result: false,
                            error: "Story can only be deleted by its author",
                        });
                        return;
                    }

                    story.deleteOne({ _id: story._id }).then(() => {
                        res.json({ result: true, message: "story deleted" });
                    });
                });
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'histoire :", error);
    }
});


// Route pour modifier une histoire spécifique d'un auteur
router.put('/updatepublishedstory', async (req, res) => {
    try {
        // Debug => ok
        console.log('connexion route ok')
        console.log("Requête :", req.body)
        console.log("Requête reçue - req.body.token :", req.body.token);
        console.log("Requête reçue - req.body.storyId :", req.body.id);

        if (!checkBody(req.body, ["token", "id"])) {
            res.json({ result: false, error: "User ou story non trouvés" });
            return; // early return : stop le code si la condition n'est pas remmplie
        }

        // recherche du user qui correspond à l'author
        User.findOne({ token: req.body.token }).then((user) => {
            if (user === null) {
                res.json({ result: false, error: "User not found" });
                return;
            }

            // recherche de l'histoire qui correspond à l'author
            Story.findById(req.body.id)
                .populate("author")
                .then((story) => {
                    if (!story) {
                        res.json({ result: false, error: "story not found" });
                        return;
                    } else if (String(story.author._id) !== String(user._id)) {
                        // ObjectId doit être converti en format string (JS ne peut pa comparer 2 objets) : vérifie si l'histoire existe et si l'utilisateur est l'author de la story
                        res.json({
                            result: false,
                            error: "Story can only be deleted by its author",
                        });
                        return;
                    }

                    story.deleteOne({ _id: story._id }).then(() => {
                        res.json({ result: true, message: "story deleted" });
                    });
                });
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'histoire :", error);
    }
});

// Route get pour rechercher une histoire soit par titre, auteur, catégorie ou bien avec ces trois champs

router.get("/search", (req, res) => {
    const { author, title, category } = req.query;

    if (!author && !title && !category) {
        return res.json({
            result: false,
            error:
                "Veuillez fournir un auteur, un titre ou une catégorie pour la recherche.",
        });
    }

    const filter = {};
    if (title) filter.title = new RegExp(title, "i");
    if (category) filter.category = new RegExp(category, "i");

    // Si un auteur est fourni, rechercher directement dans `users`
    if (author) {
        User.findOne({ username: new RegExp(author, "i") }).then((user) => {
            if (!user) {
                return res.json({ result: false, error: "Auteur non trouvé." });
            }

            // Ajouter l'ID de l'utilisateur au filtre
            filter.author = user._id;

            // Effectuer la recherche des histoires
            Story.find(filter)
                .populate("author", ["username", "email"])
                .sort({ createdAt: "desc" })
                .then((stories) => {
                    if (stories.length === 0) {
                        return res.json({
                            result: false,
                            error: "Aucune histoire trouvée pour les critères donnés.",
                        });
                    }
                    res.json({ result: true, stories });
                });
        });
    } else {
        // Si pas d'auteur, chercher uniquement par titre
        Story.find(filter)
            .populate("author", ["username", "email"])
            .sort({ createdAt: "desc" })
            .then((stories) => {
                if (stories.length === 0) {
                    return res.json({
                        result: false,
                        error: "Aucune histoire trouvée pour les critères donnés.",
                    });
                }
                res.json({ result: true, stories });
            });
    }
});

// Route get pour chercher toutes les histoires, peu importe l'auteur

router.get("/allstories", (req, res) => {
    Story.find()
        .populate("author", ["username", "email"])
        .then((stories) => {
            if (!stories || stories.length === 0) {
                return res.json({
                    result: false,
                    error: "Aucune histoire trouvée pour les critères donnés.",
                });
            }
            res.json({ result: true, stories })
        })
})

router.get("/laststories", (req, res) => {
    Story.find()
        .populate("author", ["username", "email"])
        .sort({ createdAt: "desc" })
        .then((stories) => {
            if (!stories || stories.length === 0) {
                return res.json({
                    result: false,
                    error: "Aucune histoire trouvée pour les critères donnés.",
                });
            }
            res.json({ result: true, stories })
        })
})

module.exports = router;
