import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoSedip from '../assests/imagens/logo_sedip.svg';

const Sidebar = ({ isOpen, onClose, onEstadoSelect }) => {
  const [isEstaduaisOpen, setIsEstaduaisOpen] = useState(false);
  const { user, selectedEstado, setSelectedEstado } = useAuth();

  const toggleEstaduais = () => {
    setIsEstaduaisOpen(!isEstaduaisOpen);
  };

  const handleEstadoClick = (estado) => {
    setSelectedEstado(estado);
    if (onEstadoSelect) {
      onEstadoSelect(estado);
    }
    onClose();
  };

  // Usar apenas os estados permitidos para o usuário
  const estadosPermitidos = user?.estados || [];
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="profile-section">
        <div className="profile-image">
          👤
        </div>
        <div className="state-info">
          <div className="state-name">Olá, {user?.full_name || user?.email || 'Usuário'}</div>
          <div className="election-year">ELEIÇÕES 2026</div>
        </div>
      </div>
      
      <nav className="nav-menu">
        <div className="nav-item-container">
          <button className={`nav-item ${isEstaduaisOpen ? 'active' : ''}`} onClick={toggleEstaduais}>
            <span className="icon">👥</span>
            CANDIDATOS DEP. ESTADUAIS
            <span className="chevron">{isEstaduaisOpen ? '▼' : '▶'}</span>
          </button>
          {isEstaduaisOpen && (
            <div className="submenu">
              {estadosPermitidos.length === 0 ? (
                <div className="submenu-item" style={{ cursor: 'default', opacity: 0.7 }}>
                  Nenhum estado disponível
                </div>
              ) : (
                estadosPermitidos.map((estado, index) => (
                  <button
                    key={index}
                    className={`submenu-item ${selectedEstado === estado ? 'active' : ''}`}
                    onClick={() => handleEstadoClick(estado)}
                  >
                    {estado}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <button className="nav-item" onClick={onClose}>
          <span className="icon">👥</span>
          CANDIDATOS DEP. FEDERAIS
        </button>
        
        <button className="nav-item" onClick={onClose}>
          <span className="icon">🏛️</span>
          PODEMOS BRASIL
        </button>
        
        <button className="nav-item" onClick={onClose}>
          <span className="icon">⚙️</span>
          CONFIGURAÇÕES
        </button>
      </nav>
      
      <div className="footer">
        <img src={logoSedip} alt="SEDIP" />
      </div>
    </div>
  );
};

export default Sidebar;


