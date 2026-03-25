import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRight, FaEye, FaMailBulk, FaPhoneAlt } from "react-icons/fa";
import "./Login.css"
const Login = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigator = useNavigate();
  const [userData, setUserData] = useState({
    email: location.state?.email || "",
    tel: location.state?.tel || "",  
    mdp: "",
    remember: false, 
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
        email: userData.email,
        tel: userData.tel,
        mdp: userData.mdp,
      };

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (response.ok) {
  toast.success(data.message || "Connexion réussie !");

  const telToSend = userData.tel; //  cette ligne manque dans ton code !

  setUserData({
    email: "",
    tel: "",
    mdp: "",
    remember: false,
  });

  setTimeout(() => navigator("/otp", { state: { tel: telToSend } }), 1500);
} else {

  toast.error(data.message || "Erreur lors de la connexion");
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
              <p className="side-sub">Connectez-vous maintenant</p>
              <div className="side-circles">
                <span className="circle c1"></span>
                <span className="circle c2"></span>
                <span className="circle c3"></span>
              </div>
            </div>
          </div>

          {/* Panneau droit formulaire */}
          <div className="register-form">
            <h1 className="form-title">Connectez-vous en un clic</h1>
            <p className="form-subtitle">Remplissez les informations ci-dessous</p>

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
                <label htmlFor="tel"><FaPhoneAlt /> Numéro de téléphone</label>
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
                <label htmlFor="mdp"><FaEye /> Mot de passe</label>
                {error.mdp && <span className="err-input">{error.mdp}</span>}
                <span className="input-bar"></span>
              </div>

              <div className="form-row form-row--checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={userData.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember">Se souvenir de moi</label>
                   <p className="login-link">
                 <Link to="/sendEmail">mot de passe oublier?</Link>
              </p>
              </div>
                 
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Connexion en cours...
                  </span>
                ) : (
                  <span>Se connecter <FaArrowRight /></span>
                )}
              </button>

              <p className="login-link">
                Pas encore de compte ? <Link to="/register">Créer un compte</Link>
              </p>

            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;