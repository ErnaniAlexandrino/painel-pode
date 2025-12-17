import React, { useMemo } from 'react';
import './GestorDashboard.css';

const DEFAULT_ESTADOS = [
  'ACRE',
  'ALAGOAS',
  'AMAPÁ',
  'AMAZONAS',
  'BAHIA',
  'CEARÁ',
  'DISTRITO FEDERAL',
  'ESPÍRITO SANTO',
  'GOIÁS',
  'MARANHÃO',
  'MATO GROSSO',
  'MATO GROSSO DO SUL',
  'MINAS GERAIS',
  'PARÁ',
  'PARAÍBA',
  'PARANÁ',
  'PERNAMBUCO',
  'PIAUÍ',
  'RIO DE JANEIRO',
  'RIO GRANDE DO NORTE',
  'RIO GRANDE DO SUL',
  'RONDÔNIA',
  'RORAIMA',
  'SANTA CATARINA',
  'SÃO PAULO',
];

const GestorPodemosBrasilView = ({ estados = [], onSelectEstado }) => {
  const rows = useMemo(() => {
    const list = estados.length ? estados : DEFAULT_ESTADOS;
    return list.map((uf) => ({
      estado: uf,
      cadeiras: '00',
      votos2022: '350.000',
      projCoordenador: '550.000',
      fefcMulheres: 'R$ 1.250.365,00',
      fefcPpi: 'R$ 1.250.365,00',
      fefcDotacao: 'R$ 1.250.365,00',
      fefcSolicitado: 'R$ 1.250.365,00',
      fefcSaldo: '-R$ 1.250.365,00',
      saldoNegativo: true,
    }));
  }, [estados]);

  return (
    <div className="gestor">
      <div className="gestor-top">
        <div className="gestor-card gestor-card--wide">
          <div className="gestor-card__header gestor-card__header--purple">
            FEFC SOLICITADO - TODOS OS ESTADOS
          </div>
          <div className="gestor-card__body">
            <div className="gestor-kv">
              <div className="gestor-kv__row">
                <span className="gestor-kv__label">FEFC DOTAÇÃO</span>
                <span className="gestor-kv__value">R$ 12.534.600.000,00</span>
              </div>
              <div className="gestor-kv__row">
                <span className="gestor-kv__label">FEFC SOLICITADO</span>
                <span className="gestor-kv__value">R$ 18.743.123.065,00</span>
              </div>
              <div className="gestor-kv__row">
                <span className="gestor-kv__label">SALDO</span>
                <span className="gestor-kv__value gestor-kv__value--neg">-R$ 6.208.463.065,00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gestor-card">
          <div className="gestor-card__header gestor-card__header--purple">MÁXIMO DE CADEIRAS</div>
          <div className="gestor-card__big">24</div>
        </div>

        <div className="gestor-card">
          <div className="gestor-card__header gestor-card__header--purple">MÍNIMO DE CADEIRAS</div>
          <div className="gestor-card__big">06</div>
        </div>

        <div className="gestor-card">
          <div className="gestor-card__header gestor-card__header--purple">
            CADEIRAS PELO HISTÓRICO DE VOTOS
          </div>
          <div className="gestor-card__big">11</div>
        </div>
      </div>

      <div className="gestor-table">
        <div className="gestor-table__header">
          <div>ESTADO</div>
          <div>CADEIRAS</div>
          <div>VOTOS TOTAIS EM 2022</div>
          <div>PROJEÇÃO DO COORDENADOR</div>
          <div>FEFC MULHERES</div>
          <div>FEFC PPI</div>
          <div>FEFC DOTAÇÃO</div>
          <div>FEFC SOLICITADO</div>
          <div>FEFC SALDO</div>
          <div />
        </div>

        <div className="gestor-table__body">
          {rows.map((row) => (
            <div className="gestor-table__row" key={row.estado}>
              <div className="gestor-td gestor-td--estado">{row.estado}</div>
              <div className="gestor-td">{row.cadeiras}</div>
              <div className="gestor-td">{row.votos2022}</div>
              <div className="gestor-td">{row.projCoordenador}</div>
              <div className="gestor-td">{row.fefcMulheres}</div>
              <div className="gestor-td gestor-td--link">{row.fefcPpi}</div>
              <div className="gestor-td">{row.fefcDotacao}</div>
              <div className="gestor-td">{row.fefcSolicitado}</div>
              <div className={`gestor-td ${row.saldoNegativo ? 'gestor-td--neg' : ''}`}>
                {row.fefcSaldo}
              </div>
              <div className="gestor-td gestor-td--action">
                <button
                  type="button"
                  className="gestor-btn"
                  onClick={() => onSelectEstado?.(row.estado)}
                >
                  VISUALIZAR CANDIDATOS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GestorPodemosBrasilView;


