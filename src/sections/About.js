// src/components/About.js
import React, { useRef, useEffect } from 'react';
import AboutImg from '../assets/img/About.png';
import '../styles/About.css';

export default function About() {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-up-active');
          obs.unobserve(entry.target);  // only run once
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="about-container">
      <div ref={textRef} className="about-text fade-up">
        <p className="about-title">About Us</p>
        <p className="about-body">
          We’re a small team passionate about bringing you the best products
          with care and integrity. Our mission is to serve you well and make
          your life easier.
        </p>
      </div>
      <div className="about-image">
        <img src={AboutImg} alt="About us" />
      </div>
    </section>
  );
}
