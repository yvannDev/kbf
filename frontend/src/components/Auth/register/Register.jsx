import React, { useState } from "react";
import "./Register.css";
import { FaArrowRight, FaEye, FaMailBulk, FaPhoneAlt, FaUserMd } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const Register = () => {
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    mdp: "",
    term: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigator = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        tel: userData.tel,
        mdp: userData.mdp,
        term: userData.term,
      };

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Compte créé avec succès !");
        setUserData({
          nom: "",
          prenom: "",
          email: "",
          tel: "",
          mdp: "",
          term: false,
        });
        setTimeout(() => navigator("/login"), 1500);
      } else {
        toast.error(data.message || "Erreur lors de l'inscription");
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
                Bienvenue
                <br />
                dans la
                <br />
                famille.
              </h2>
              <p className="side-sub">
                Créez votre compte et rejoignez des milliers de membres.
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
            <h1 className="form-title">Créer un compte</h1>
            <p className="form-subtitle">
              Remplissez les informations ci-dessous
            </p>

            <form className="form-group" onSubmit={handleSubmit}>
              <div className="form-inline">
                <div className="form-row">
                  <input
                    type="text"
                    name="nom"
                    id="nom"
                    className="ee"
                    placeholder=" "
                    value={userData.nom}
                    onChange={handleChange}
                  />
                  <label htmlFor="nom"><FaUserMd />Nom  </label>
                  {error.nom && <span className="err-input">{error.nom}</span>}
                  <span className="input-bar"></span>
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="prenom"
                    id="prenom"
                    className="ee"
                    placeholder=" "
                    value={userData.prenom}
                    onChange={handleChange}
                  />
                  <label htmlFor="prenom"><FaUserMd />Prénom </label>
                  {error.prenom && <span className="err-input">{error.prenom}</span>}
                  <span className="input-bar"></span>
                </div>
              </div>

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
                <label htmlFor="email"><FaMailBulk />Adresse email </label>
                {error.email && <span className="err-input">{error.email}</span>}
                <span className="input-bar"></span>
              </div>

              <div className="form-row">
                <input
                  type="tel"
                  name="tel"
                  id="tel"
                  className="ee"
                  placeholder=" "
                  value={userData.tel}
                  onChange={handleChange}
                />
                <label htmlFor="tel"> <FaPhoneAlt />Numéro de téléphone</label>
                {error.tel && <span className="err-input">{error.tel}</span>}
                <span className="input-bar"></span>
              </div>

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
                <label htmlFor="mdp"><FaEye />Mot de passe </label>
                {error.mdp && <span className="err-input">{error.mdp}</span>}
                <span className="input-bar"></span>
              </div>

              <div className="form-row form-row--checkbox">
                <input
                  type="checkbox"
                  name="term"
                  id="check"
                  checked={userData.term}
                  onChange={handleChange}
                />
                <label htmlFor="check">
                  J'accepte les <a href="#">termes et conditions</a> de kbf
                </label>
                {error.term && <span className="err-input">{error.term}</span>}
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Création du compte...
                  </span>
                ) : (
                  <span>Créer mon compte <FaArrowRight /></span>
                )}
              </button>

              <p className="login-link">
                Déjà un compte ? <Link to="/login">Se connecter</Link>
              </p>
            </form> 
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;