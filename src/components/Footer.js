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
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            title="Twitter/X"
          >
            <FaXTwitter />
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
