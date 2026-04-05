import React, { useRef, useState } from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaUserCheck,
  FaPercentage,
  FaCoins,
  FaCopy,
  FaDownload,
} from "react-icons/fa";
import { MdEmail, MdSms } from "react-icons/md";
import "./Parainage.css";
import { QRCodeCanvas } from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import handleDownloadBanner from "../assets/js/handleDownloadBanner"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,  
} from "recharts";

import g1 from "../assets/g1.jpg"
import g2 from "../assets/g2.jpg"
import g3 from "../assets/g3.jpg"

// ── Tooltip personnalisé ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="pf-tooltip">
        <p className="pf-tooltip__label">{label}</p>
        <p className="pf-tooltip__value">
          {payload[0].value}
          <span className="pf-tooltip__unit"> filleuls</span>
        </p>
      </div>
    );
  }
  return null;    
};

// parainage simuler 
const parains =[
  {
    "id":1,
    "images":g1,
    "nom":"jean dupont",
    "filleuls":25,
    
  },
  {
    "id":2,
    "images":g2,
    "nom":"marie",
    "filleuls":20,
    
  },
  {
    "id":3,
    "images":g3,
    "nom":"martin",
    "filleuls":2
    
  },
]

// recompense
const recompense =[
  {
    "id":1,
    "rang":"1er",
    "montant":"200000",
   "carte":"carte cadeau"
  },
  {
    "id":2,
    "rang":"2eme",
    "montant":"150000",
       "carte":"carte cadeau"

  },
  {
    "id":3,
    "rang":"3eme",
    "montant":"1500",
       "carte":"carte cadeau"

  },
]


// ── Templates par réseau donnnees_simules_remplacer_via_api──────────────────────────────────────────────────
const templates = {
  whatsapp: `Salut !  Rejoins KBF avec mon lien et gagne des récompenses incroyables ! \nInscris-toi ici : https://kbf.com/register?ref=b1234`,
  facebook: ` Invitez vos amis et gagnez ! Rejoignez KBF et profitez d'avantages exclusifs.\n https://kbf.com/register?ref=b1234`,
  sms: `Rejoins KBF et gagne des récompenses ! Inscris-toi : https://kbf.com/register?ref=b1234`,
  email: `Bonjour,\n\nJe t'invite à rejoindre KBF !\nInvitez vos amis et gagnez des récompenses exclusives.\n\nClique ici :\nhttps://kbf.com/register?ref=b1234\n\nÀ bientôt !`,
};

// ── Données simulées du graph ─────────────────────────────────────────────
// TODO : remplacer par les vraies données depuis le backend
const data = [
  { mois: "Janv", filleuls: 20 },
  { mois: "Févr", filleuls: 45 },
  { mois: "Mars", filleuls: 30 },
  { mois: "Avr",  filleuls: 80 },
  { mois: "Mai",  filleuls: 60 },
  { mois: "Juin", filleuls: 110 },
  { mois: "Juil", filleuls: 95 },
  { mois: "Août", filleuls: 140 },
  { mois: "Sept", filleuls: 120 },
  { mois: "Oct",  filleuls: 175 },
  { mois: "Nov",  filleuls: 155 },
  { mois: "Déc",  filleuls: 195 },
];

// ── Stats simulées calculées depuis le graph ──────────────────────────────
// TODO : remplacer par les vraies valeurs depuis le backend
const totalFilleuls = data.reduce((acc, d) => acc + d.filleuls, 0); // total inscrits = 1225
const dernierMois   = data[data.length - 1].filleuls;               // filleuls du dernier mois = 195
// taux de conversion = filleuls dernierMois / totalFilleuls * 100
const tauxConversion = ((dernierMois / totalFilleuls) * 100).toFixed(1); // <= 17.3%
// gains : 1 filleul = 10 pts (règle simulée)
const pointsGagnes  = totalFilleuls * 10; // = 12 250 pts

