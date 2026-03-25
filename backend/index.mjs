import express from "express";
import authRoutes from "./api/routes/userRoutes.mjs";

//  IMPORT DES MIDDLEWARES
import corsConfig from "./api/middlewares/corsConfig.mjs";
import logger from "./api/middlewares/logger.mjs";
import { notFoundHandler, globalErrorHandler } from "./api/middlewares/errorHandler.mjs";

const app = express();

// MIDDLEWARES

// 1. CORS (doit être en premier)
app.use(corsConfig);

// 2. Parsing du body JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Logger des requêtes
app.use(logger);

// ROUTES

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API kbf fonctionne !",
    endpoints: {
      register: "POST /api/auth/register"
    }
  });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);

// GESTION DES ERREURS

// 404 - Route non trouvée
app.use(notFoundHandler);

// Erreurs globales
app.use(globalErrorHandler);


// DÉMARRAGE DU SERVEUR

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n Serveur en écoute sur : http://localhost:${PORT}`);
  console.log(` Frontend autorisé : http://localhost:5173\n`);
});

