import pool from "../../config/db.mjs";
import "dotenv/config";
import bcrypt from "bcrypt";
import { createOtp } from "../services/serviceOtp.mjs";
import sendSms from "../utils/sendSms.mjs"; 

const Login = async (req, res) => {
  const emailRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegexp = /^(?:\+228|228)?[279]\d{7}$/;
  const passwordRegexp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const { email, tel, mdp } = req.body;

  const errorObject = {};

  if (!email || email.trim() === "") {
    errorObject.email = "l'email est requis";
  } else if (!emailRegexp.test(email.trim())) {
    errorObject.email = "email invalide";
  } else if (email.trim().length > 50) {
    errorObject.email = "email trop long (50 caractères maximum)";
  }

  if (!tel || tel.trim() === "") {
    errorObject.tel = "le numero de telephone est requis";
  } else if (!phoneRegexp.test(tel.trim())) {
    errorObject.tel = "contact invalide";
  }

  if (!mdp || mdp.trim() === "") {
    errorObject.mdp = "le mot de passe est requis";
  } else if (!passwordRegexp.test(mdp.trim())) {
    errorObject.mdp = "mot de passe invalide";
  }

  if (Object.keys(errorObject).length > 0) {
    return res.status(400).json({
      message: "Veuillez corriger les erreurs",
      errorObject: errorObject,
    });
  }

  try {
    const lowercaseEmail = email.toLowerCase().trim();

    const connectUser = await pool.query(
      "SELECT id, email, tel, mdp FROM public.register WHERE email = $1",
      [lowercaseEmail]
    );

    if (connectUser.rows.length === 0) {
      return res.status(401).json({
        message: "email ou mot de passe incorrect",
        errorObject: {
          email: "aucun compte associé à cet email",
        },
      });
    }

    const user = connectUser.rows[0];

    const ismdpValide = await bcrypt.compare(mdp.trim(), user.mdp);
    if (!ismdpValide) {
      return res.status(401).json({
        message: "email ou mot de passe incorrect",
        errorObject: {
          mdp: "le mot de passe est incorrect",
        },
      });
    }

    const connectTel = await pool.query(
      "SELECT id FROM public.register WHERE tel = $1",
      [tel.trim()]
    );
    if (connectTel.rows.length === 0) {
      return res.status(401).json({
        message: "numéro de téléphone incorrect",
        errorObject: {
          tel: "aucun compte associé à ce numéro",
        },
      });
    }

    const code = await createOtp(tel.trim());
    const smsSent = await sendSms(tel, `Votre code KBF : ${code}. Valable 2 minutes.`);

    if (!smsSent) {
      return res.status(500).json({
        message: "Erreur lors de l'envoi du SMS",
      });
    }

    return res.status(200).json({
      message: "Code OTP envoyé sur votre numéro",
      tel: tel.trim(),
    });

  } catch (error) {
    console.error("Erreur serveur détaillée:", error);
    return res.status(500).json({
      message: "Erreur lors de la connexion. Veuillez réessayer.",
    });
  }
};

export default Login;