import pool from "../../config/db.mjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.mjs";  

const ForgotPassword = async (req, res) => {

  const { email } = req.body;
   const  errorObject ={}
  if (!email || email.trim() === "") {
    return res.status(400).json({
      message: "L'adresse email est requise",
      errorObject:{ email: "L'adresse email est requise" },
    });
  }

  const emailRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegexp.test(email.trim())) {
    return res.status(400).json({
      message: "L'adresse email est invalide",
      errorObject: { email: "L'adresse email est invalide" },
    });
  }

  try {
    const lowercaseEmail = email.toLowerCase().trim();

    const userQuery = await pool.query(
      "SELECT id, nom, email FROM public.register WHERE email = $1",
      [lowercaseEmail]
    );

    if (userQuery.rows.length === 0) {
      return res.status(200).json({
        message: "Un lien de réinitialisation a été envoyé.",
      });
    }

    const user = userQuery.rows[0];

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    await pool.query(
      "UPDATE public. register SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [resetToken, resetTokenExpiry, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0a0a0a; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background-color: #c9a96e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.nom}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur KBF.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #c9a96e;">${resetLink}</p>
            <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>© 2026 KBF</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe - KBF",
      html: emailHtml,
    });

    if (!emailSent) {
      return res.status(500).json({
        message: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
      });
    }

    return res.status(200).json({
      message: "Un email de réinitialisation a été envoyé à votre adresse.",
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({
      message: "Erreur lors de la demande de réinitialisation.",
    });
  }

}; 

export default ForgotPassword;