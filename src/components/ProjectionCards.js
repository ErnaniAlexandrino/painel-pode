import React from 'react';
import { getElectoralData } from '../config/electoralData';

// Função auxiliar para formatar números com separador de milhar
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Função para formatar número com 2 casas decimais (padrão brasileiro)
const formatDecimal = (num) => {
  if (num === null || num === undefined) return '0,00';
  return num.toFixed(2).replace('.', ',');
};

const ProjectionCards = ({
  totalVotoProjMax = 0,
  totalVotoProjMin = 0,
  totalHistoricoVotos = 0,
  tipoCargo = 'estadual',
  estado = null,
}) => {
  // Busca o quociente eleitoral baseado no tipo de cargo e estado
  const electoralData = getElectoralData(tipoCargo, estado);
  const quocienteEleitoral = electoralData.quocienteEleitoral;
  
  const projecaoMaximaCadeiras = totalVotoProjMax / quocienteEleitoral;
  const projecaoMinimaCadeiras = totalVotoProjMin / quocienteEleitoral;
  // Soma dos históricos multiplicada pelo quociente eleitoral (conforme solicitado)
  const projecaoHistorico = totalHistoricoVotos / quocienteEleitoral;
  return (
    <div className="projection-cards">
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÁXIMA DE CADEIRAS</div>
        <div className="projection-value">{formatDecimal(projecaoMaximaCadeiras)}</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO MÍNIMA DE CADEIRAS</div>
        <div className="projection-value">{formatDecimal(projecaoMinimaCadeiras)}</div>
      </div>
      
      <div className="projection-card">
        <div className="card-header green">PROJEÇÃO DE CADEIRAS - PELO HISTÓRICO</div>
        <div className="projection-value">{formatDecimal(projecaoHistorico)}</div>
        <div className="projection-subtitle">Soma do histórico Votação % Quociente Eleitoral</div>
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
        <div className="projection-value">{formatNumber(totalHistoricoVotos)}</div>
        <div className="projection-subtitle">Soma a coluna Hist. Votação</div>
      </div>
    </div>
  );
};

export default ProjectionCards;


