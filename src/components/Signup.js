// src/components/Signup.js
import React, { useState } from 'react'
import '../styles/Signup.css'

export default function Signup({ onSubmit, error = '' }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ name, email, password })
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2 className={`signup-title ${error ? 'signup-error' : ''}`}>
        {error || 'Create Account'}
      </h2>

      <label>
        Full Name
        <input
          type="text"
          className="signup-input"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          className="signup-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          className="signup-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="signup-button">
        Sign Up
      </button>
    </form>
  )
}
