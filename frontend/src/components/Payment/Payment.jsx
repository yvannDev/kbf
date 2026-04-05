import React, { useState } from "react";
import "./Payment.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRight, FaPhoneAlt, FaCheckCircle } from "react-icons/fa";

// ══════════════════════════════════════════════════════════════
// DONNÉES SIMULÉES — TODO : remplacer par les vraies valeurs API
// ══════════════════════════════════════════════════════════════
const MONTANT = 4000;
const SERVICE_LABEL = "Activation de compte (Mise Initiale)";

// ── Pays avec indicatif + opérateurs + préfixes ───────────────
const PAYS_CONFIG = {
  "+228": {
    nom: "Togo",
    drapeau: "🇹🇬",
    prefixes: {
      tmoney: ["9"],
      moov: ["7"],
      wave: ["2"],
    },
  },
  "+225": {
    nom: "Côte d'Ivoire",
    drapeau: "🇨🇮",
    prefixes: {
      moov: ["0"],
      wave: ["5"],
      tmoney: [],
    },
  },
  "+229": {
    nom: "Bénin",
    drapeau: "🇧🇯",
    prefixes: {
      moov: ["9", "6"],
      wave: [],
      tmoney: [],
    },
  },
};

const OPERATEURS = {
  tmoney: {
    label: "Tmoney",
    couleur: "#f97316",
    bg: "#fff7ed",
    border: "#fb923c",
  },
  moov: {
    label: "Moov Money",
    couleur: "#10b981",
    bg: "#ecfdf5",
    border: "#34d399",
  },
  wave: { label: "Wave", couleur: "#3b82f6", bg: "#eff6ff", border: "#60a5fa" },
};

// ── Détection pays depuis le numéro saisi ─────────────────────
const detecterPays = (numero) => {
  const n = numero.replace(/\D/g, "");
  if (n.startsWith("228")) return "+228";
  if (n.startsWith("225")) return "+225";
  if (n.startsWith("229")) return "+229";
  return null;
};

// ── Détection opérateur depuis le numéro + indicatif ─────────
const detecterOperateur = (numero, indicatif) => {
  const n = numero.replace(/\D/g, "");
  const config = PAYS_CONFIG[indicatif];
  if (!config) return null;

  for (const [operateur, prefixes] of Object.entries(config.prefixes)) {
    if (prefixes.some((p) => n.startsWith(p))) return operateur;
  }
  return null;
};

