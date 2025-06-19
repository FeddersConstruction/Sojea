// src/pages/Start.js
import React from 'react';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';
import Home    from '../sections/Home';
import About   from '../sections/About';
import Contact from '../sections/Contact';

export default function Start() {
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
