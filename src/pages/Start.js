// src/pages/Start.js
import React, { useEffect } from 'react';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';
import Home    from '../sections/Home';
import About   from '../sections/About';
import Contact from '../sections/Contact';

export default function Start() {
  // Read the env var (only true if you set REACT_APP_UNDERWAY to "true")
  const underway = process.env.REACT_APP_UNDERWAY === 'true';

  useEffect(() => {
    if (underway) {
      // Redirect immediately to your underway page
      window.location.href = 'https://garrettstrange.com/underway';
    }
  }, [underway]);

  // While redirecting, render nothing (avoids flicker)
  if (underway) return null;

  // Normal Start page
  return (
    <>
      <Navbar />
      <Home    id="home"    />
      <About   id="about"   />
      <Contact id="contact" />
      <Footer />
    </>
  );
}
