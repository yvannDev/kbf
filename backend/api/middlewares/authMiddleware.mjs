import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      message: "Accès refusé. Token manquant ou mal formaté." 
    });
  }

  // Extraire le token (format: "Bearer TOKEN")
  const token = authHeader.split(" ")[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET
    );

    // Ajouter les infos utilisateur à la requête
    req.user = decoded; // { id: ..., email: ... }

    // Passer au middleware suivant
    next();
  } catch (error) {
    console.error("Erreur JWT:", error.message);
    return res.status(401).json({ 
      message: "Token invalide ou expiré. Veuillez vous reconnecter." 
    });
  }
};

export default authMiddleware;