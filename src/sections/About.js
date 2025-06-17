import React from 'react';
import AboutImg from '../assets/img/About.png';
import '../styles/About.css';

export default function About() {
  return (
    <section id="about" className="about-container">
      <div className="about-text">
        <h2>About Us</h2>
        <p>
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
