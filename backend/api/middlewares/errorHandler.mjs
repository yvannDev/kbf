// Middleware pour les routes non trouvées (404)
export const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    message: "Route non trouvée",
    path: req.url 
  });
};

// Middleware pour les erreurs globales (500)
export const globalErrorHandler = (err, req, res, next) => {
  console.error(" Erreur serveur:", err);
  res.status(500).json({
    message: "Erreur serveur interne",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};