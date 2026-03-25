import AfricasTalking from "africastalking";

const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = AT.SMS;

const sendSms = async (tel, message) => {
  try {
    const result = await sms.send({
      to: [tel],
      message: message,
      from: process.env.AT_SENDER_ID || "", // optionnel
    });
    console.log("SMS envoyé:", result);
    return true;
  } catch (error) {
    console.error("Erreur envoi SMS:", error);
    return false;
  }
};

export default sendSms;