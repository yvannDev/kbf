import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRight, FaRedo } from "react-icons/fa";
import { UseAuth } from '../../context/AuthContext';
import "./Otp.css";

const Otp = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState({});
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [expired, setExpired] = useState(false);
  const navigator = useNavigate();
  const location = useLocation();
  const { login } = UseAuth();

  const telRef = useRef(location.state?.tel || "");
  const inputsRef = useRef([]);

  // ── Compte à rebours 2 minutes ──────────────────────────
  useEffect(() => {
    if (timer === 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, "0");
    const s = (timer % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Saisie automatique OTP (Web OTP API) ────────────────
  useEffect(() => {
    if ("OTPCredential" in window) {
      const controller = new AbortController();
      window.navigator.credentials
        .get({ otp: { transport: ["sms"] }, signal: controller.signal })
        .then((otp) => {
          if (otp?.code) {
            const code = otp.code.slice(0, 4).split("");
            setDigits(code);
          }
        })
        .catch(() => {});
      return () => controller.abort();
    }
  }, []);

  // ── Gestion saisie chiffre par chiffre ──────────────────
  const handleDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    if (index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
    if (error.otp) setError({});
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  // ── Coller le code depuis le presse-papier ───────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (paste.length === 4) {
      setDigits(paste.split(""));
      inputsRef.current[3]?.focus();
    }
  };

  // ── Soumettre le code OTP ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");

    if (code.length < 4) {
      setError({ otp: "Entrez les 4 chiffres du code" });
      return;
    }
    if (expired) {
      setError({ otp: "Le code a expiré. Demandez un nouveau code." });
      return;
    }

    setLoading(true);
    setError({});

    try {
      const response = await fetch("http://localhost:5000/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tel: telRef.current, otp: code }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        toast.success(data.message || "Connexion réussie !");
        setTimeout(() => navigator("/dashboard"), 1500);
      } else {
        toast.error(data.message || "Code incorrect");
        if (data.errorObject) setError(data.errorObject);
        setDigits(["", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      toast.error("Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // ── Renvoyer un nouveau code ─────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    setError({});
    setDigits(["", "", "", ""]);

    try {
      const response = await fetch("http://localhost:5000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tel: telRef.current }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Nouveau code envoyé !");
        setTimer(120);
        setExpired(false);
        inputsRef.current[0]?.focus();
      } else {
        toast.error(data.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      toast.error("Impossible de se connecter au serveur.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <section className="container">
        <div className="register-wrapper">

          {/* Panneau gauche décoratif */}
          <div className="register-side">
            <div className="side-content">
              <span className="kbf-logo">kbf</span>
              <h2 className="side-title">
                Vérifie
                <br />
                ton
                <br />
                numéro.
              </h2>
              <p className="side-sub">
                Un code à 4 chiffres a été envoyé par SMS au numéro{" "}
                <strong>{telRef.current || "enregistré"}</strong>.
              </p>
              <div className="side-circles">
                <span className="circle c1"></span>
                <span className="circle c2"></span>
                <span className="circle c3"></span>
              </div>
            </div>
          </div>

          {/* Panneau droit formulaire */}
          <div className="register-form">
            <h1 className="form-title">Entrez le code OTP</h1>
            <p className="form-subtitle">
              Code valable pendant{" "}
              <span className={expired ? "otp-timer expired" : "otp-timer"}>
                {expired ? "Expiré" : formatTimer()}
              </span>
            </p>

            <form className="form-group" onSubmit={handleSubmit}>

              <div className="otp-inputs">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-digit ${error.otp ? "otp-digit--error" : ""}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    disabled={expired}
                  />
                ))}
              </div>

              {error.otp && <span className="err-input">{error.otp}</span>}

              <button
                type="submit"
                className="btn-submit"
                disabled={loading || expired || digits.join("").length < 4}
              >
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Vérification...
                  </span>
                ) : (
                  <span>Vérifier <FaArrowRight /></span>
                )}
              </button>

              <p className="login-link">
                {expired || timer < 30 ? (
                  <button
                    type="button"
                    className="btn-resend"
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Envoi..." : <><FaRedo /> Renvoyer un nouveau code</>}
                  </button>
                ) : (
                  <>Code non reçu ? Patientez {formatTimer()}</>
                )}
              </p>

            </form>
          </div>

        </div>
      </section>
    </>
  );
};

export default Otp;