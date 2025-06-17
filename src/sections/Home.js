// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/img/Logo.png';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <section id="home" className="home-container">
      <div className="home-content">
        <img src={Logo} alt="Logo" className="home-logo" />
        <button
          className="home-button"
          onClick={() => navigate('/products')}
        >
          Check Out My Products!
        </button>
      </div>
    </section>
  );
}
