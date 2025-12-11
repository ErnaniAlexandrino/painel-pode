import React from 'react';
import logoPodemos from '../assests/imagens/logo_podemos.svg';

const Header = () => {
  return (
    <div className="header-container">
      <div className="header-bar">
        <div className="header-logo">
          <img src={logoPodemos} alt="Podemos 20" />
        </div>
        <div className="user-info">
          <span>Olá, <strong>Nome do Gestor</strong></span>
          <div className="user-avatar">👤</div>
          <span className="user-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default Header;


