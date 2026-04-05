import React, { useState } from 'react';
import './retrait.css';
// les images 
import t from "../assets/t.webp"
import w from "../assets/w.png"
import m from "../assets/m.png"
// ─── React Icons ─────────────────────────────────────────────────────────────
import {
  FiSend, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiInfo, FiRefreshCw, FiShield, FiLock, FiSettings,
  FiArrowRight, FiUser, FiPhone, FiBell, FiList,
  FiPlusCircle, FiDollarSign, FiLoader, FiEye,
  FiCheck, FiX, FiEdit3, FiChevronRight, FiInbox,
} from 'react-icons/fi';
import { RiBankLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { HiOutlineCheckBadge } from 'react-icons/hi2';
import { BsWater } from 'react-icons/bs';   

// ─── Données pays ──────────────────────────────────────────────────────────
const PAYS = [
  { code: '+228', flag: '🇹🇬', name: 'Togo',         iso: 'TG' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin',        iso: 'BJ' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire",iso: 'CI' },
];

// ─── Méthodes ───────────────────────────────────────────────────────────────
const METHODES = [
  {
    id: 'tmoney',
    name: 'TMoney',
    Icon: t,
    color: '#f59e0b',
    paysDisponibles: ['TG'],
    prefixDefaut: '+228',
    champLabel: 'Numéro TMoney',
    placeholder: 'Ex: 90 00 00 00',
  },
  {
    id: 'moov',
    name: 'Moov Money',
    Icon: m,
    paysDisponibles: ['BJ', 'TG', 'BF', 'ML', 'CI', 'GN'],
    prefixDefaut: '+229',
    champLabel: 'Numéro Moov Money',
    placeholder: 'Ex: 97 00 00 00',
  },
  {
    id: 'wave',
    name: 'Wave',
  Icon: w,
    paysDisponibles: ['SN', 'CI', 'ML', 'BF', 'GN'],
    prefixDefaut: '+221',
    champLabel: 'Numéro Wave',
    placeholder: 'Ex: 77 000 00 00',
  },
  {
    id: 'virement',
    name: 'Virement Bancaire',
    Icon: <RiBankLine/>,
    paysDisponibles: null,
    prefixDefaut: null,
    champLabel: 'IBAN / Numéro de compte',
    placeholder: 'Ex: TG53 TG00 6100 0067 0000 26',
  },
];

// ─── Historique initial ─────────────────────────────────────────────────────
const HISTORIQUE_INIT = [
  { id: 1, date: '12/01/2023', montant: 5000, methode: 'TMoney',     status: 'demandee', numero: '+228 90 12 34 56', nom: 'Koffi A.' },
  { id: 2, date: '23/01/2023', montant: 4000, methode: 'Moov Money', status: 'en-cours', numero: '+229 97 45 67 89', nom: 'Adjovi B.' },
  { id: 3, date: '15/01/2023', montant: 4000, methode: 'TMoney',     status: 'validee',  numero: '+228 91 23 45 67', nom: 'Mensah C.' },
  { id: 4, date: '19/01/2023', montant: 4000, methode: 'Wave',       status: 'rejetee',  numero: '+221 77 00 12 34', nom: 'Diallo D.' },
];

const ADMIN_INIT = [
  { id: 101, userId: '101', montant: 5000, methode: 'TMoney',     date: '22/01/2023', numero: '+228 90 11 22 33' },
  { id: 112, userId: '112', montant: 4000, methode: 'Moov Money', date: '23/01/2023', numero: '+229 97 44 55 66' },
  { id: 103, userId: '103', montant: 4000, methode: 'TMoney',     date: '19/01/2023', numero: '+228 90 99 88 77' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtMontant = (n) => n.toLocaleString('fr-FR') + ' FCFA';

const StatusBadge = ({ status }) => {
  const cfg = {
    demandee:   { label: 'Demandée', Icon: FiSend,        cls: 'demandee' },
    'en-cours': { label: 'En cours', Icon: FiClock,       cls: 'en-cours' },
    validee:    { label: 'Validée',  Icon: FiCheckCircle, cls: 'validee'  },
    rejetee:    { label: 'Rejetée',  Icon: FiXCircle,     cls: 'rejetee'  },
  };
  const c = cfg[status] || cfg['demandee'];
  return (
    <span className={`status-badge ${c.cls}`}>
      <c.Icon size={12} /> {c.label}
    </span>
  );
};

// ─── Toast hook ─────────────────────────────────────────────────────────────
let _tid = 0;
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = ++_tid;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  };
  return { toasts, addToast };
};

// ─── Composant Principal ────────────────────────────────────────────────────
    const Retrait=()=>{
  const { toasts, addToast } = useToasts();
  // Form
  const [montant, setMontant]           = useState('');
  const [methodeId, setMethodeId]       = useState('tmoney');
  const [selectedPays, setSelectedPays] = useState('+228');
  const [numero, setNumero]             = useState('');
  const [nomTitulaire, setNomTitulaire] = useState('');
  const [iban, setIban]                 = useState('');
  const [banque, setBanque]             = useState('');
  const [loading, setLoading]           = useState(false);

  // App state
  const [historique, setHistorique]       = useState(HISTORIQUE_INIT);
  const [adminDemandes, setAdminDemandes] = useState(ADMIN_INIT);
  const [plafond, setPlafond]             = useState(500000);
  const [newPlafond, setNewPlafond]       = useState('');
  const [detailModal, setDetailModal]     = useState(null);
  const [activeStep, setActiveStep]       = useState(0);

  const methode     = METHODES.find(m => m.id === methodeId);
  const paysFiltres = methode?.paysDisponibles
    ? PAYS.filter(p => methode.paysDisponibles.includes(p.iso))
    : PAYS;
  const paysObj = PAYS.find(p => p.code === selectedPays);

  const montantNum     = parseInt(montant.replace(/\s/g, ''), 10) || 0;
  const montantValide  = montantNum >= 5000;
  const plafondDepasse = montantNum > plafond;
  const champRempli    = methodeId === 'virement' ? iban.length > 5 : numero.length >= 6;
  const formValide     = montantValide && !plafondDepasse && champRempli;

  const quotaUtilise  = 0;
  const pourcentQuota = Math.min((quotaUtilise / plafond) * 100, 100);

  const handleMethodeChange = (id) => {
    setMethodeId(id);
    setNumero('');
    setIban('');
    const m = METHODES.find(x => x.id === id);
    if (m?.prefixDefaut) setSelectedPays(m.prefixDefaut);
  };

  const handleMontantChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMontant(raw ? parseInt(raw, 10).toLocaleString('fr-FR') : '');
  };

  const handleSoumettre = async () => {
    if (!formValide) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));

    const today = new Date().toLocaleDateString('fr-FR');
    const numeroFinal = methodeId === 'virement' ? iban : `${selectedPays} ${numero}`;
    const newItem = {
      id: Date.now(),
      date: today,
      montant: montantNum,
      methode: methode.name,
      status: 'demandee',
      numero: numeroFinal,
      nom: nomTitulaire || 'Utilisateur',  
    };

    setHistorique(h => [newItem, ...h]);
    setAdminDemandes(a => [{
      id: newItem.id,
      userId: String(newItem.id).slice(-3),
      montant: montantNum,
      methode: methode.name,
      date: today,
      numero: numeroFinal,
    }, ...a]);

    setMontant(''); setNumero(''); setNomTitulaire(''); setIban(''); setBanque('');
    setLoading(false);
    setActiveStep(1);
    addToast(`Demande de ${fmtMontant(montantNum)} soumise avec succès !`, 'success');
    setTimeout(() => setActiveStep(0), 8000);
  };

  const handleValider = (id) => {
    setAdminDemandes(a => a.filter(d => d.id !== id));
    setHistorique(h => h.map(d => d.id === id ? { ...d, status: 'validee' } : d));
    addToast('Demande validée avec succès.', 'success');
  };

  const handleRejeter = (id) => {
    setAdminDemandes(a => a.filter(d => d.id !== id));
    setHistorique(h => h.map(d => d.id === id ? { ...d, status: 'rejetee' } : d));
    addToast('Demande rejetée.', 'error');
  };

  const handlePlafondUpdate = () => {
    const val = parseInt(newPlafond.replace(/\D/g, ''), 10);
    if (!val || val < 10000) { addToast('Plafond minimum : 10 000 FCFA', 'error'); return; }
    setPlafond(val);
    setNewPlafond('');
    addToast(`Plafond mis à jour : ${fmtMontant(val)} / jour`, 'success');
  };

  const FLUX_STEPS = [
    { Icon: FiSend,        label: 'Mes Retraits'    },
    { Icon: FiShield,      label: 'Admin Review'    },
    { Icon: FiSettings,    label: 'Traitement 24-48h' },
    { Icon: FiBell,        label: 'Notification'    },
  ];

  return (
    <div className="retrait-app">

      {/* ── Toasts ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success'  && <FiCheckCircle  size={18} />}
              {t.type === 'error'    && <FiXCircle      size={18} />}
              {t.type === 'warning'  && <FiAlertCircle  size={18} />}
              {t.type === 'info'     && <FiInfo         size={18} />}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Modal Détail ── */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <FiList size={18} style={{ color: 'var(--primary)' }} />
              Détails de la Demande
            </div>
            {[
              ['ID',        '#' + detailModal.id],
              ['Date',      detailModal.date],
              ['Montant',   fmtMontant(detailModal.montant)],
              ['Méthode',   detailModal.methode],
              ['Numéro',    detailModal.numero || '—'],
              ['Titulaire', detailModal.nom || '—'],
              ['Statut',    detailModal.status],
            ].map(([k, v]) => (
              <div className="modal-detail-row" key={k}>
                <span className="modal-detail-label">{k}</span>
                <span className="modal-detail-value">{v}</span>
              </div>
            ))}
            <button className="modal-close" onClick={() => setDetailModal(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="retrait-header">
        <div className="retrait-header-icon">
          <RiMoneyDollarCircleLine size={24} />
        </div>
        <div className="retrait-header-text">
          <h1>Tableau de Bord — Mes Paiements</h1>
          <p>Gérez vos demandes de retrait en toute sécurité</p>
        </div>
      </div>

      <div className="retrait-grid">

        {/* ══ COLONNE GAUCHE ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Formulaire */}
          <div className="card">
            <div className="card-title">
              <div className="card-title-icon"><FiPlusCircle size={14} /></div>
              Nouvelle Demande de Retrait
            </div>

            {/* Montant */}
            <div className="form-group">
              <label className="form-label">
                Montant de retrait <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  className="form-input has-suffix"
                  type="text"
                  value={montant}
                  onChange={handleMontantChange}
                  placeholder="5 000"
                  inputMode="numeric"
                />
                <span className="input-suffix">FCFA</span>
              </div>
              {montant && !montantValide && (
                <p className="form-hint error">
                  <FiAlertCircle size={12} style={{ marginRight: 4 }} />
                  Montant minimum : 5 000 FCFA
                </p>
              )}
              {plafondDepasse && (
                <p className="form-hint error">
                  <FiAlertCircle size={12} style={{ marginRight: 4 }} />
                  Dépasse le plafond de {fmtMontant(plafond)} / jour
                </p>
              )}
              {montantValide && !plafondDepasse && (
                <p className="form-hint" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCheckCircle size={12} /> Montant valide
                </p>
              )}
            </div>

            {/* Choix méthode */}
            <div className="form-group">
              <label className="form-label">
                Choisir le moyen <span className="required">*</span>
              </label>
              <div className="method-grid">
                {METHODES.map(m => {
                  const MIcon = m.Icon;
                  return (
                    <div
                      key={m.id}
                      className={`method-card ${methodeId === m.id ? 'selected' : ''}`}
                      onClick={() => handleMethodeChange(m.id)}
                    >
                      <div className="method-logo">
                        <div className="method-logo-fallback" style={{ background: m.color }}>
                          {/* <MIcon size={18} color="#fff" /> */}
                          <img src={m.Icon} alt="" />
                        </div>
                      </div>
                      <span className="method-name">{m.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Champs Mobile Money ── */}
            {methodeId !== 'virement' ? (
              <>
                {/* Sélecteur pays */}
                <div className="form-group">
                  <label className="form-label">
                    Pays <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={selectedPays}
                    onChange={e => { setSelectedPays(e.target.value); setNumero(''); }}
                  >
                    {paysFiltres.map(p => (
                      <option key={p.iso} value={p.code}>
                        {p.flag}  {p.name}  ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Numéro */}
                <div className="form-group">
                  <label className="form-label">
                    {methode?.champLabel} <span className="required">*</span>
                  </label>
                  <div className="phone-input-group">
                    {/* Badge code pays auto */}
                    <div className="country-code-badge">
                      <FiPhone size={13} />
                      <span>{paysObj?.flag} {selectedPays}</span>
                    </div>
                    <input
                      className="form-input phone-input"
                      type="text"
                      value={numero}
                      onChange={e => setNumero(e.target.value.replace(/\D/g, ''))}
                      placeholder={methode?.placeholder}
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>

                  {/* Auto-détection compte */}
                  {numero.length >= 6 && (
                    <div className="recipient-block">
                      <div className="recipient-avatar" style={{ background: methode?.color }}>
                        {methode && <methode.Icon size={16} color="#fff" />}
                      </div>
                      <div className="recipient-info">
                        <div className="label">Compte {methode?.name} détecté</div>
                        <div className="value">{selectedPays} {numero}</div>
                        <div className="name verified">
                          <HiOutlineCheckBadge size={14} style={{ color: 'var(--success)', marginRight: 4 }} />
                          {paysObj?.flag} {paysObj?.name} — Vérifié
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nom du titulaire</label>
                  <div className="input-wrapper">
                    <FiUser size={15} className="input-icon" />
                    <input
                      className="form-input has-icon"
                      type="text"
                      value={nomTitulaire}
                      onChange={e => setNomTitulaire(e.target.value)}
                      placeholder="Nom complet (optionnel)"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* ── Champs Virement Bancaire ── */
              <>
                <div className="form-group">
                  <label className="form-label">
                    Banque <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <RiBankLine size={15} className="input-icon" />
                    <input
                      className="form-input has-icon"
                      type="text"
                      value={banque}
                      onChange={e => setBanque(e.target.value)}
                      placeholder="Ex: Ecobank, UBA, Orabank..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {methode?.champLabel} <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    value={iban}
                    onChange={e => setIban(e.target.value.toUpperCase())}
                    placeholder={methode?.placeholder}
                  />
                  {iban.length > 5 && (
                    <div className="recipient-block">
                      <div className="recipient-avatar" style={{ background: '#8b5cf6' }}>
                        <RiBankLine size={16} color="#fff" />
                      </div>
                      <div className="recipient-info">
                        <div className="label">Compte bancaire</div>
                        <div className="value" style={{ fontSize: '0.78rem' }}>{iban}</div>
                        <div className="name verified">
                          <HiOutlineCheckBadge size={14} style={{ color: 'var(--success)', marginRight: 4 }} />
                          {banque || 'Banque non précisée'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nom du titulaire</label>
                  <div className="input-wrapper">
                    <FiUser size={15} className="input-icon" />
                    <input
                      className="form-input has-icon"
                      type="text"
                      value={nomTitulaire}
                      onChange={e => setNomTitulaire(e.target.value)}
                      placeholder="Nom et prénom du titulaire du compte"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              className="btn-submit"
              onClick={handleSoumettre}
              disabled={!formValide || loading}
            >
              {loading
                ? <><FiLoader size={16} className="spin" /> Envoi en cours...</>
                : <><FiSend size={16} /> Soumettre la Demande</>
              }
            </button>
          </div>

          {/* ── Historique ── */}
          <div className="card">
            <div className="card-title">
              <div className="card-title-icon"><FiList size={14} /></div>
              Historique et Suivi des Demandes
            </div>
            {historique.length === 0 ? (
              <div className="empty-state">
                <FiInbox size={36} style={{ color: 'var(--text-light)', marginBottom: 8 }} />
                <p>Aucune demande pour le moment.</p>
              </div>
            ) : (
              <table className="historique-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {h.date}
                      </td>
                      <td className="amount-cell">{fmtMontant(h.montant)}</td>
                      <td style={{ fontSize: '0.8rem' }}>{h.methode}</td>
                      <td><StatusBadge status={h.status} /></td>
                      <td>
                        <button className="link-btn" onClick={() => setDetailModal(h)}>
                          Détails <FiChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ══ COLONNE DROITE ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Flux de Traitement ── */}
          <div className="card">
            <div className="card-title">
              <div className="card-title-icon"><FiRefreshCw size={14} /></div>
              Flux de Traitement
            </div>
            <div className="flux-steps">
              {FLUX_STEPS.map((s, i) => {
                const SIcon = s.Icon;
                const isDone   = i < activeStep;
                const isActive = i === activeStep;
                return (
                  <React.Fragment key={i}>
                    <div className={`flux-step ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                      <div className="flux-step-icon">
                        {isDone
                          ? <FiCheck size={16} />
                          : <SIcon size={16} />
                        }
                      </div>
                      <div className="flux-step-label">{s.label}</div>
                    </div>
                    {i < FLUX_STEPS.length - 1 && (
                      <FiArrowRight className="flux-arrow" size={16} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="info-note">
              <FiInfo size={14} className="info-note-icon" />
              <span>
                Validation manuelle anti-fraude. Délai : <strong>24–48h ouvrées</strong>.
              </span>
            </div>
          </div>

          {/* ── Panneau Admin ── */}
          <div className="card">
            <div className="card-title">
              <div className="card-title-icon"><FiShield size={14} /></div>
              Panneau d'Administration
              <span className="admin-badge">
                <FiLock size={10} /> Restreint
              </span>
            </div>

            {/* Plafond */}
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiSettings size={14} style={{ color: 'var(--primary)' }} />
              Configuration du Plafond Quotidien
            </p>
            <div className="plafond-display">
              <span className="plafond-label">Plafond actuel</span>
              <span className="plafond-value">{fmtMontant(plafond)} / jour</span>
            </div>

            <div className="plafond-bar-wrap">
              <div className="plafond-bar-label">
                <span>Quota utilisé</span>
                <span>{fmtMontant(quotaUtilise)}</span>
              </div>
              <div className="plafond-bar-track">
                <div className="plafond-bar-fill" style={{ width: pourcentQuota + '%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, marginBottom: 20 }}>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <FiDollarSign size={14} className="input-icon" />
                <input
                  className="form-input has-icon"
                  type="text"
                  value={newPlafond}
                  onChange={e => setNewPlafond(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nouveau plafond..."
                  style={{ fontSize: '0.85rem', padding: '10px 12px 10px 34px' }}
                />
              </div>
              <button
                onClick={handlePlafondUpdate}
                style={{
                  background: 'linear-gradient(135deg,var(--primary),var(--primary-light))',
                  color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 14px', fontFamily: 'var(--font)', fontSize: '0.8rem',
                  fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <FiEdit3 size={13} /> Mettre à jour
              </button>
            </div>

            {/* Demandes admin */}
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiBell size={14} style={{ color: 'var(--primary)' }} />
              Demandes à Valider ({adminDemandes.length})
            </p>

            {adminDemandes.length === 0 ? (
              <div className="empty-state">
                <FiCheckCircle size={32} style={{ color: 'var(--success)', marginBottom: 8 }} />
                <p>Aucune demande en attente.</p>
              </div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Date</th>   
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminDemandes.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>#{d.userId}</td>
                        <td className="amount-cell" style={{ fontSize: '0.78rem' }}>{fmtMontant(d.montant)}</td>
                        <td style={{ fontSize: '0.75rem' }}>{d.methode}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.date}</td>
                        <td>
                          <div style={{ display:'flex',
                            
                          }}>
                            <button className="btn-valider" onClick={() => handleValider(d.id)} title="Valider">
                              <FiCheck size={13} />
                            </button>
                            <button className="btn-rejeter" onClick={() => handleRejeter(d.id)} title="Rejeter">
                              <FiX size={13} />
                            </button>
                            <button className="btn-revue" onClick={() => addToast('Mise en revue manuelle.', 'warning')} title="Revue manuelle">
                              <FiEye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="info-note">
                  <FiClock size={14} className="info-note-icon" />
                  <span>Les demandes validées sont traitées sous 24 à 48 heures ouvrées.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Retrait;