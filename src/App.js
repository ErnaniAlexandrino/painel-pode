import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricsCards from './components/MetricsCards';
import CandidatesTable from './components/CandidatesTable';
import ProjectionCards from './components/ProjectionCards';
// import LeadersSection from './components/LeadersSection';
import LeadersTableFederal from './components/LeadersTableFederal';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [femaleAffiliatedCount, setFemaleAffiliatedCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [ppiCount, setPpiCount] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app">
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
      
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="main-content">
        <Header />
        <MetricsCards
          femaleAffiliatedCount={femaleAffiliatedCount}
          confirmedCount={confirmedCount}
          negotiationCount={negotiationCount}
          ppiCount={ppiCount}
        />
        <CandidatesTable
          onFemaleAffiliatedCountChange={setFemaleAffiliatedCount}
          onConfirmedCountChange={setConfirmedCount}
          onNegotiationCountChange={setNegotiationCount}
          onPpiCountChange={setPpiCount}
        />
        <div className="bottom-cards">
          {/* <div className="left-card">
            <LeadersSection />
          </div> */}
          <div className="center-card" style={{ gridColumn: 'span 2' }}>
            <LeadersTableFederal />
          </div>
          <div className="right-card">
            <ProjectionCards />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


