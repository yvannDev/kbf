import React, { useState, useRef } from "react";
import "./Dashboard.css";
import {
  FaHome, FaHistory, FaProjectDiagram, FaChartBar,
  FaBell, FaUser, FaEdit, FaTimes, FaCheck,
  FaChevronDown, FaCamera, FaSignOutAlt, FaLock,
  FaEnvelope, FaShieldAlt, FaEye, FaEyeSlash,
  FaStarHalfAlt,
  FaKey,
} from "react-icons/fa";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Link } from "react-router-dom";

// ══════════════════════════════════════════════════════════════
// DONNÉES SIMULÉES — TODO: remplacer par vraies valeurs API
// ══════════════════════════════════════════════════════════════
const USER_SIMULE = {
  nom: "Jean Dupont", email: "jean.dupont@kbf.com",
  tel: "+228 91 23 45 67", avatar: null, niveau: "Or",
  solde: 812500, gainsCumules: 3529500, progressNiveau: 72, nextLevel: "Platine",
};

const TRANSACTIONS_SIMULEES = [
  { id: 1, date: "27/02/2023", description: "Nouveau filleul Marie Martin", type: "Gains",    montant: 812500,  statut: "complete"   },
  { id: 2, date: "21/07/2023", description: "Paiement accommaite",          type: "Paiements", montant: 32500,   statut: "complete"   },
  { id: 3, date: "23/07/2023", description: "Paiement reçu ime",            type: "Gains",    montant: 32500,   statut: "en_attente" },
  { id: 4, date: "15/08/2023", description: "Bonus parrainage niveau 2",    type: "Gains",    montant: 130000,  statut: "complete"   },
  { id: 5, date: "02/09/2023", description: "Retrait compte bancaire",      type: "Retrait",  montant: -195000, statut: "complete"   },
  { id: 6, date: "10/09/2023", description: "Commission filleul actif",     type: "Gains",    montant: 48550,   statut: "en_attente" },
];

const NOTIFS_SIMULEES = [
  { id: 1, type: "filleul",  message: "Nouveau filleul inscrit : Marie Martin",      temps: "2 min",  lu: false },
  { id: 2, type: "paiement", message: "Paiement reçu : 32 500 FCFA",                temps: "15 min", lu: false },
  { id: 3, type: "paiement", message: "Paiement reçu : 32 500 FCFA",                temps: "1h",     lu: true  },
  { id: 4, type: "filleul",  message: "Nouveau filleul inscrit : Marie Martin",      temps: "3h",     lu: true  },
  { id: 5, type: "niveau",   message: "Félicitations ! Vous avez atteint le niveau Or", temps: "1j", lu: true  },
];

const ARBRE_SIMULE = {
  nom: "Jean Dupont", niveau: 1, actif: true,
  enfants: [
    { nom: "Marie", niveau: 2, actif: true,
      enfants: [
        { nom: "Marie Martin", niveau: 3, actif: true,  enfants: [] },
        { nom: "Marie Martin", niveau: 3, actif: false, enfants: [] },
      ]},
    { nom: "Marie", niveau: 2, actif: true,
      enfants: [
        { nom: "Marie Martin", niveau: 3, actif: true, enfants: [] },
        { nom: "Marie Martin", niveau: 3, actif: true, enfants: [] },
      ]},
  ],
};

const GRAPHIQUE_DATA = {
  "7j":  [
    { label: "Lun", gains: 78000  }, { label: "Mar", gains: 130000 },
    { label: "Mer", gains: 117000 }, { label: "Jeu", gains: 227500 },
    { label: "Ven", gains: 182000 }, { label: "Sam", gains: 260000 },
    { label: "Dim", gains: 208000 },
  ],
  "30j": Array.from({ length: 30 }, (_, i) => ({ label: `J${i+1}`, gains: Math.floor(50000 + Math.random() * 260000) })),
  "90j": Array.from({ length: 12 }, (_, i) => ({ label: `S${i+1}`, gains: Math.floor(130000 + Math.random() * 520000) })),
  "tout": [
    { label: "Jan", gains: 195000 }, { label: "Fév", gains: 325000 },
    { label: "Mar", gains: 260000 }, { label: "Avr", gains: 455000 },
    { label: "Mai", gains: 390000 }, { label: "Juin", gains: 585000 },
    { label: "Juil", gains: 520000 },{ label: "Août", gains: 715000 },
    { label: "Sept", gains: 617500 },{ label: "Oct",  gains: 832000 },
    { label: "Nov",  gains: 715000 },{ label: "Déc",  gains: 910000 },
  ],
};

