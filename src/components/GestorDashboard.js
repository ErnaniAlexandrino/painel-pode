import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MetricsCards from './MetricsCards';
import CandidatesTable from './CandidatesTable';
import ProjectionCards from './ProjectionCards';
import LeadersTableFederal from './LeadersTableFederal';
import GestorPodemosBrasilView from './GestorPodemosBrasilView';

const GestorDashboard = () => {
  const { selectedEstado, setSelectedEstado, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [femaleAffiliatedCount, setFemaleAffiliatedCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [ppiCount, setPpiCount] = useState(0);
  const [totalVotoProjMax, setTotalVotoProjMax] = useState(0);
  const [totalVotoProjMin, setTotalVotoProjMin] = useState(0);
  const [totalHistoricoVotos, setTotalHistoricoVotos] = useState(0);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  const handleEstadoSelect = (estado) => {
    setSelectedEstado(estado ?? null);
  };

  const handlePodemosBrasilSelect = () => {
    setSelectedEstado(null);
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

        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onEstadoSelect={handleEstadoSelect}
          onPodemosBrasilSelect={handlePodemosBrasilSelect}
          activeNav={selectedEstado == null ? 'podemos' : undefined}
        />

        <div className="main-content">
          {selectedEstado == null ? (
            <GestorPodemosBrasilView
              estados={user?.estados || []}
              onSelectEstado={(estado) => setSelectedEstado(estado)}
            />
          ) : (
            <>
              <MetricsCards
                femaleAffiliatedCount={femaleAffiliatedCount}
                confirmedCount={confirmedCount}
                negotiationCount={negotiationCount}
                ppiCount={ppiCount}
              />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestorDashboard;


