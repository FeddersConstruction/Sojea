// src/components/Footer.js
import React from 'react';
import { FaFacebookF, FaInstagram, FaXTwitter, FaCode } from 'react-icons/fa6';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">© 2025 Sojea</p>
        <div className="footer-icons">
          <a
            href="https://www.facebook.com/profile.php?id=61576149418380"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.instagram.com/sojea_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://garrettstrange.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Developer"
          >
            <FaCode />
          </a>
        </div>
      </div>
    </footer>
  );
}
