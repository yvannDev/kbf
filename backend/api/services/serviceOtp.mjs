// services/serviceOtp.mjs
import pool from "../../config/db.mjs";
import generateOtp from "../utils/generateOtp.mjs";

// Crée et sauvegarde un OTP en base — expire dans 2 minutes
export const createOtp = async (tel) => {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // +2 minutes

  // Supprime les anciens OTP du même numéro
  await pool.query("DELETE FROM otp WHERE tel = $1", [tel.trim()]);

  // Insère le nouveau OTP
  await pool.query(
    "INSERT INTO  public.otp(tel, code, expires_at) VALUES($1, $2, $3)",
    [tel.trim(), code, expiresAt]
  );

  return code;
};

// Vérifie si le code OTP est valide
export const verifyOtp = async (tel, code) => {
  const result = await pool.query(
    "SELECT * FROM public.otp WHERE tel = $1 AND code = $2",
    [tel.trim(), code.trim()]
  );

  if (result.rows.length === 0) {
    return { valid: false, reason: "Code OTP incorrect" };
  }

  const otp = result.rows[0];
  const now = new Date();

  if (now > new Date(otp.expires_at)) {
    // Supprime l'OTP expiré
    await pool.query("DELETE FROM public.otp WHERE tel = $1", [tel.trim()]);
    return { valid: false, reason: "Code OTP expiré" };
  }

  // OTP valide — on le supprime après usage
  await pool.query("DELETE FROM public.otp WHERE tel = $1", [tel.trim()]);
  return { valid: true };
};