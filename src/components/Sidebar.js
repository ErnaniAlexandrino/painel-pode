import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoSedip from '../assests/imagens/logo_sedip.svg';

const Sidebar = ({ isOpen, onClose, onEstadoSelect, onPodemosBrasilSelect, activeNav }) => {
  const [isEstaduaisOpen, setIsEstaduaisOpen] = useState(false);
  const [isFederaisOpen, setIsFederaisOpen] = useState(false);
  const { user, selectedEstado, setSelectedEstado, setTipoCargo } = useAuth();

  const toggleEstaduais = () => {
    setIsEstaduaisOpen(!isEstaduaisOpen);
    if (!isEstaduaisOpen) {
      setIsFederaisOpen(false);
    }
  };

  const toggleFederais = () => {
    setIsFederaisOpen(!isFederaisOpen);
    if (!isFederaisOpen) {
      setIsEstaduaisOpen(false);
    }
  };

  const handleEstadoClick = (estado, tipoCargoValue) => {
    setSelectedEstado(estado);
    setTipoCargo(tipoCargoValue || 'estadual');
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
                <>
                  <button
                    className={`submenu-item ${selectedEstado == null ? 'active' : ''}`}
                    onClick={() => handleEstadoClick(null, 'estadual')}
                  >
                    VISÃO GERAL
                  </button>
                  {estadosPermitidos.map((estado, index) => (
                    <button
                      key={index}
                      className={`submenu-item ${selectedEstado === estado ? 'active' : ''}`}
                      onClick={() => handleEstadoClick(estado, 'estadual')}
                    >
                      {estado}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="nav-item-container">
          <button className={`nav-item ${isFederaisOpen ? 'active' : ''}`} onClick={toggleFederais}>
            <span className="icon">👥</span>
            CANDIDATOS DEP. FEDERAIS
            <span className="chevron">{isFederaisOpen ? '▼' : '▶'}</span>
          </button>
          {isFederaisOpen && (
            <div className="submenu">
              {estadosPermitidos.length === 0 ? (
                <div className="submenu-item" style={{ cursor: 'default', opacity: 0.7 }}>
                  Nenhum estado disponível
                </div>
              ) : (
                <>
                  <button
                    className={`submenu-item ${selectedEstado == null ? 'active' : ''}`}
                    onClick={() => handleEstadoClick(null, 'federal')}
                  >
                    VISÃO GERAL
                  </button>
                  {estadosPermitidos.map((estado, index) => (
                    <button
                      key={index}
                      className={`submenu-item ${selectedEstado === estado ? 'active' : ''}`}
                      onClick={() => handleEstadoClick(estado, 'federal')}
                    >
                      {estado}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        
        <button
          className={`nav-item ${activeNav === 'podemos' ? 'active' : ''}`}
          onClick={() => {
            setSelectedEstado(null);
            if (onPodemosBrasilSelect) {
              onPodemosBrasilSelect();
            }
            onClose();
          }}
        >
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


