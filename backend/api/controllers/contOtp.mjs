// controllers/contOtp.mjs
import { createOtp, verifyOtp } from "../services/serviceOtp.mjs";
import { validateSendOtp, validateVerifyOtp } from "../validators/validatorOtp.mjs";
import pool from "../../config/db.mjs";
import jwt from "jsonwebtoken";
import sendSms from "../utils/sendSms.mjs";

// ── Envoi du code OTP ──────────────────────────────────────
export const sendOtp = async (req, res) => {
  const { tel } = req.body;

  const errorObject = validateSendOtp(tel);
  if (Object.keys(errorObject).length > 0) {
    return res.status(400).json({
      message: "Veuillez corriger les erreurs",
      errorObject,
    });
  }

  try {
    const code = await createOtp(tel);

  const smsSent = await sendSms(tel, `Votre code KBF : ${code}. Valable 2 minutes.`);
if (!smsSent) {
  return res.status(500).json({
    message: "Erreur lors de l'envoi du SMS",
  });
}

    return res.status(200).json({
      message: "Code OTP envoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur envoi OTP:", error);
    return res.status(500).json({
      message: "Erreur lors de l'envoi du code OTP",
    });
  }
};

// ── Vérification du code OTP ───────────────────────────────
export const verifyOtpController = async (req, res) => {
  const { tel, otp } = req.body;

  const errorObject = validateVerifyOtp(tel, otp);
  if (Object.keys(errorObject).length > 0) {
    return res.status(400).json({
      message: "Veuillez corriger les erreurs",
      errorObject,
    });
  }

  try {
    const result = await verifyOtp(tel, otp);

    if (!result.valid) {
      return res.status(401).json({
        message: result.reason,
        errorObject: { otp: result.reason },
      });
    }

    //récupère l'utilisateur depuis la base après OTP validé
    const userResult = await pool.query(
      "SELECT id, email, tel FROM public.register WHERE tel = $1",
      [tel.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    const user = userResult.rows[0];

    // génère le token JWT maintenant que l'OTP est validé
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Connexion réussie ! Bienvenue.",
      user: {
        id: user.id,
        email: user.email,
        tel: user.tel,
      },
      token: token,
    });

  } catch (error) {
    console.error("Erreur vérification OTP:", error);
    return res.status(500).json({
      message: "Erreur lors de la vérification du code OTP",
    });
  }
};