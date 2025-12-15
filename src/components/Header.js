import React from 'react';
import { useAuth } from '../context/AuthContext';
import logoPodemos from '../assests/imagens/logo_podemos.svg';

const Header = () => {
  const { user } = useAuth();
  
  return (
    <div className="header-container">
      <div className="header-bar">
        <div className="header-logo">
          <img src={logoPodemos} alt="Podemos 20" />
        </div>
        <div className="user-info">
          <span>Olá, <strong>{user?.full_name || user?.email || 'Usuário'}</strong></span>
          <div className="user-avatar">👤</div>
          <span className="user-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default Header;


