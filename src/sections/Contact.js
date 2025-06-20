// src/components/Contact.js
import React, { useRef, useEffect } from 'react';
import '../styles/Contact.css';
import ContactImg from '../assets/img/Contact.png';

export default function Contact() {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const els = [titleRef.current, bodyRef.current].filter(Boolean);
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
        <p ref={titleRef} className="contact-title fade-up">
          Contact Us
        </p>
        <p ref={bodyRef} className="contact-body fade-up">
          Got questions or feedback? We’d love to hear from you!<br />
          <a href={`mailto:${email}`} className="contact-link">
            Click here
          </a>{' '}
          to email me or call <strong>(859) 630-5897</strong>.
        </p>
      </div>
    </section>
  );
}