const Payment = () => {
  const navigator = useNavigate();
  const [loading, setLoading] = useState(false);
  const [operateurSelectionne, setOperateur] = useState(null);
  const [operateurDetecte, setOperateurDetecte] = useState(null);
  const [tel, setTel] = useState("");
  const [indicatif, setIndicatif] = useState("+228");
  const [paysDetecte, setPaysDetecte] = useState(null);
  const [erreurTel, setErreurTel] = useState("");

  // ── Saisie numéro ─────────────────────────────────────────
  const handleTelChange = (e) => {
    const valeur = e.target.value;
    setTel(valeur);
    setErreurTel("");

    const paysTrouve = detecterPays(valeur);
    if (paysTrouve) {
      setIndicatif(paysTrouve);
      setPaysDetecte(paysTrouve);
    }

    const indicatifActuel = paysTrouve || indicatif;
    const operateurTrouve = detecterOperateur(valeur, indicatifActuel);
    setOperateurDetecte(operateurTrouve);
    if (operateurTrouve) setOperateur(operateurTrouve);
  };

  // ── Changement manuel de l'indicatif ─────────────────────
  const handleIndicatifChange = (e) => {
    setIndicatif(e.target.value);
    setPaysDetecte(null);
    setOperateurDetecte(null);
    setOperateur(null);
    // Relancer la détection opérateur avec le nouvel indicatif
    const op = detecterOperateur(tel, e.target.value);
    setOperateurDetecte(op);
    if (op) setOperateur(op);
  };

  // ── Soumettre le paiement ─────────────────────────────────
  // TODO : connecter à l'API POST /paiement/initier
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurTel("");

    if (!operateurSelectionne) {
      toast.error("Veuillez choisir un mode de paiement.");
      return;
    }
    if (!tel || tel.replace(/\D/g, "").length < 8) {
      setErreurTel("Veuillez entrer un numéro valide.");
      return;
    }

    setLoading(true);
    try {
      // TODO : remplacer par le vrai appel API
      // const response = await fetch("http://localhost:5000/api/paiement/initier", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ operateur: operateurSelectionne, indicatif, tel, montant: MONTANT }),
      // });
      // const data = await response.json();

      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Demande envoyée ! Validez sur votre téléphone.");
      setTimeout(() => navigator("/dashboard"), 2000);
    } catch (error) {
      console.error("Erreur paiement:", error);
      toast.error("Erreur lors du paiement. Réessayez.");
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
        theme="light"
      />

      <section className="container">
        <div className="register-wrapper">
          {/* ── Panneau gauche ── */}
          <div className="register-side">
            <div className="side-content">
              <span className="kbf-logo">kbf</span>
              <h2 className="side-title">
                Finalisez
                <br />
                votre
                <br />
                adhésion.
              </h2>
              <p className="side-sub">
                Paiement sécurisé via Mobile Money. Confirmation instantanée par
                email et SMS.
              </p>
              <div className="side-repartition">
                <p className="side-rep__titre">Répartition des fonds</p>
                <div className="side-rep__ligne">
                  <span className="side-rep__dot dot--orange"></span>
                  <span>
                    Parrain <strong>25%</strong>
                  </span>
                </div>
                <div className="side-rep__ligne">
                  <span className="side-rep__dot dot--blue"></span>
                  <span>
                    Capital <strong>25%</strong>
                  </span>
                </div>
                <div className="side-rep__ligne">
                  <span className="side-rep__dot dot--green"></span>
                  <span>  
                    Participatif <strong>50%</strong>
                  </span>
                </div>
              </div>
              <div className="side-circles">
                <span className="circle c1"></span>
                <span className="circle c2"></span>
                <span className="circle c3"></span>
              </div>
            </div>
          </div>

          {/* ── Panneau droit ── */}
          <div className="register-form">
            <div className="paiement-breadcrumb">
              <span>Compte</span>
              <span className="bc-sep"></span>
              <span className="bc-actif">Paiement</span>
              <span className="bc-sep"></span>
              <span>Confirmation</span>
            </div>

            <h1 className="form-title">Finaliser Votre Adhésion</h1>

            <div className="paiement-resume">
              <p>
                Service : <strong>{SERVICE_LABEL}</strong>
              </p>
              <p>
                Montant :{" "}
                <strong className="paiement-montant">
                  {MONTANT.toLocaleString("fr-FR")} FCFA
                </strong>{" "}
                <span className="paiement-frais">(Frais inclus)</span>
              </p>
            </div>

            <form className="form-group" onSubmit={handleSubmit}>
              {/* Étape 1 — Choix opérateur */}
              <p className="paiement-etape">
                1. Choisissez votre mode de paiement Mobile Money
              </p>
              <div className="paiement-operateurs">
                {Object.entries(OPERATEURS).map(([key, op]) => (
                  <button
                    key={key}
                    type="button"
                    className={`paiement-op-btn ${operateurSelectionne === key ? "paiement-op-btn--actif" : ""}`}
                    style={
                      operateurSelectionne === key
                        ? { borderColor: op.border, background: op.bg }
                        : {}
                    }
                    onClick={() => setOperateur(key)}
                  >
                    <span
                      className="paiement-op-label"
                      style={{ color: op.couleur }}
                    >
                      {op.label}
                    </span>
                    {operateurDetecte === key && (
                      <span className="paiement-op-detecte">✓ Détecté</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Étape 2 — Numéro */}
              <p className="paiement-etape">
                2. Entrez votre numéro de téléphone
              </p>
              <div className="form-row">
                <div className="paiement-tel-wrap">
                  {/* Sélecteur indicatif dynamique */}
                  <select
                    className="paiement-indicatif-select"
                    value={indicatif}
                    onChange={handleIndicatifChange}
                    title="Changer le pays"
                  >
                    {Object.entries(PAYS_CONFIG).map(([code, pays]) => (
                      <option key={code} value={code}>
                        {pays.drapeau} {code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    name="tel"
                    id="tel"
                    className="ee paiement-tel-input"
                    placeholder="XX XX XX XX"
                    value={tel}
                    onChange={handleTelChange}
                  />
                </div>

                {erreurTel && <span className="err-input">{erreurTel}</span>}

                {/* Message détection pays + opérateur */}
                {paysDetecte && (
                  <span className="paiement-detecte-msg">
                     Pays détecté :{" "}
                    <strong>
                      {PAYS_CONFIG[paysDetecte].drapeau}{" "}
                      {PAYS_CONFIG[paysDetecte].nom}
                    </strong>
                  </span>
                )}
                {operateurDetecte && (
                  <span className="paiement-detecte-msg">
                     Opérateur détecté :{" "}
                    <strong
                      style={{ color: OPERATEURS[operateurDetecte]?.couleur }}
                    >
                      {OPERATEURS[operateurDetecte]?.label}
                    </strong>
                  </span>
                )}

                <span className="paiement-hint">
                  L'indicatif et l'opérateur sont détectés automatiquement dès
                  la saisie
                </span>
                <span className="input-bar"></span>
              </div>

              <button
                type="submit"
                className="btn-submit paiement-btn-payer"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-btn">
                    <div className="spinner"></div>
                    Traitement en cours...
                  </span>
                ) : (
                  <span>
                    PAYER {MONTANT.toLocaleString("fr-FR")} FCFA{" "}
                    <FaArrowRight />
                  </span>
                )}
              </button>

              <p className="paiement-info-validation">
                Veuillez valider la transaction sur votre téléphone après avoir
                cliqué sur Payer
              </p>

              <div className="paiement-webhook">
                <FaCheckCircle className="paiement-webhook__icon" />
                <span>Confirmation en temps réel via Webhook</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Payment;
