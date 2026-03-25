import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowRight, FaEye } from "react-icons/fa";

const  ConfirmMdp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigator = useNavigate();
  const { token } = useParams(); // token depuis l'url ex: /reset-password/:token

  const [userData, setUserData] = useState({
    mdp: "",
    confirmMdp: "",
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

    // Vérification côté frontend
    if (userData.mdp !== userData.confirmMdp) {
      setError({ confirmMdp: "Les mots de passe ne correspondent pas" });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mdp: userData.mdp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Mot de passe réinitialisé avec succès !");
        setUserData({ mdp: "", confirmMdp: "" });
        setTimeout(() => navigator("/login"), 2000);
      } else {
        toast.error(data.message || "Erreur lors de la réinitialisation");
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
                Nouveau
                <br />
                mot de
                <br />
                passe.
              </h2>
              <p className="side-sub">
                Choisissez un mot de passe fort pour sécuriser votre compte.
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
              Entrez votre nouveau mot de passe ci-dessous
            </p>

            <form className="form-group" onSubmit={handleSubmit}>

              <div className="form-row">
                <input
                  type="password"
                  name="mdp"
                  id="mdp"
                  className="ee"
                  placeholder=" "
                  value={userData.mdp}
                  onChange={handleChange}
                />
                <label htmlFor="mdp"><FaEye /> Nouveau mot de passe</label>
                {error.mdp && <span className="err-input">{error.mdp}</span>}
                <span className="input-bar"></span>
              </div>

              <div className="form-row">
                <input
                  type="password"
                  name="confirmMdp"
                  id="confirmMdp"
                  className="ee"
                  placeholder=" "
                  value={userData.confirmMdp}
                  onChange={handleChange}
                />
                <label htmlFor="confirmMdp"><FaEye /> Confirmer le mot de passe</label>
                {error.confirmMdp && <span className="err-input">{error.confirmMdp}</span>}
                <span className="input-bar"></span>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Réinitialisation en cours...
                  </span>
                ) : (
                  <span>Réinitialiser <FaArrowRight /></span>
                )}
              </button>

            </form>
          </div>

        </div>
      </section>
    </>
  );
};

export default ConfirmMdp;