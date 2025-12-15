import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MetricsCards from './MetricsCards';
import CandidatesTable from './CandidatesTable';
import ProjectionCards from './ProjectionCards';
import LeadersTableFederal from './LeadersTableFederal';

const Dashboard = () => {
  const { selectedEstado, setSelectedEstado, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [femaleAffiliatedCount, setFemaleAffiliatedCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [ppiCount, setPpiCount] = useState(0);
  const [totalVotoProjMax, setTotalVotoProjMax] = useState(0);
  const [totalVotoProjMin, setTotalVotoProjMin] = useState(0);
  const [totalHistoricoVotos, setTotalHistoricoVotos] = useState(0);

  // Garantir que há um estado selecionado quando o usuário logar
  useEffect(() => {
    if (user && user.estados && user.estados.length > 0 && !selectedEstado) {
      setSelectedEstado(user.estados[0]);
    }
  }, [user, selectedEstado, setSelectedEstado]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleEstadoSelect = (estado) => {
    setSelectedEstado(estado);
  };

  return (
    <div className="app">
      <Header />
      <div className="app-content-wrapper">
        <button
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div
          className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={closeSidebar}
        ></div>

        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onEstadoSelect={handleEstadoSelect} />

        <div className="main-content">
          <MetricsCards
            femaleAffiliatedCount={femaleAffiliatedCount}
            confirmedCount={confirmedCount}
            negotiationCount={negotiationCount}
            ppiCount={ppiCount}
          />
          {selectedEstado ? (
            <CandidatesTable
              estado={selectedEstado}
              onFemaleAffiliatedCountChange={setFemaleAffiliatedCount}
              onConfirmedCountChange={setConfirmedCount}
              onNegotiationCountChange={setNegotiationCount}
              onPpiCountChange={setPpiCount}
              onVotoProjMaxChange={setTotalVotoProjMax}
              onVotoProjMinChange={setTotalVotoProjMin}
              onHistoricoVotosChange={setTotalHistoricoVotos}
            />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Selecione um estado no menu lateral para começar.</p>
            </div>
          )}
          <div className="bottom-cards">
            <div className="center-card" style={{ gridColumn: 'span 2' }}>
              <LeadersTableFederal />
            </div>
            <div className="right-card">
              <ProjectionCards
                totalVotoProjMax={totalVotoProjMax}
                totalVotoProjMin={totalVotoProjMin}
                totalHistoricoVotos={totalHistoricoVotos}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

