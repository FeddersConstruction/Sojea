// src/components/Contact.js
import React from 'react';
import '../styles/Contact.css';
import ContactImg from '../assets/img/Contact.png';

export default function Contact() {
  const email = 'sojea2025@outlook.com';

  return (
    <section id="contact" className="contact-container">
      <div className="contact-image">
        <img
          className="contact-img"
          src={ContactImg}
          alt="Contact us"
        />
      </div>
      <div className="contact-text">
        <p className="contact-title">Contact Us</p>
        <p className="contact-body">
          Got questions or feedback? We’d love to hear from you!<br />
          <a
            href={`mailto:${email}`}
            className="contact-link"
          >
            Click here
          </a>{' '}
          to email me or call <strong>(859) 630-5897</strong>.
        </p>
      </div>
    </section>
  );
}
