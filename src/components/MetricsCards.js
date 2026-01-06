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
    { party: 'PL', votes: '5.343.667', seats: '17', fefc: 'R$ 31.906.618,92' },
    { party: 'PT', votes: '2.941.086', seats: '11', fefc: 'R$ 43.914.150,98' },
    { party: 'PSOL', votes: '1.984.281', seats: '5', fefc: 'R$ 15.238.933,74' },
    { party: 'UNIÃO', votes: '1.811.462', seats: '6', fefc: 'R$ 69.313.058,63' },
    { party: 'REPUBLICANO', votes: '1.580.891', seats: '5', fefc: 'R$ 31.592.353,94' },
    // { party: 'MDB', votes: '1.533.541', seats: '5', fefc: 'R$ 26.549.529,06' },
    // { party: 'PP', votes: '1.174.646', seats: '4', fefc: 'R$ 16.134.627,17' },
    // { party: 'PSDB', votes: '1.061.538', seats: '3', fefc: 'R$ 29.889.206,01' },
    // { party: 'PSD', votes: '1.055.965', seats: '3', fefc: 'R$ 18.786.764,71' },
    { party: 'PODEMOS', votes: '892.443', seats: '3', fefc: 'R$ 23.056.233,86' }
    // { party: 'PSB', votes: '732.045', seats: '2', fefc: 'R$ 15.438.413,29' },
    // { party: 'CIDADANIA', votes: '438.574', seats: '2', fefc: 'R$ 10.281.341,82' },
    // { party: 'SOLIDARIEDADE', votes: '379.310', seats: '1', fefc: 'R$ 14.882.189,41' },
    // { party: 'NOVO', votes: '361.268', seats: '1', fefc: 'R$ -' },
    // { party: 'REDE', votes: '304.580', seats: '1', fefc: 'R$ 4.923.826,87' },
    // { party: 'PSC', votes: '293.192', seats: '1', fefc: 'R$ 3.645.008,56' }
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


