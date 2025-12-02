import React from 'react';

const FEMALE_QUOTA = 21;

const MetricsCards = ({
  femaleAffiliatedCount = 0,
  confirmedCount = 0,
  negotiationCount = 0,
  ppiCount = 0,
}) => {
  const missingWomen = Math.max(FEMALE_QUOTA - femaleAffiliatedCount, 0);
  const voting2022Data = [
    { label: 'Quociente Eleitoral para Dept. Federal', value: '352.119,96' }, 
    { label: '10% do Q.E.', value: '35.211,99' },
    { label: '20% do Q.E.', value: '70.423,99' }, 
    { label: '80% do Q.E.', value: '281.695,96' },
    { label: 'Cláusula de Barreira', value: '000.000' }
  ];

  const winningSlatesData = [
    { party: 'Progressistas', votes: '000.000', seats: '3', fefc: 'R$ 1.203.000' },
    { party: 'União Brasil', votes: '000.000', seats: '2', fefc: 'R$ 800.000' },
    { party: 'Republicanos', votes: '000.000', seats: '2', fefc: 'R$ 750.000' },
    { party: 'PT', votes: '000.000', seats: '1', fefc: 'R$ 600.000' },
    { party: 'PL', votes: '000.000', seats: '1', fefc: 'R$ 550.000' },
    { party: 'PSDB', votes: '000.000', seats: '1', fefc: 'R$ 500.000' }
  ];

  const electoralCompositionData = [
    { label: 'Vagas Totais', value: '71' },
    { label: 'Vagas para Mulheres', value: String(FEMALE_QUOTA) },
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