const Parainage = () => {
  const referralLink = "https://kbf.com/register?ref=b1234";
  const qrRef = useRef(null);

  const [selectedNetwork, setSelectedNetwork] = useState("whatsapp");
  const [templateText, setTemplateText]       = useState(templates.whatsapp);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => toast.success("Lien copié !"))
      .catch(() => toast.error("Erreur lors de la copie"));
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "kbf-qrcode.png";
    a.click();
    toast.success("QR Code téléchargé !");
  };

  const handleWhatsapp = () => {
    const message = encodeURIComponent(
      `Rejoins KBF avec mon lien de parrainage et profite des avantages ! \n${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Rejoins KBF avec mon lien de parrainage !");
    const body = encodeURIComponent(
      `Bonjour,\n\nJe t'invite à rejoindre KBF !\nClique sur ce lien pour t'inscrire:\n${referralLink}\n\nÀ bientôt !`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSms = () => {
    const message = encodeURIComponent(`Rejoins KBF avec mon lien : ${referralLink}`);
    window.open(`sms:?body=${message}`);
  };

  const handleNetworkChange = (e) => {
    const value = e.target.value;
    setSelectedNetwork(value);
    setTemplateText(templates[value] || "");
  };

  const handleUseTemplate = () => {
    const encoded = encodeURIComponent(templateText);
    if (selectedNetwork === "whatsapp") {
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    } else if (selectedNetwork === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
    } else if (selectedNetwork === "sms") {
      window.open(`sms:?body=${encoded}`);
    } else if (selectedNetwork === "email") {
      const subject = encodeURIComponent("Rejoins KBF avec mon lien de parrainage !");
      window.open(`mailto:?subject=${subject}&body=${encoded}`);
    }
    toast.success("Ouverture du partage...");
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
      <section className="parainage">
        <h1 className="title-par">invitez vos amis et gagnez de recompenses !</h1>
        <hr />
        <div className="blogs container">
          <div className="blog1">
            <div className="share">
              <div className="sharnet">
                <h3 className="titleLink">generer mon lien unique de parainage</h3>
                <h3 className="subtitle">unique de parainage url</h3>
                <div className="inputAnetwork">
                  <div className="inputReadonly">
                    <input type="text" readOnly value={referralLink} />
                    <button className="copy" onClick={handleCopy}>
                      <FaCopy /> copier
                    </button>
                  </div>
                  <h4 className="titleIn">
                    partage direct <br />
                    <small>partagez directement avec vos proches</small>
                  </h4>
                  <hr />
                  <div className="socialShare">
                    <span className="whatsapp" onClick={handleWhatsapp} title="Partager sur WhatsApp"><FaWhatsapp /></span>
                    <span className="facebook" onClick={handleFacebook} title="Partager sur Facebook"><FaFacebook /></span>
                    <span className="gmail"    onClick={handleEmail}    title="Partager par Email"><MdEmail /></span>
                    <span className="sms"      onClick={handleSms}      title="Partager par SMS"><MdSms /></span>
                  </div>
                </div>
              </div>

              <div className="sharQR">
                <h3 className="qrCode-title">qr code</h3>
                <div className="downloadQr">
                  <div className="qr" ref={qrRef}>
                    <QRCodeCanvas value={referralLink} size={150} bgColor="#ffffff" fgColor="#0a0a0a" level="H" includeMargin={true} />
                  </div>
                  <button className="qr-btn" onClick={handleDownloadQR}>
                    <FaDownload /> telecharger qr
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ BLOG2 MODIFIÉ ════════════ */}
          <div className="blog2">
            <h4 className="title-tracker">mon tracker de performance</h4>
            <div className="trackers">

              {/*  Filleuls inscrits — calculé depuis le total du graph */}
              <div className="tacker-num-points">
                <div className="fil-track">
                  <span className="user-point"><FaUserCheck className="user-fa" /></span>
                  {/* TODO : remplacer totalFilleuls par la vraie valeur backend */}
                  <span className="user-point-__">{totalFilleuls}</span>
                </div>
                <span className="descrip">nombres de <br /> filleuls inscrits</span>
              </div>

              {/*  Taux de conversion — calculé depuis dernierMois / total */}
              <div className="tacker-num-points-percent">
                <div className="fil-track">
                  <span className="user-point"><FaPercentage className="user-fa" /></span>
                  {/* TODO : remplacer tauxConversion par la vraie valeur backend */}
                  <span className="user-point-__">{tauxConversion}%</span>
                </div>
                <span className="descrip">taux de conversions</span>
              </div>

              {/*  Points gagnés — calculé depuis total * 10 pts par filleul */}
              <div className="tacker-num-points-pieces">
                <div className="fil-track">
                  <span className="user-point"><FaCoins className="user-fa" /></span>
                  {/* TODO : remplacer pointsGagnes par la vraie valeur backend */}
                  <span className="user-point-__">{pointsGagnes.toLocaleString()} <sub>pts</sub></span>
                </div>
                <span className="descrip">points/gains accumulers</span>
              </div>

            </div>

            <div className="pf-chart">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--primary-blue)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary-blue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--text-heading)" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "var(--text-heading)", fontFamily: "arial, sans-serif" }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} tick={{ fontSize: 11, fill: "var(--text-heading)", fontFamily: "arial, sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--primary-blue)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="filleuls" stroke="var(--primary-blue)" strokeWidth={2.5} fill="url(#gradPerf)" dot={false} activeDot={{ r: 5, fill: "var(--primary-blue)", stroke: "var(--bg-white)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/*________________ FIN BLOG2______________*/}

          <div className="blog3">
            <h4 className="title-classement">classement de parains du mois</h4>
                   <div className="parains">
                    {
                      parains.map((p)=>(
                        <div key={p.id} className="p">
                             <img src={p.images} alt="" /> 
                             <span>{p.nom}</span> 
                             <span>{p.filleuls} filleuls</span> 
                        </div>
                      ))
                    }
                   </div>
            <hr />
            <div className="rec">
              <h3 className="titleRec">recompence du mois</h3>
                   <div className="reco">

                      {
                      recompense.map((r)=>(
                        <div key={r.id} className="r">
                             
                             <span>{r.rang}:</span> 
                             <span>{r.montant}:</span> 
                             <span>{r.carte}</span> 
                             {/* <span>{r} filleuls</span>  */}
                        </div>
                      ))
                    }
                   </div>
            </div>
          </div>

          <div className="blog4">
            <h4 className="titleMacketing">outils macketing pour les parains</h4>
            <h4 className="supMacketing">banieres telechageable</h4>
            <div className="tools-and-template">
              <div className="toolsMacketing">
                <div className="cart-baniere1">
                  <span className="cart-baniere"></span>
                  <button className="downloar-btn" onClick={() => handleDownloadBanner(300, 250, "kbf-banniere-300x250.png")}>
                    <FaDownload /> telecharger
                  </button>
                </div>
                <div className="cart-baniere2">
                  <span className="cart-baniere"></span>
                  <button className="downloar-btn" onClick={() => handleDownloadBanner(728, 90, "kbf-banniere-728x90.png")}>
                    <FaDownload /> telecharger
                  </button>
                </div>
                <div className="cart-baniere3">
                  <span className="cart-baniere"></span>
                  <button className="downloar-btn" onClick={() => handleDownloadBanner(160, 600, "kbf-banniere-160x600.png")}>
                    <FaDownload /> telecharger
                  </button>
                </div>
              </div>

              <div className="templateMessage">
                <h3>template des messages</h3>
                <form className="form-tempate" onSubmit={(e) => e.preventDefault()}>
                  <div className="selection1">
                    <select className="select1" name="any1" value={selectedNetwork} onChange={handleNetworkChange}>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                    <textarea name="tem1" rows={5} cols={10} value={templateText} onChange={(e) => setTemplateText(e.target.value)} />
                  </div>
                </form>
                <div className="useTemp">
                  <button onClick={handleUseTemplate}>utiliser ce template</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Parainage;