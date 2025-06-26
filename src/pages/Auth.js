// src/pages/Auth.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import Login   from '../components/Login'
import Signup  from '../components/Signup'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'

export default function Auth() {
  const [mode, setMode]   = useState('login')
  const [error, setError] = useState(null)
  const navigate          = useNavigate()
  const API               = process.env.REACT_APP_API_BASE_URL

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) navigate('/', { replace: true })
  }, [navigate])

  const handleLogin = async ({ email, password }) => {
    setError(null)
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/products')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSignup = async ({ name, email, password }) => {
    setError(null)
    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/products')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <div className="auth-toggle">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError(null) }}
            >
              Login
            </button>
            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => { setMode('signup'); setError(null) }}
            >
              Sign Up
            </button>
          </div>

          {/* no more black‐text banner here */}

          {mode === 'login'
            ? <Login  onSubmit={handleLogin} error={error} />
            : <Signup onSubmit={handleSignup} error={error} />
          }
        </div>
      </div>
      <Footer />
    </>
  )
}
