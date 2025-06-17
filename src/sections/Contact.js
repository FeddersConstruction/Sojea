import React from 'react';
import '../styles/Contact.css';
import ContactImg from '../assets/img/Contact.png';

export default function Contact() {
  return (
    <section id="contact" className="contact-container">
      <div className="contact-image">
        <img src={ContactImg} alt="Contact us" />
      </div>
      <div className="contact-text">
        <h2>Contact Us</h2>
        <p>
          Got questions or feedback? We’d love to hear from you!<br />
          Email: support@ourstore.com<br />
          Phone: (123) 456-7890
        </p>
      </div>
    </section>
  );
}
