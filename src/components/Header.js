import React from 'react';
import { useAuth } from '../context/AuthContext';
import logoPodemos from '../assests/imagens/logo_podemos.svg';
import logoPodemosAzul from '../assests/imagens/logo_podemos_azul.svg';

const Header = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário é Gestor
  const isGestor = (user?.perfil || '').toString().trim().toLowerCase() === 'gestor';
  
  // Seleciona o logo baseado no perfil
  const logo = isGestor ? logoPodemos : logoPodemosAzul;
  
  return (
    <div className="header-container">
      <div className={`header-bar ${!isGestor ? 'header-bar--coordenador' : ''}`}>
        <div className="header-logo">
          <img src={logo} alt="Podemos 20" />
        </div>
        <div className={`user-info ${!isGestor ? 'user-info--coordenador' : ''}`}>
          <span>Olá, <strong>{user?.full_name || user?.email || 'Usuário'}</strong></span>
          <div className="user-avatar">👤</div>
          <span className="user-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default Header;


