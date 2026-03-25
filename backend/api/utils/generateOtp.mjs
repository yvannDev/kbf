// utils/generateOtp.mjs
// Génère un code OTP à 4 chiffres aléatoire
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export default generateOtp;