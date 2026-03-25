// validators/validatorOtp.mjs
const phoneRegexp = /^(?:\+228|228)?[279]\d{7}$/;

export const validateSendOtp = (tel) => {
  const errorObject = {};
  if (!tel || tel.trim() === "") {
    errorObject.tel = "le numéro de téléphone est requis";
  } else if (!phoneRegexp.test(tel.trim())) {
    errorObject.tel = "numéro de téléphone invalide";
  }
  return errorObject;
};

export const validateVerifyOtp = (tel, otp) => {
  const errorObject = {};
  if (!tel || tel.trim() === "") {
    errorObject.tel = "le numéro de téléphone est requis";
  }
  if (!otp || otp.trim() === "") {
    errorObject.otp = "le code OTP est requis";
  } else if (!/^\d{4}$/.test(otp.trim())) {
    errorObject.otp = "le code OTP doit contenir 4 chiffres";
  }
  return errorObject;
};