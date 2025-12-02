import React from 'react';

const ProjectionCards = () => {
  return (
    <div className="projection-cards">
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÁXIMA DE CADEIRAS</div>
        <div className="projection-value">05</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÍNIMA DE CADEIRAS</div>
        <div className="projection-value">01</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">SOMA DE VOTOS - PELO HISTÓRICO</div>
        <div className="projection-value">1.234.560</div>
        <div className="projection-subtitle">Equivalente a X% do Quociente Eleitoral</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO DE VOTOS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>MÁX: 1.265.365</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>MÍN: 1.125.002</div>
          </div>
        </div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO DE VOTOS - HISTÓRICO</div>
        <div className="projection-value">1.234.560</div>
        <div className="projection-subtitle">Histórico de Votos / Quociente Eleitoral</div>
      </div>
    </div>
  );
};

export default ProjectionCards;


