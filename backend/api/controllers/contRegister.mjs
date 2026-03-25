import pool from "../../config/db.mjs";
import bcrypt from "bcrypt";

const Register = async (req, res) => {
  const emailRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegexp = /^(?:\+228|228)?[279]\d{7}$/;
const passwordRegexp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const { nom, prenom, email, tel, mdp, term } = req.body;
  const termValid = term === true || term === "true"; // Accepter les booléens et les chaînes de caractères

  const errorObject = {};

  if (!nom || nom.trim() === "") {
    errorObject.nom = "le nom est requis";
  }
  if (!prenom || prenom.trim() === "") {
    errorObject.prenom = "le prenom est requis";
  }
  if (!email || email.trim() === "") {
    errorObject.email = "l'email est requis";
  } else if (!emailRegexp.test(email.trim())) {
    errorObject.email = "email invalide";
  } else if (email.trim().length > 50) {
    errorObject.email = "email trop long (50 caractères maximum)";
  }
  if (!tel || tel.trim() === "") {
    errorObject.tel = "votre contact est requis";
  } else if (!phoneRegexp.test(tel.trim())) {
    errorObject.tel = "contact invalide";
  }
  if (!mdp || mdp.trim() === "") {
    errorObject.mdp = "le mot de passe est requis";
  } else if (mdp.trim().length < 8) {
    errorObject.mdp = "le mot de passe doit contenir au moins 8 caractères";
  } else if (!passwordRegexp.test(mdp.trim())) {
    errorObject.mdp = "au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
  }

 if (!termValid) {
    errorObject.term = "vous devez accepter les termes et conditions";
  }

  if (Object.keys(errorObject).length > 0) {
    return res.status(400).json({
      message: "Veuillez corriger les erreurs dans le formulaire",
      errorObject: errorObject,
    });
  }

  try {
    const lowercaseEmail = email.toLowerCase().trim();

    const checkEmail = await pool.query(
      "SELECT id FROM public.register WHERE email = $1",
      [lowercaseEmail]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        message: "cet email existe deja",
        errorObject: { email: "cet email est deja utilise" },
      });
    }

    const checkPhone = await pool.query(
      "SELECT id FROM  public.register WHERE tel = $1",
      [tel.trim()]
    );
    if (checkPhone.rows.length > 0) {
      return res.status(409).json({
        message: "ce numero existe deja",
        errorObject: { tel: "ce numero est deja utilise" },
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hachedmdp = await bcrypt.hash(mdp.trim(), salt);

    const insertUserOnDb = `
      INSERT INTO public.register(nom, prenom, email, tel, mdp, term)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, tel, email
    `;

    const resultats = await pool.query(insertUserOnDb, [
      nom.trim(),
      prenom.trim(),
      lowercaseEmail,
      tel.trim(),
      hachedmdp,
      true,
    ]);

    return res.status(201).json({
      message: "inscription reussie",
      user: {
        id: resultats.rows[0].id,
        email: resultats.rows[0].email,
        tel: resultats.rows[0].tel,
      },
    });
  } catch (error) {
    console.error("Erreur serveur détaillée:", error);
    return res.status(500).json({
      message: "Erreur lors de l'inscription",
    });
  }
};

export default Register;