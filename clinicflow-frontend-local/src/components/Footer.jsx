import React from "react";
import "../styles/home.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Eliza Care</h4>
          <p>Providing compassionate, high-quality care to our community.</p>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Contact</h5>
          <p>123 Health Ave, YourCity</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: info@elizacare.example</p>
        </div>

        <div className="footer-col">
          <h5>Newsletter</h5>
          <p>Get updates and health tips.</p>
          <form
            className="footer-subscribe"
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="email" placeholder="Your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <small>
          © {new Date().getFullYear()} Eliza Care. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
