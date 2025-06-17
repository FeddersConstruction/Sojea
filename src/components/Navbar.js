// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
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
  const [user, setUser]         = useState(null);
  const navigate                = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
  }, []);

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
    <nav className="navbar">
      <div className="nav-left">
        <HashLink
          to="/#home"
          className="nav-item"
          scroll={el => el.scrollIntoView({ behavior: 'smooth' })}
        >
          Home
        </HashLink>
        <HashLink
          to="/#about"
          className="nav-item"
          scroll={el => el.scrollIntoView({ behavior: 'smooth' })}
        >
          About
        </HashLink>
        <HashLink
          to="/#contact"
          className="nav-item"
          scroll={el => el.scrollIntoView({ behavior: 'smooth' })}
        >
          Contact
        </HashLink>
      </div>

      <button
        className="nav-menu-icon"
        onClick={() => setMenuOpen(open => !open)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        <Link to="/products" className="nav-icon" title="Products">
          <FaShoppingBag /><span className="nav-text">Products</span>
        </Link>

        {user ? (
          <button
            className="nav-icon nav-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt /><span className="nav-text">Logout</span>
          </button>
        ) : (
          <Link to="/auth" className="nav-icon" title="Login">
            <FaSignInAlt /><span className="nav-text">Login</span>
          </Link>
        )}

        <button
          className="nav-icon"
          onClick={handleCartClick}
          title="Cart"
        >
          <FaShoppingCart /><span className="nav-text">Cart</span>
        </button>
      </div>
    </nav>
  );
}
