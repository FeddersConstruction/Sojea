// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import {
  FaShoppingBag,
  FaSignInAlt,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import '../styles/Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user,     setUser]     = useState(null);
  const [hidden,   setHidden]   = useState(false);
  const lastScrollY            = useRef(0);
  const navigate               = useNavigate();
  const SHOW_AT_TOP            = 20; // px threshold

  // Load user once
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
  }, []);

  // Hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;
      if (currentY < SHOW_AT_TOP) {
        setHidden(false);
      } else if (currentY > lastScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-close dropdown when hidden
  useEffect(() => {
    if (hidden && menuOpen) {
      setMenuOpen(false);
    }
  }, [hidden, menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  const handleCartClick = () => {
    const u = JSON.parse(localStorage.getItem('user'));
    navigate(u ? '/cart' : '/auth');
  };

  return (
    <nav className={`navbar${hidden ? ' hidden' : ''}`}>
      <div className="nav-left">
        <HashLink to="/#home"    className="nav-item" scroll={el => el.scrollIntoView({ behavior: 'smooth' })}>Home</HashLink>
        <HashLink to="/#about"   className="nav-item" scroll={el => el.scrollIntoView({ behavior: 'smooth' })}>About</HashLink>
        <HashLink to="/#contact" className="nav-item" scroll={el => el.scrollIntoView({ behavior: 'smooth' })}>Contact</HashLink>
      </div>

      <button
        className="nav-menu-icon"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      <div className={`nav-right${menuOpen ? ' open' : ''}`}>
        <Link to="/products" className="nav-icon" title="Products">
          <FaShoppingBag /><span className="nav-text">Products</span>
        </Link>

        {user ? (
          <button className="nav-icon nav-logout" onClick={handleLogout} title="Logout">
            <FaSignOutAlt /><span className="nav-text">Logout</span>
          </button>
        ) : (
          <Link to="/auth" className="nav-icon" title="Login">
            <FaSignInAlt /><span className="nav-text">Login</span>
          </Link>
        )}

        <button className="nav-icon" onClick={handleCartClick} title="Cart">
          <FaShoppingCart /><span className="nav-text">Cart</span>
        </button>
      </div>
    </nav>
  );
}
