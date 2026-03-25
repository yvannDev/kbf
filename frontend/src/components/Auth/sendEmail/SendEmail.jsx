import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaMailBulk } from "react-icons/fa";
const SendEmail = () => {
 const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigator = useNavigate();
 
  const [userData, setUserData] = useState({
    email: "",
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
 
    if (error[name]) {
      setError((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});
 
    try {
      const backendData = {
        email: userData.email,
      };
 
      const response = await fetch("http://localhost:5000/api/auth/sendEmail", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });
   
      const data = await response.json();
 
      if (response.ok) {
        toast.success(data.message || "Email envoyé ! Vérifiez votre boîte mail.");
        setUserData({ email: "" });
        setTimeout(() => navigator("/login"), 3000);
      } else {
        toast.error(data.message || "Erreur lors de l'envoi");
        if (data.errorObject) {
          setError(data.errorObject);
        }
      }
 
    } catch (error) {
      console.error("Erreur réseau:", error);
      toast.error("Impossible de se connecter au serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
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
                Mot de
                <br />
                passe
                <br />
                oublié ?
              </h2>
              <p className="side-sub">
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
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
            <h1 className="form-title">Réinitialiser le mot de passe</h1>
            <p className="form-subtitle">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
 
            <form className="form-group" onSubmit={handleSubmit}>
 
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="ee"
                  placeholder=" "
                  value={userData.email}
                  onChange={handleChange}
                />
                <label htmlFor="email"><FaMailBulk /> Adresse email</label>
                {error.email && <span className="err-input">{error.email}</span>}
                <span className="input-bar"></span>
              </div>
 
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Envoi en cours...
                  </span>
                ) : (
                  <span>Envoyer le lien <FaArrowRight /></span>
                )}
              </button>
 
              <p className="login-link">
                 <Link to="/login">retour à la page de connexion</Link>
              </p>
            </form>
          </div>
 
        </div>
      </section>
    </>
  );
}

export default SendEmail