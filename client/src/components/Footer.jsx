import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Carevyn Hospital</h4>
          <p>Modern healthcare management connecting specialists, patients, and care teams in seamless clinical experience.</p>
        </div>

        <div className="footer-col">
          <h5>Hospital Access</h5>
          <ul>
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/hospital-register">Register Hospital</Link></li>
            <li><Link to="/">Book Appointment</Link></li>
            <li><Link to="/">Contact Care Team</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Hospital Administration</h5>
          <p className="mb-3"><strong>Admin controls</strong></p>
          <Link to="/hospital-register" className="inline-block mb-3 px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors text-sm">
            Register Hospital
          </Link>
          <p className="text-sm"><Link to="/login" className="text-emerald-700 hover:underline font-semibold">Portal sign in</Link> → staff management, patient access, and reporting</p>
        </div>

        <div className="footer-col">
          <h5>Admin-managed access</h5>
          <p className="text-sm mb-3">After hospital admin setup, staff and patients log in through the secure admin dashboard.</p>
          <ul className="text-sm">
            <li>🩺 Staff portal is managed by admin</li>
            <li>👤 Patient portal is managed by admin</li>
            <li>📋 Role-based access remains restricted</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <small>
          © {new Date().getFullYear()} Carevyn Hospital Systems. Precision in Practice.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
