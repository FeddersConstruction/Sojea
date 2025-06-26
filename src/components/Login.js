// src/components/Login.js
import React, { useState } from 'react'
import '../styles/Login.css'

export default function Login({ onSubmit, error = '' }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    await onSubmit({ email, password })
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2 className={`login-title ${error ? 'login-error' : ''}`}>
        {error || 'Welcome Back'}
      </h2>

      <label>
        Email
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="login-button">
        Log In
      </button>
    </form>
  )
}
