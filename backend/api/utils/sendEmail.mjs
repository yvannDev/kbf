import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {  
    // Créer le transporteur
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Options de l'email
    const mailOptions = { 
      from: `kbf<${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log(" Email envoyé:", info.messageId);
    return true;
  } catch (error) {
    console.error(" Erreur envoi email:", error);
    return false;
  }
};

export default sendEmail;