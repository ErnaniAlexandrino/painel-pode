import React from 'react';
import { getElectoralData, formatQuociente } from '../config/electoralData';

const MetricsCards = ({
  femaleAffiliatedCount = 0,
  confirmedCount = 0,
  negotiationCount = 0,
  ppiCount = 0,
  tipoCargo = 'estadual',
  estado = null,
}) => {
  // Busca os dados eleitorais baseado no tipo de cargo e estado
  const electoralData = getElectoralData(tipoCargo, estado);
  
  const quocienteEleitoral = electoralData.quocienteEleitoral;
  const clausulaBarreira = electoralData.clausulaBarreira;
  const vagasTotais = electoralData.vagasTotais;
  const vagasMulheres = electoralData.vagasMulheres;
  
  const missingWomen = Math.max(vagasMulheres - femaleAffiliatedCount, 0);
  
  // Calcula os percentuais do quociente eleitoral
  const dezPorcentoQE = Math.floor(quocienteEleitoral * 0.1);
  const vintePorcentoQE = Math.floor(quocienteEleitoral * 0.2);
  const oitentaPorcentoQE = Math.floor(quocienteEleitoral * 0.8);
  
  // Determina o label do tipo de cargo
  const tipoCargoLabel = tipoCargo === 'federal' ? 'Federal' : 'Estadual';
  
  const voting2022Data = [
    { label: `Quociente Eleitoral para Dept. ${tipoCargoLabel}`, value: formatQuociente(quocienteEleitoral) }, 
    { label: '10% do Q.E.', value: formatQuociente(dezPorcentoQE) },
    { label: '20% do Q.E.', value: formatQuociente(vintePorcentoQE) }, 
    { label: '80% do Q.E.', value: formatQuociente(oitentaPorcentoQE) },
    { label: 'Cláusula de Barreira', value: formatQuociente(clausulaBarreira) }
  ];

  const winningSlatesData = [
    { party: 'Progressistas', votes: '8.692.918', seats: '47', fefc: 'R$ 344.757.042,30' },
    { party: 'União Brasil', votes: '10.215.433', seats: '59', fefc: 'R$ 782.463.805,10' },
    { party: 'Republicanos', votes: '6.977.525', seats: '40', fefc: 'R$ 242.164.884,93' },
    { party: 'PT', votes: '13.236.634', seats: '68', fefc: 'R$ 499.584.091,73' },
    { party: 'PL', votes: '18.220.301', seats: '19', fefc: 'R$ 288.517.369,67' },
    { party: 'PSDB', votes: '3.309.061', seats: '13', fefc: 'R$ 320.003.589,74' }
  ];

  const electoralCompositionData = [
    { label: 'Vagas Totais', value: String(vagasTotais) },
    { label: 'Vagas para Mulheres', value: String(vagasMulheres) },
    { label: 'Candidatos Confirmados', value: String(confirmedCount) },
    { label: 'Candidatos em Negociação', value: String(negotiationCount) },
    {
      label: 'Mulheres Faltantes (Cota de Gênero)',
      value: String(missingWomen),
      highlight: true,
    },
    { label: 'Candidatos Declarados PPI', value: String(ppiCount) }
  ];

  return (
    <div className="cards-grid">
      {/* Votação em 2022 */}
      <div className="card purple">
        <div className="card-header purple">VOTAÇÃO EM 2026</div>
        <div className="card-content">
          {voting2022Data.map((item, index) => (
            <div key={index} className="metric-item">
              <span className="metric-label">{item.label}</span>
              <span className="metric-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chapas Vencedoras em 2022 */}
      <div className="card green">
        <div className="card-header green">CHAPAS VENCEDORAS EM 2022</div>
        <div className="card-content">
          <table style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px' }}>Partido</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>Votos</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>Cadeiras</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>FEFC</th>
              </tr>
            </thead>
            <tbody>
              {winningSlatesData.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '4px' }}>{item.party}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{item.votes}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{item.seats}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{item.fefc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Composição Eleitoral 2026 */}
      <div className="card purple">
        <div className="card-header purple">COMPOSIÇÃO ELEITORAL 2026</div>
        <div className="card-content">
          {electoralCompositionData.map((item, index) => (
            <div key={index} className="metric-item">
              <span 
                className="metric-label" 
                style={item.highlight ? { color: '#dc2626', fontWeight: 'bold' } : {}}
              >
                {item.label}
              </span>
              <span className="metric-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;


