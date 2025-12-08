import React from 'react';

// Função auxiliar para formatar números com separador de milhar
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const QUOCIENTE_ELETORAL = 352120;

const ProjectionCards = ({
  totalVotoProjMax = 0,
  totalVotoProjMin = 0,
  totalHistoricoVotos = 0,
}) => {
  const projecaoMaximaCadeiras = Math.floor(totalVotoProjMax / QUOCIENTE_ELETORAL);
  const projecaoMinimaCadeiras = Math.floor(totalVotoProjMin / QUOCIENTE_ELETORAL);
  // Soma dos históricos multiplicada pelo quociente eleitoral (conforme solicitado)
  const projecaoHistorico = totalHistoricoVotos * QUOCIENTE_ELETORAL;
  return (
    <div className="projection-cards">
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÁXIMA DE CADEIRAS</div>
        <div className="projection-value">{String(projecaoMaximaCadeiras).padStart(2, '0')}</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÍNIMA DE CADEIRAS</div>
        <div className="projection-value">{String(projecaoMinimaCadeiras).padStart(2, '0')}</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">SOMA DE VOTOS - PELO HISTÓRICO</div>
        <div className="projection-value">{formatNumber(projecaoHistorico)}</div>
        <div className="projection-subtitle">Soma do histórico x Quociente Eleitoral</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO DE VOTOS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>MÁX: {formatNumber(totalVotoProjMax)}</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>MÍN: {formatNumber(totalVotoProjMin)}</div>
          </div>
        </div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO DE VOTOS - HISTÓRICO</div>
        <div className="projection-value">{formatNumber(projecaoHistorico)}</div>
        <div className="projection-subtitle">Histórico de Votos / Quociente Eleitoral</div>
      </div>
    </div>
  );
};

export default ProjectionCards;


