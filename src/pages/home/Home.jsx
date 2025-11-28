import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Version from '../../components/ui/Version/Version';
import './Home.css';

const Home = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);

  // Usuarios válidos desde variables de entorno
  const validUsers = import.meta.env.VITE_AUTH_USERS
    ? import.meta.env.VITE_AUTH_USERS.split(',').map(user => {
        const [username, password] = user.split(':');
        return { username, password };
      })
    : [];

  const handleLogin = (e) => {
    e.preventDefault();
    const isValidUser = validUsers.some(
      user => user.username === username && user.password === password
    );

    if (isValidUser) {
      login();
      setError('');
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="home-container">
      <div className="home-card">
        <img src="/logo-icbfs.png" alt="ICB Food Services" className="home-logo" />
        <h1 className="home-title">Iniciar Sesión</h1>
        <p className="home-subtitle">Accede a tu panel de análisis</p>

        <form onSubmit={handleLogin} className="home-form">
          <div className="home-input-group">
            <label htmlFor="username" className="home-label">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="home-input"
              autoComplete="username"
              required
            />
          </div>

          <div className="home-input-group">
            <label htmlFor="password" className="home-label">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="home-input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="home-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="home-button home-button-primary"
            onMouseEnter={() => setIsHoveringLogin(true)}
            onMouseLeave={() => setIsHoveringLogin(false)}
          >
            Entrar
          </button>
        </form>
      </div>
      <Version />
    </div>
  );
};

export default Home;
