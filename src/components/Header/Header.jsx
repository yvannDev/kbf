import React, { useState } from 'react'
import "./Header.css"
import { Link } from 'react-router-dom'
import { FaCreditCard, FaMoneyBillWave, FaUniregistry, FaUserCog } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { MdDashboard } from "react-icons/md"
import { FaUserFriends } from 'react-icons/fa';
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Liste des liens de navigation (évite la duplication)
const navItems = [
  { to: "/Dashboard", icon: <MdDashboard />, label: "Dashboard" },
  { to: "/parrainage", icon: <FaUserFriends />, label: "parrainage" },
  { to: "/GestionFinancière", icon: <FaMoneyBillWave />, label: "Gestion Financière" },
  { to: "/Paiement", icon: <FaCreditCard />, label: "Paiement"},
  { to: "/Retraits", icon: <FaUniregistry />, label: "Retraits"},
  { to: "/register", icon: <BiLogOut />, label: "register" },
  { to: "/Administrateur", icon: <FaUserCog />, label: "admin"},
];

const Header = () => {
  const [ismobile, setMobile] = useState(false)

  const toggleMenu = () => {
    setMobile(!ismobile)
  }

  const closeMobile = () => {
    setMobile(false)
  }

  return (
    <>
      <header>
        {/* Navigation desktop */}
        <nav className="nav-bar">

          {/* Logo — corrigé : était un <li> orphelin hors du <ul>, maintenant un <div> */}
          <div className="nav-logo">
            <Link className='nav-links' to={"/"}>kbf</Link>
          </div>

          {/* Menu desktop */}
          <ul className="nav-menu">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link className='nav-links' to={item.to}>
                  {item.icon}{item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Bouton hamburger mobile */}
          <button
            className='btn-mobile'
            onClick={toggleMenu}
            aria-label='basculer le menu'
          >
            {ismobile ? <FaTimes /> : <FaBars />}
          </button>

          {/* Menu mobile animé */}
          <AnimatePresence>
            {ismobile && (
              <motion.div
                className='mobileMenu'
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <nav className="mobileNav">
                  <ul className="nav-menuMobile">
                    {navItems.map((item, index) => (
                      <li key={index} className="nav-item">
                        {/* closeMobile ajouté : ferme le menu au clic sur un lien */}
                        <Link className='nav-links' to={item.to} onClick={closeMobile}>
                          {item.icon}{item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </header>
    </>
  )
}

export default Header