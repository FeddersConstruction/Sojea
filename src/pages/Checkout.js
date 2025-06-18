// src/pages/Checkout.js
import React from 'react';
import '../styles/Checkout.css';
import SquareForm from '../components/SquareForm';
import Navbar  from '../components/Navbar';

export default function Checkout() {
  return (
    <div className="container">
      <div className="wrapper">
        <p className="checkout-title">Checkout</p>
        <SquareForm />
      </div>
    </div>
  );
}