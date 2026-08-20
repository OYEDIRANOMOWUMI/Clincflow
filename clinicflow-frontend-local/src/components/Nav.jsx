import React, { useState } from "react";
import "../styles/nav.css";
import logo from "../assets/iwosan.png";
import { Link } from "react-router-dom";

const Nav = () => {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <>
      <nav className="nav">
        <div className="nav-bar">
          <h4 style={{fontFamily:'ui-sans-serif'}}>ClinicFlow Hospital</h4>
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
          <Link className="apt-btn dsk" to="/appointment">
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