const fcfa = (val) => `${Math.abs(val).toLocaleString("fr-FR")} FCFA`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="db-tooltip">
        <p className="db-tooltip__label">{label}</p>
        <p className="db-tooltip__val">{fcfa(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const NoeudArbre = ({ noeud, onClick }) => (
  <div className="arbre-noeud">
    <div className={`arbre-avatar ${noeud.actif ? "arbre-avatar--actif" : "arbre-avatar--inactif"}`}
      onClick={() => onClick(noeud)} title={noeud.nom}>
      <FaUser />
    </div>
    <span className="arbre-nom">{noeud.nom}</span>
    {noeud.enfants?.length > 0 && (
      <div className="arbre-enfants">
        {noeud.enfants.map((e, i) => <NoeudArbre key={i} noeud={e} onClick={onClick} />)}
      </div>
    )}
  </div>
);

function Dashboard() {
  const [onglet, setOnglet]             = useState("vue");
  const [periodeGraph, setPeriodeGraph] = useState("30j");
  const [notifs, setNotifs]             = useState(NOTIFS_SIMULEES);
  const [user, setUser]                 = useState(USER_SIMULE);
  const [filtreType, setFiltreType]     = useState("Tous");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDate, setFiltreDate]     = useState("");
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingCoord, setLoadingCoord]   = useState(false);

  // ── Popups ─────────────────────────────────────────────
  const [popupProfil, setPopupProfil]   = useState(false);
  const [popupNotifs, setPopupNotifs]   = useState(false);
  const [popupArbre, setPopupArbre]     = useState(null);
  const [popupCoord, setPopupCoord]     = useState(false);
  const [popupPref, setPopupPref]       = useState(false);
  const [popupAdmin, setPopupAdmin]     = useState(false); // ✅ NOUVEAU popup admin

  // ── Formulaire Admin ────────────────────────────────────
  const [formAdmin, setFormAdmin]           = useState({ email: "", motdepasse: "" });
  const [erreursAdmin, setErreursAdmin]     = useState({});
  const [loadingAdmin, setLoadingAdmin]     = useState(false);
  const [showMotdepasse, setShowMotdepasse] = useState(false);
  const [adminErreurGen, setAdminErreurGen] = useState("");

  // ── Formulaire profil ───────────────────────────────────
  const [formProfil, setFormProfil] = useState({
    nom: user.nom, email: user.email, tel: user.tel,
    adresse: "", ville: "Lomé", pays: "Togo",
  });
  const [erreursProfil, setErreursProfil] = useState({});

  // ── Coordonnées bancaires ───────────────────────────────
  const [coordBancaires, setCoordBancaires] = useState({
    banque: "BTCI", typeCpt: "courant",
    rib: "TG123456789", iban: "TG01 0001 0001 0001 0001",
    titulaire: "Jean Dupont", mobile: "+228 91 23 45 67",
  });
  const [erreursCoord, setErreursCoord] = useState({});

  // ── Préférences ─────────────────────────────────────────
  const [preferences, setPreferences] = useState({ notifEmail: true, notifSms: true, langue: "fr" });

  const avatarRef = useRef();
  const nbNotifNonLues = notifs.filter(n => !n.lu).length;
  const marquerToutesLues = () => setNotifs(notifs.map(n => ({ ...n, lu: true })));

  const transactionsFiltrees = TRANSACTIONS_SIMULEES.filter(t => {
    const okType   = filtreType   === "Tous" || t.type   === filtreType;
    const okStatut = filtreStatut === "Tous" || t.statut === filtreStatut;
    const okDate   = !filtreDate  || t.date.includes(filtreDate);
    return okType && okStatut && okDate;
  });

  const totalFilleuls   = ARBRE_SIMULE.enfants.reduce((a, e) => a + 1 + e.enfants.length, 0);
  const filleulesActifs = ARBRE_SIMULE.enfants.reduce((a, e) => a + (e.actif ? 1 : 0) + e.enfants.filter(x => x.actif).length, 0);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUser(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
  };

  // ── Validation + soumission profil ─────────────────────
  const validerProfil = () => {
    const err = {};
    if (!formProfil.nom.trim())   err.nom   = "Le nom est requis";
    if (!formProfil.email.trim()) err.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formProfil.email)) err.email = "Email invalide";
    if (!formProfil.tel.trim())   err.tel   = "Le téléphone est requis";
    return err;
  };
  const sauvegarderProfil = async (e) => {
    e.preventDefault();
    const err = validerProfil();
    if (Object.keys(err).length > 0) { setErreursProfil(err); return; }
    setLoadingProfil(true);
    await new Promise(r => setTimeout(r, 800));
    setUser(prev => ({ ...prev, nom: formProfil.nom, email: formProfil.email, tel: formProfil.tel }));
    setLoadingProfil(false);
    setPopupProfil(false);
    setErreursProfil({});
  };

  // ── Validation + soumission coordonnées bancaires ───────
  const validerCoord = () => {
    const err = {};
    if (!coordBancaires.banque.trim())    err.banque    = "La banque est requise";
    if (!coordBancaires.rib.trim())       err.rib       = "Le RIB est requis";
    if (!coordBancaires.titulaire.trim()) err.titulaire = "Le titulaire est requis";
    return err;
  };
  const sauvegarderCoord = async (e) => {
    e.preventDefault();
    const err = validerCoord();
    if (Object.keys(err).length > 0) { setErreursCoord(err); return; }
    setLoadingCoord(true);
    await new Promise(r => setTimeout(r, 800));
    setLoadingCoord(false);
    setPopupCoord(false);
    setErreursCoord({});
  };

  // ── Validation formulaire admin ─────────────────────────
  const validerAdmin = () => {
    const err = {};
    if (!formAdmin.email.trim())
      err.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formAdmin.email))
      err.email = "Email invalide";
    if (!formAdmin.motdepasse.trim())
      err.motdepasse = "Le mot de passe est requis";
    else if (formAdmin.motdepasse.length < 6)
      err.motdepasse = "Minimum 6 caractères";
    return err;
  };

  // ── Soumettre connexion admin ───────────────────────────
  // TODO: connecter à POST /api/admin/login
  const soumettreAdmin = async (e) => {
    e.preventDefault();
    setAdminErreurGen("");
    const err = validerAdmin();
    if (Object.keys(err).length > 0) { setErreursAdmin(err); return; }
    setLoadingAdmin(true);
    try {
      // TODO: remplacer par le vrai appel API
      // const response = await fetch("http://localhost:5000/api/admin/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formAdmin.email, motdepasse: formAdmin.motdepasse }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || "Identifiants incorrects");
      // localStorage.setItem("adminToken", data.token);
      // window.location.href = "/admin";

      // Simulation
      await new Promise(r => setTimeout(r, 1000));
      alert("Connexion admin simulée — branchez l'API !");
      setPopupAdmin(false);
      setFormAdmin({ email: "", motdepasse: "" });
    } catch (error) {
      setAdminErreurGen(error.message || "Identifiants incorrects");
    } finally {
      setLoadingAdmin(false);
    }
  };

  const navItems = [
    { id: "vue",           label: "Vue d'ensemble",     icon: <FaHome /> },
    { id: "historique",    label: "Historique",          icon: <FaHistory /> },
    { id: "arbre",         label: "Arbre de parrainage", icon: <FaProjectDiagram /> },
    { id: "graphiques",    label: "Graphiques",          icon: <FaChartBar /> },
    { id: "notifications", label: "Notifications",       icon: <FaBell /> },
    { id: "profil",        label: "Profil",              icon: <FaUser /> },
  ];

  return (
    <div className="db-layout">

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar__brand">Dashboard Personnel</div>
        <div className="db-sidebar__user">
          <div className="db-sidebar__avatar" onClick={() => setPopupProfil(true)}>
            {user.avatar ? <img src={user.avatar} alt="avatar" /> : <FaUser className="db-sidebar__avatar-icon" />}
          </div>
          <span className="db-sidebar__nom">{user.nom}</span>
        </div>
        <nav className="db-sidebar__nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`db-nav-item ${onglet === item.id ? "db-nav-item--actif" : ""}`}
              onClick={() => setOnglet(item.id)}>
              {item.icon}
              <span>{item.label}</span>
              {item.id === "notifications" && nbNotifNonLues > 0 && (
                <span className="db-badge">{nbNotifNonLues}</span>
              )}
            </button>
          ))}

          {/* ✅ Bouton Espace Admin */}
          <button className="db-nav-item db-nav-item--admin" onClick={() => setPopupAdmin(true)}>
            <FaShieldAlt />
            <span>Espace Admin</span>
          </button>
        </nav>
        <Link to="/register" className="db-nav-item db-deconnexion">
          <FaSignOutAlt /><span>Déconnexion</span>
        </Link>
      </aside>

      {/* ── Contenu principal ── */}
      <main className="db-main">

        {/* ════ VUE D'ENSEMBLE ════ */}
        {onglet === "vue" && (
          <div className="db-section">
            <div className="db-section__header">
              <h2 className="db-section__titre">Vue d'ensemble</h2>
              <button className="db-btn-notif" onClick={() => setPopupNotifs(true)}>
                <FaBell />
                {nbNotifNonLues > 0 && <span className="db-badge db-badge--btn">{nbNotifNonLues}</span>}
              </button>
            </div>
            <div className="db-cards">
              <div className="db-card db-card--bleu">
                <span className="db-card__label">SOLDE DISPONIBLE</span>
                <span className="db-card__valeur">{fcfa(user.solde)}</span>
              </div>
              <div className="db-card db-card--vert">
                <span className="db-card__label">GAINS CUMULÉS</span>
                <span className="db-card__valeur">{fcfa(user.gainsCumules)}</span>
              </div>
              <div className="db-card db-card--or"  >
                <div className="db-card__head">
                  <span className="db-card__label">NIVEAU ACTUEL</span>
                  <span className="db-niveau-badge"></span>
                </div>
                <span className="db-card__valeur">{user.niveau}</span>
                <div className="db-progress-bar">
                  <div className="db-progress-bar__fill" style={{ width: `${user.progressNiveau}%` }}></div>
                </div>
                <span className="db-progress-label">Prochain niveau : {user.nextLevel} · {fcfa(user.gainsCumules)}</span>
              </div>
            </div>
            <div className="db-block">
              <h3 className="db-block__titre">Transactions récentes</h3>
              <table className="db-table">
                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead>
                <tbody>
                  {TRANSACTIONS_SIMULEES.slice(0, 4).map(t => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td><span className={`db-tag db-tag--${t.type.toLowerCase()}`}>{t.type}</span></td>
                      <td className={t.montant < 0 ? "db-montant--negatif" : "db-montant--positif"}>
                        {t.montant > 0 ? "+" : "-"}{fcfa(t.montant)}
                      </td>
                      <td><span className={`db-statut ${t.statut === "complete" ? "db-statut--ok" : "db-statut--attente"}`}>
                        {t.statut === "complete" ? "Complété" : "En attente"}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="db-block">
              <div className="db-block__head">
                <h3 className="db-block__titre">Notifications en temps réel</h3>
                <span className="db-badge db-badge--rouge">{nbNotifNonLues}</span>
              </div>
              <div className="db-notifs-liste">
                {notifs.slice(0, 4).map(n => (
                  <div key={n.id} className={`db-notif-item ${!n.lu ? "db-notif-item--nonlu" : ""}`}>
                    <span className={`db-notif-dot ${n.type === "filleul" ? "dot-bleu" : n.type === "paiement" ? "dot-vert" : "dot-or"}`}></span>
                    <span className="db-notif-msg">{n.message}</span>
                    <span className="db-notif-temps">{n.temps}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
        {/* ════ HISTORIQUE ════ */}
        {onglet === "historique" && (
          <div className="db-section">
            <h2 className="db-section__titre">Historique des transactions</h2>
            <div className="db-filtres">
              <div className="db-filtre-group">
                <label>Date</label>
                <input type="text" className="db-input" placeholder="JJ/MM/AAAA" value={filtreDate} onChange={e => setFiltreDate(e.target.value)} />
              </div>
              <div className="db-filtre-group">
                <label>Type</label>
                <select className="db-select" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
                  <option>Tous</option><option>Gains</option><option>Paiements</option><option>Retrait</option>
                </select>
              </div>
              <div className="db-filtre-group">
                <label>Statut</label>
                <select className="db-select" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                  <option>Tous</option><option value="complete">Complété</option><option value="en_attente">En attente</option>
                </select>
              </div>
            </div>
            <div className="db-block">
              <table className="db-table">
                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead>
                <tbody>
                  {transactionsFiltrees.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: "center", color: "#aaa" }}>Aucune transaction trouvée</td></tr>
                    : transactionsFiltrees.map(t => (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td>{t.description}</td>
                        <td><span className={`db-tag db-tag--${t.type.toLowerCase()}`}>{t.type}</span></td>
                        <td className={t.montant < 0 ? "db-montant--negatif" : "db-montant--positif"}>
                          {t.montant > 0 ? "+" : "-"}{fcfa(t.montant)}
                        </td>
                        <td><span className={`db-statut ${t.statut === "complete" ? "db-statut--ok" : "db-statut--attente"}`}>
                          {t.statut === "complete" ? "Complété" : "En attente"}
                        </span></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ ARBRE ════ */}
        {onglet === "arbre" && (
          <div className="db-section">
            <h2 className="db-section__titre">Arbre de parrainage visuel</h2>
            <div className="db-arbre-layout">
              <div className="db-block db-arbre-container">
                <NoeudArbre noeud={ARBRE_SIMULE} onClick={setPopupArbre} />
              </div>
              <div className="db-arbre-stats">
                <div className="db-arbre-stat">
                  <span className="db-arbre-stat__val">{totalFilleuls}</span>
                  <span className="db-arbre-stat__label">Total Filleuls</span>
                </div>
                <div className="db-arbre-stat">
                  <span className="db-arbre-stat__val">{filleulesActifs}</span>
                  <span className="db-arbre-stat__label">Filleuls Actifs</span>
                </div>
                <div className="db-arbre-stat">
                  <span className="db-arbre-stat__val">{fcfa(user.gainsCumules)}</span>
                  <span className="db-arbre-stat__label">Gains de Parrainage</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ GRAPHIQUES ════ */}
        {onglet === "graphiques" && (
          <div className="db-section">
            <h2 className="db-section__titre">Graphiques d'évolution des gains</h2>
            <div className="db-block">
              <div className="db-graph-periodes">
                {["7j", "30j", "90j", "tout"].map(p => (
                  <button key={p} className={`db-periode-btn ${periodeGraph === p ? "db-periode-btn--actif" : ""}`} onClick={() => setPeriodeGraph(p)}>{p}</button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={GRAPHIQUE_DATA[periodeGraph]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a56db" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1a56db" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="gains" stroke="#1a56db" strokeWidth={2.5} fill="url(#gradDB)" dot={false}
                    activeDot={{ r: 5, fill: "#1a56db", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ════ NOTIFICATIONS ════ */}
        {onglet === "notifications" && (
          <div className="db-section">
            <div className="db-section__header">
              <h2 className="db-section__titre">Notifications en temps réel</h2>
              <button className="db-btn-secondaire" onClick={marquerToutesLues}>
                <FaCheck /> Tout marquer comme lu
              </button>
            </div>
            <div className="db-block">
              {notifs.map(n => (
                <div key={n.id} className={`db-notif-item db-notif-item--full ${!n.lu ? "db-notif-item--nonlu" : ""}`}>
                  <span className={`db-notif-dot ${n.type === "filleul" ? "dot-bleu" : n.type === "paiement" ? "dot-vert" : "dot-or"}`}></span>
                  <div className="db-notif-content">
                    <span className="db-notif-msg">{n.message}</span>
                    <span className="db-notif-temps">{n.temps}</span>
                  </div>
                  {!n.lu && <span className="db-notif-nonlu-badge">Nouveau</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PROFIL ════ */}
        {onglet === "profil" && (
          <div className="db-section">
            <h2 className="db-section__titre">Profil</h2>
            <div className="db-block db-profil-block">
              <div className="db-profil-avatar-zone">
                <div className="db-profil-avatar">
                  {user.avatar ? <img src={user.avatar} alt="avatar" /> : <FaUser className="db-profil-avatar-icon" />}
                  <button className="db-profil-avatar-edit" onClick={() => avatarRef.current.click()}><FaCamera /></button>
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
                </div>
                <div>
                  <p className="db-profil-nom">{user.nom}</p>
                  <p className="db-profil-email">{user.email}</p>
                  <span className="db-niveau-pill"><FaStarHalfAlt/> Niveau {user.niveau}</span>
                </div>
                <button className="db-btn-modifier" onClick={() => setPopupProfil(true)}>
                  <FaEdit /> Modifier
                </button>
              </div>
              <div className="db-profil-section">
                <button className="db-accordion-btn" onClick={() => setPopupCoord(true)}>
                  <span>Coordonnées bancaires</span><FaChevronDown />
                </button>
              </div>
              <div className="db-profil-section">
                <button className="db-accordion-btn" onClick={() => setPopupPref(true)}>
                  <span>Préférences</span><FaChevronDown />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* _______________________________________
          POPUPS
      _______________________________________ */}

      {/*  NOUVEAU — Popup Connexion Admin */}
      {popupAdmin && (
        <div className="db-overlay" onClick={() => { setPopupAdmin(false); setErreursAdmin({}); setAdminErreurGen(""); }}>
          <div className="db-popup db-popup--admin" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <div className="db-admin-popup-head">
                <div className="db-admin-popup-icon"><FaShieldAlt /></div>
                <div>
                  <h3>Espace Administrateur</h3>
                  <p className="db-admin-popup-sub">Accès restreint — identifiants requis</p>
                </div>
              </div>
              <button className="db-popup__close" onClick={() => { setPopupAdmin(false); setErreursAdmin({}); setAdminErreurGen(""); }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={soumettreAdmin}>
              <div className="db-popup__body">

                {/* Message d'erreur général */}
                {adminErreurGen && (
                  <div className="db-admin-erreur-gen">
                    <FaLock /> {adminErreurGen}
                  </div>
                )}

                {/* Email */}
                <div className="db-form-field">
                  <label>Adresse email *</label>
                  <div className="db-admin-input-wrap">
                    <FaEnvelope className="db-admin-input-icon" />
                    <input
                      type="email"
                      className={`db-input db-input--icon ${erreursAdmin.email ? "db-input--err" : ""}`}
                      placeholder="admin@kbf.com"
                      value={formAdmin.email}
                      onChange={e => {
                        setFormAdmin(p => ({ ...p, email: e.target.value }));
                        setErreursAdmin(p => ({ ...p, email: "" }));
                        setAdminErreurGen("");
                      }}
                      autoComplete="email"
                    />
                  </div>
                  {erreursAdmin.email && <span className="db-err-msg">{erreursAdmin.email}</span>}
                </div>

                {/* Mot de passe */}
                <div className="db-form-field">
                  <label>Mot de passe *</label>
                  <div className="db-admin-input-wrap">
                    <FaLock className="db-admin-input-icon" />
                    <input
                      type={showMotdepasse ? "text" : "password"}
                      className={`db-input db-input--icon db-input--icon-right ${erreursAdmin.motdepasse ? "db-input--err" : ""}`}
                      placeholder="••••••••"
                      value={formAdmin.motdepasse}
                      onChange={e => {
                        setFormAdmin(p => ({ ...p, motdepasse: e.target.value }));
                        setErreursAdmin(p => ({ ...p, motdepasse: "" }));
                        setAdminErreurGen("");
                      }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="db-admin-eye-btn"
                      onClick={() => setShowMotdepasse(s => !s)}
                      tabIndex={-1}
                    >
                      {showMotdepasse ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {erreursAdmin.motdepasse && <span className="db-err-msg">{erreursAdmin.motdepasse}</span>}
                </div>

                <p className="db-admin-note">
                  <FaLock/> Cette connexion est sécurisée. Toutes les tentatives sont enregistrées.
                </p>
              </div>

              <div className="db-popup__footer">
                <button type="button" className="db-btn-secondaire"
                  onClick={() => { setPopupAdmin(false); setErreursAdmin({}); setAdminErreurGen(""); }}>
                  Annuler
                </button>
                {/* TODO: onSubmit  POST /api/admin/login */}
                <button type="submit" className="db-btn-principal db-btn-admin" disabled={loadingAdmin}>
                  {loadingAdmin
                    ? <><div className="db-spinner"></div> Connexion...</>
                    : <><FaShieldAlt /> Accéder à l'admin</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Popup Modifier Profil ── */}
      {popupProfil && (
        <div className="db-overlay" onClick={() => setPopupProfil(false)}>
          <div className="db-popup" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <h3>Modifier le profil</h3>
              <button className="db-popup__close" onClick={() => setPopupProfil(false)}><FaTimes /></button>
            </div>
            <form onSubmit={sauvegarderProfil}>
              <div className="db-popup__body">
                <div className="db-popup-avatar-zone">
                  <div className="db-profil-avatar db-profil-avatar--sm">
                    {user.avatar ? <img src={user.avatar} alt="avatar" /> : <FaUser />}
                    <button type="button" className="db-profil-avatar-edit" onClick={() => avatarRef.current.click()}><FaCamera /></button>
                  </div>
                  <span className="db-popup-avatar-hint">Photo de profil</span>
                </div>
                <div className="db-form-row">
                  <div className="db-form-field">
                    <label>Nom complet *</label>
                    <input className={`db-input ${erreursProfil.nom ? "db-input--err" : ""}`}
                      value={formProfil.nom} placeholder="Jean Dupont"
                      onChange={e => setFormProfil(p => ({ ...p, nom: e.target.value }))} />
                    {erreursProfil.nom && <span className="db-err-msg">{erreursProfil.nom}</span>}
                  </div>
                </div>
                <div className="db-form-row">
                  <div className="db-form-field">
                    <label>Adresse email *</label>
                    <input type="email" className={`db-input ${erreursProfil.email ? "db-input--err" : ""}`}
                      value={formProfil.email} placeholder="jean@kbf.com"
                      onChange={e => setFormProfil(p => ({ ...p, email: e.target.value }))} />
                    {erreursProfil.email && <span className="db-err-msg">{erreursProfil.email}</span>}
                  </div>
                </div>
                <div className="db-form-row">
                  <div className="db-form-field">
                    <label>Téléphone *</label>
                    <input type="tel" className={`db-input ${erreursProfil.tel ? "db-input--err" : ""}`}
                      value={formProfil.tel} placeholder="+228 XX XX XX XX"
                      onChange={e => setFormProfil(p => ({ ...p, tel: e.target.value }))} />
                    {erreursProfil.tel && <span className="db-err-msg">{erreursProfil.tel}</span>}
                  </div>
                </div>
              </div>
              <div className="db-popup__footer">
                <button type="button" className="db-btn-secondaire" onClick={() => setPopupProfil(false)}>Annuler</button>
                <button type="submit" className="db-btn-principal" disabled={loadingProfil}>
                  {loadingProfil ? <><div className="db-spinner"></div> Sauvegarde...</> : <><FaCheck /> Sauvegarder</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Popup Notifications ── */}
      {popupNotifs && (
        <div className="db-overlay" onClick={() => setPopupNotifs(false)}>
          <div className="db-popup db-popup--notifs" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <h3>Notifications <span className="db-badge db-badge--rouge">{nbNotifNonLues}</span></h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="db-btn-secondaire db-btn-sm" onClick={marquerToutesLues}><FaCheck /> Tout lire</button>
                <button className="db-popup__close" onClick={() => setPopupNotifs(false)}><FaTimes /></button>
              </div>
            </div>
            <div className="db-popup__body">
              {notifs.map(n => (
                <div key={n.id} className={`db-notif-item db-notif-item--full ${!n.lu ? "db-notif-item--nonlu" : ""}`}>
                  <span className={`db-notif-dot ${n.type === "filleul" ? "dot-bleu" : n.type === "paiement" ? "dot-vert" : "dot-or"}`}></span>
                  <div className="db-notif-content">
                    <span className="db-notif-msg">{n.message}</span>
                    <span className="db-notif-temps">{n.temps}</span>
                  </div>
                  {!n.lu && <span className="db-notif-nonlu-badge">Nouveau</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Nœud Arbre ── */}
      {popupArbre && (
        <div className="db-overlay" onClick={() => setPopupArbre(null)}>
          <div className="db-popup db-popup--sm" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <h3>Filleul : {popupArbre.nom}</h3>
              <button className="db-popup__close" onClick={() => setPopupArbre(null)}><FaTimes /></button>
            </div>
            <div className="db-popup__body">
              <p><strong>Niveau dans l'arbre :</strong> {popupArbre.niveau}</p>
              <p><strong>Statut :</strong> <span className={`db-statut ${popupArbre.actif ? "db-statut--ok" : "db-statut--attente"}`}>{popupArbre.actif ? "Actif" : "Inactif"}</span></p>
              <p><strong>Filleuls directs :</strong> {popupArbre.enfants?.length || 0}</p>
            </div>
            <div className="db-popup__footer">
              <button className="db-btn-principal" onClick={() => setPopupArbre(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Coordonnées bancaires ── */}
      {popupCoord && (
        <div className="db-overlay" onClick={() => setPopupCoord(false)}>
          <div className="db-popup" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <h3>Coordonnées bancaires</h3>
              <button className="db-popup__close" onClick={() => setPopupCoord(false)}><FaTimes /></button>
            </div>
            <form onSubmit={sauvegarderCoord}>
              <div className="db-popup__body">
                <div className="db-form-field">
                  <label>Titulaire du compte *</label>
                  <input className={`db-input ${erreursCoord.titulaire ? "db-input--err" : ""}`}
                    value={coordBancaires.titulaire} placeholder="Nom complet du titulaire"
                    onChange={e => setCoordBancaires(p => ({ ...p, titulaire: e.target.value }))} />
                  {erreursCoord.titulaire && <span className="db-err-msg">{erreursCoord.titulaire}</span>}
                </div>
                <div className="db-form-row db-form-row--2col">
                  <div className="db-form-field">
                    <label>Banque *</label>
                    <select className={`db-select ${erreursCoord.banque ? "db-input--err" : ""}`}
                      value={coordBancaires.banque}
                      onChange={e => setCoordBancaires(p => ({ ...p, banque: e.target.value }))}>
                      <option>BTCI</option><option>Ecobank</option><option>UTB</option>
                      <option>BIA Togo</option><option>Orabank</option><option>Autre</option>
                    </select>
                    {erreursCoord.banque && <span className="db-err-msg">{erreursCoord.banque}</span>}
                  </div>
                  <div className="db-form-field">
                    <label>Type de compte</label>
                    <select className="db-select" value={coordBancaires.typeCpt}
                      onChange={e => setCoordBancaires(p => ({ ...p, typeCpt: e.target.value }))}>
                      <option value="courant">Courant</option>
                      <option value="epargne">Épargne</option>
                      <option value="mobile">Mobile Money</option>
                    </select>
                  </div>
                </div>
                <div className="db-form-field">
                  <label>RIB *</label>
                  <input className={`db-input ${erreursCoord.rib ? "db-input--err" : ""}`}
                    value={coordBancaires.rib} placeholder="TG XXXX XXXX XXXX"
                    onChange={e => setCoordBancaires(p => ({ ...p, rib: e.target.value }))} />
                  {erreursCoord.rib && <span className="db-err-msg">{erreursCoord.rib}</span>}
                </div>
                <div className="db-form-field">
                  <label>IBAN</label>
                  <input className="db-input" value={coordBancaires.iban} placeholder="TG01 0001 0001 0001 0001"
                    onChange={e => setCoordBancaires(p => ({ ...p, iban: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label>Numéro Mobile Money</label>
                  <input type="tel" className="db-input" value={coordBancaires.mobile} placeholder="+228 XX XX XX XX"
                    onChange={e => setCoordBancaires(p => ({ ...p, mobile: e.target.value }))} />
                </div>
                <p className="db-form-note">⚠️ Ces informations seront utilisées pour les virements. Vérifiez l'exactitude des données.</p>
              </div>
              <div className="db-popup__footer">
                <button type="button" className="db-btn-secondaire" onClick={() => setPopupCoord(false)}>Annuler</button>
                <button type="submit" className="db-btn-principal" disabled={loadingCoord}>
                  {loadingCoord ? <><div className="db-spinner"></div> Sauvegarde...</> : <><FaCheck /> Sauvegarder</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Popup Préférences ── */}
      {popupPref && (
        <div className="db-overlay" onClick={() => setPopupPref(false)}>
          <div className="db-popup" onClick={e => e.stopPropagation()}>
            <div className="db-popup__head">
              <h3>Préférences</h3>
              <button className="db-popup__close" onClick={() => setPopupPref(false)}><FaTimes /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setPopupPref(false); }}>
              <div className="db-popup__body">
                <div className="db-pref-ligne">
                  <span>Notifications par email</span>
                  <label className="db-toggle">
                    <input type="checkbox" checked={preferences.notifEmail}
                      onChange={e => setPreferences(p => ({ ...p, notifEmail: e.target.checked }))} />
                    <span className="db-toggle__slider"></span>
                  </label>
                </div>
                <div className="db-pref-ligne">
                  <span>Notifications par SMS</span>
                  <label className="db-toggle">
                    <input type="checkbox" checked={preferences.notifSms}
                      onChange={e => setPreferences(p => ({ ...p, notifSms: e.target.checked }))} />
                    <span className="db-toggle__slider"></span>
                  </label>
                </div>
                <div className="db-form-field" style={{ marginTop: 16 }}>
                  <label>Langue</label>
                  <select className="db-select" value={preferences.langue}
                    onChange={e => setPreferences(p => ({ ...p, langue: e.target.value }))}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="db-popup__footer">
                <button type="button" className="db-btn-secondaire" onClick={() => setPopupPref(false)}>Annuler</button>
                <button type="submit" className="db-btn-principal"><FaCheck /> Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;