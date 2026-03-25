  import express from "express";
  import Register from "../controllers/contRegister.mjs";
  import Login from "../controllers/contLogin.mjs";
  import rateLimit from "express-rate-limit";
  import ForgotPassword from "../controllers/contsendEmail.mjs";
  // routes/routeOtp.mjs
  import { sendOtp, verifyOtpController } from "../controllers/contOtp.mjs";
  import resetPassword from "../controllers/contConfirm.mjs";
  import sendEmail from "../utils/sendEmail.mjs";
  const route = express.Router();

  //  Rate Limiting pour l'inscription

  const registerLimite = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuites
    max: 5, // max de 5  tentatives
    message: {
      message: "trop de tentative revener dans  15 minuites",
    },
    stanstandardHeaders: true,
    legacyHeaders: false,
    // Clé personnalisée (par IP + User-Agent pour éviter les abus)
    keyGenerator: (req) => {
      return req.ip + req.headers["user-agent"];
    },
  });

  // Middleware de validation du body (optionnel mais recommandé)
  const validateRegistrationBody = (req, res, next) => {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        message: "Content-Type doit être application/json",
      });
    }

    // Vérifier que le body n'est pas vide
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Le corps de la requête est vide",
      });
    }

    next();
  };

  // Route principale
  route.post(
    "/register",
    registerLimite, // 1 Rate limiting
    validateRegistrationBody, // 2 Validation du body
    Register, // 3 Controller
  );
  // le endpoind de la connexion (route de la connexion)
  route.post("/login",Login)
  route.post("/sendEmail",sendEmail)  
// les autres route
route.post("/otp/send", sendOtp);
route.post("/otp/verify", verifyOtpController);
route.post("/sendEmail",ForgotPassword)
route.post("/reset-password",resetPassword);

  export default route
