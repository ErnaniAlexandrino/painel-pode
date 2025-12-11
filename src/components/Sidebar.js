import React, { useState } from 'react';
import logoSedip from '../assests/imagens/logo_sedip.svg';

const Sidebar = ({ isOpen, onClose }) => {
  const [isEstaduaisOpen, setIsEstaduaisOpen] = useState(false);

  const toggleEstaduais = () => {
    setIsEstaduaisOpen(!isEstaduaisOpen);
  };

  const estadosBrasileiros = [
    'ACRE', 'ALAGOAS', 'AMAPÁ', 'AMAZONAS', 'BAHIA', 'CEARÁ',
    'DISTRITO FEDERAL', 'ESPÍRITO SANTO', 'GOIÁS', 'MARANHÃO',
    'MATO GROSSO', 'MATO GROSSO DO SUL', 'MINAS GERAIS', 'PARÁ',
    'PARAÍBA', 'PARANÁ', 'PERNAMBUCO', 'PIAUÍ', 'RIO DE JANEIRO',
    'RIO GRANDE DO NORTE', 'RIO GRANDE DO SUL', 'RONDÔNIA',
    'RORAIMA', 'SANTA CATARINA', 'SÃO PAULO', 'SERGIPE', 'TOCANTINS'
  ];
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="profile-section">
        <div className="profile-image">
          👤
        </div>
        <div className="state-info">
          <div className="state-name">Olá, {'< Nome do Gestor>'}</div>
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
              {estadosBrasileiros.map((estado, index) => (
                <button key={index} className="submenu-item" onClick={onClose}>
                  {estado}
                </button>
              ))}
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


