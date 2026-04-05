import React, { useState } from "react";
import "./Gestion.css";
import { FaSync, FaFilePdf, FaClock } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";

//_____________________________________________________________
// DONNÉES SIMULÉES — TODO : remplacer par les vraies valeurs API
// ______________________________________________________________

// Solde principal simulé (en FCFA)
const SOLDE_FCFA = 95000; // 495 millions FCFA

// Taux de conversion simulés — TODO : remplacer par API taux de change
const TAUX_EUR  = 0.001524; // 1 FCFA = 0.001524 EUR
const TAUX_USD  = 0.001644; // 1 FCFA = 0.001644 USD
const TAUX_USDT = 0.001644; // 1 FCFA = 0.001644 USDT

// Historique des retraits simulé — TODO : remplacer par API /retraits
const historiqueSimule = [
  {
    id: 1,
    date: "25 Mars 2026",
    idTransaction: "TRX-1025",
    montant: 25000,
    delai: "24h",
    statut: "valide",
    pdf: true,
  },
  {
    id: 2,
    date: "23 Mars 2026",
    idTransaction: "TRX-1024",
    montant: 10000,
    delai: "48h",
    statut: "en_attente",
    pdf: false,
  },
  {
    id: 3,
    date: "21 Mars 2026",
    idTransaction: "TRX-1023",
    montant: 5500,
    delai: "N/A",
    statut: "rejete",
    pdf: false,
    raison: "Solde insuffisant",
  },
];

// ══════════════════════════════════════════════════════════════

const Gestion = () => {
  const [solde, setSolde]           = useState(SOLDE_FCFA);
  const [loadingActu, setLoadingActu] = useState(false);
  const [montant, setMontant]       = useState("");
  const [delaiRetrait, setDelaiRetrait] = useState("");
  const [erreurMontant, setErreurMontant] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Heure actuelle ────────────────────────────────────────
  const now = new Date();
  const heureActuelle = now.toLocaleString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ── Actualiser le solde (simulé) ──────────────────────────
  // TODO : remplacer par fetch("API/solde")
  const handleActualiser = () => {
    setLoadingActu(true);
    setTimeout(() => {
      setSolde(SOLDE_FCFA);
      setLoadingActu(false);
    }, 1000);
  };

  // ── Soumettre la demande de retrait ───────────────────────
  // TODO : remplacer par fetch("API/retrait", { method: "POST", body: ... })
  const handleRetrait = (e) => {
    e.preventDefault();
    setErreurMontant("");
    setSuccessMsg("");

    const valeur = parseInt(montant.replace(/\s/g, ""), 10);

    if (!montant || isNaN(valeur)) {
      setErreurMontant("Veuillez entrer un montant valide.");
      return;
    }
    if (valeur < 5000) {
      setErreurMontant("Le montant minimum est de 5 000 FCFA.");
      return;
    }
    if (valeur > solde) {
      setErreurMontant("Montant supérieur à votre solde disponible.");
      return;
    }

    // Simulation succès
    setSuccessMsg("Demande de retrait soumise avec succès !");
    setMontant("");
    setDelaiRetrait("");
  };

  // ── Télécharger PDF (simulé) ──────────────────────────────
  // TODO : remplacer par fetch("API/retrait/:id/pdf")
  const handlePdf = (idTransaction) => {
    alert(`Téléchargement PDF pour ${idTransaction} — connecter l'API`);
  };
   
  // ── Formatage montant ─────────────────────────────────────
  const formatFCFA = (val) => val.toLocaleString("fr-FR");

  const statutLabel = {
    valide:     { label: "Validé",     classe: "statut--valide" },
    en_attente: { label: "En attente", classe: "statut--attente" },
    rejete:     { label: "Rejeté",     classe: "statut--rejete" },
  };

  return (
    <div className="gf-page">

      {/* ── En-tête ── */}
      <div className="gf-header">
        <h1 className="gf-title">Gestion Financière</h1>
        <span className="gf-heure"><FaClock /> {heureActuelle}</span>
      </div>

      {/* ── Ligne du haut : Solde + Retrait ── */}
      <div className="gf-top">

        {/* Bloc solde */}
        <div className="gf-card gf-solde">
          <div className="gf-card__head">
            <span className="gf-card__titre">votre solde disponible</span>
            <span className="gf-bonnes"> Bonnes</span>
          </div>

          <div className="gf-solde__principal">
            <MdAccountBalanceWallet className="gf-wallet-icon" />
            <div>
              <span className="gf-solde__label">Solde Principal :</span>
              <span className="gf-solde__montant"> {formatFCFA(solde)} FCFA</span>
            </div>
            {/* TODO : connecter handleActualiser à l'API solde */}
            <button className="gf-btn-actualiser" onClick={handleActualiser} disabled={loadingActu}>
              <FaSync className={loadingActu ? "spin" : ""} />
              {loadingActu ? "..." : "Actualiser"}
            </button>
          </div>

          <div className="gf-equivalences">
            {/* TODO : remplacer TAUX_EUR/USD/USDT par les vrais taux depuis API */}
            <span className="gf-equiv"> EUR : <strong>€{(solde * TAUX_EUR).toFixed(2)}</strong></span>
            <span className="gf-equiv"> USDT : <strong>${(solde * TAUX_USDT).toFixed(2)}</strong></span>
            <span className="gf-equiv"> USD : <strong>${(solde * TAUX_USD).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Bloc retrait */}
        <div className="gf-card gf-retrait">
          <h3 className="gf-card__titre">Demande de Retrait</h3>

          <form onSubmit={handleRetrait} className="gf-retrait__form">
            <div className="gf-field">
              <label className="gf-label">Montant à Retirer (FCFA)</label>
              <input
                type="number"
                className="gf-input"
                placeholder="Minimum 5 000 FCFA"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
              {erreurMontant && <span className="gf-erreur">{erreurMontant}</span>}
            </div>

            <div className="gf-field">
              <label className="gf-label">Délai de Traitement (24-48h)</label>
              <input
                type="text"
                className="gf-input"
                placeholder="ex: 24h ou 48h"
                value={delaiRetrait}
                onChange={(e) => setDelaiRetrait(e.target.value)}
              />
            </div>

            {successMsg && <span className="gf-success">{successMsg}</span>}

            {/* TODO : connecter onSubmit à l'API POST /retrait */}
            <button type="submit" className="gf-btn-soumettre">
              Soumettre la demande
            </button>
          </form>
        </div>

      </div>

      {/* ── Historique des retraits ── */}
      <div className="gf-card gf-historique">
        <h3 className="gf-card__titre">Historique des Retraits</h3>
        {/* TODO : remplacer historiqueSimule par fetch("API/retraits") */}
        <table className="gf-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>ID Transaction</th>
              <th>Montant (FCFA)</th>
              <th>Délai</th>
              <th>Statut</th>
              <th>Reçu (PDF)</th>
            </tr>
          </thead>
          <tbody>
            {historiqueSimule.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td className="gf-id-trans">{row.idTransaction}</td>
                <td>{formatFCFA(row.montant)} FCFA</td>
                <td>{row.delai}</td>
                <td>
                  <span className={`gf-statut ${statutLabel[row.statut].classe}`}>
                    {statutLabel[row.statut].label}
                  </span>
                </td>
                <td>
                  {row.pdf ? (
                    <button className="gf-btn-pdf" onClick={() => handlePdf(row.idTransaction)}>
                      <FaFilePdf /> Télécharger
                    </button>
                  ) : row.statut === "rejete" ? (
                    <span className="gf-raison">{row.raison || "[Reason]"}</span>
                  ) : (
                    <span className="gf-dash">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Gestion