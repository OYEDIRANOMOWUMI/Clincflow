import React, { useState } from "react";
import "../styles/nav.css";
import { Link } from "react-router-dom";
import { HeartPulse } from 'lucide-react';

const Nav = () => {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <>
      <nav className="nav">
        <div className="nav-bar">
          <Link to="/" className="flex items-center gap-2" aria-label="Carevyn Hospital home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] text-white shadow-md">
              <HeartPulse size={20} strokeWidth={2.5} />
            </span>
            <h4 style={{fontFamily:'ui-sans-serif'}}>Carevyn <span>Hospital</span></h4>
          </Link>
          <ul className="desk-nav">
            <li>Home</li>
            <li>About Us</li>
            <li>Our Facilities</li>
            <li>Emergency </li>
          </ul>
          <ul className={`mobile-nav ${showMenu ? "show" : ""}`}>
            <li>Home</li>
            <li>About Us</li>
            <li>Our Facilities</li>
            <li>Emergency </li>
            <li>Appointment</li>
          </ul>
          <Link className="apt-btn dsk" to="/">
            Appointment
          </Link>
          <div
            className={`toggle ${showMenu ? "show" : ""}`}
            onClick={toggleMenu}
          >
            <span className="first"></span>
           
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
