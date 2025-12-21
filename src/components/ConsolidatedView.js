import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StateCard from './StateCard';
import { getElectoralData } from '../config/electoralData';
import './ConsolidatedView.css';

const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';

const PPI_RACES = new Set(['preta', 'parda', 'indígena']);

const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;

  // Remove separador de milhar e normaliza decimal
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

const formatNumberOrPlaceholder = (num) => {
  if (num === null || num === undefined) return '000.000';
  const n = Number(num);
  if (!Number.isFinite(n)) return '000.000';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatCurrencyOrPlaceholder = (num) => {
  if (num === null || num === undefined) return 'R$ 0';
  const n = Number(num);
  if (!Number.isFinite(n)) return 'R$ 0';
  return `R$ ${formatNumberOrPlaceholder(n)}`;
};

// Mesmo formato do ProjectionCards.js (2 casas decimais com vírgula)
const formatDecimalOrPlaceholder = (num) => {
  const n = Number(num);
  if (!Number.isFinite(n)) return '0,00';
  return n.toFixed(2).replace('.', ',');
};

const buildStats = (candidates, tipoCargo, estado) => {
  const valid = (Array.isArray(candidates) ? candidates : []).filter(
    (c) => c && c.id !== 'placeholder' && c.id != null
  );

  // Busca os dados eleitorais baseado no tipo de cargo e estado
  const electoralData = getElectoralData(tipoCargo, estado);
  const vagasMulheres = electoralData.vagasMulheres;

  let totalVotoProjMax = 0;
  let totalVotoProjMin = 0;
  let totalFefcHistorico = 0;
  let totalFefcProjetado = 0;
  let femaleAffiliatedCount = 0;
  let ppiCount = 0;

  valid.forEach((c) => {
    totalVotoProjMax += parseNumber(c.voto_proj_max);
    totalVotoProjMin += parseNumber(c.voto_proj_min);
    totalFefcHistorico += parseNumber(c.fefc_historico);
    totalFefcProjetado += parseNumber(c.fefc_projetado);

    const genero = c.genero?.toString().trim().toLowerCase();
    const status = c.status?.toString().trim().toLowerCase();
    if (genero === 'feminino' && status === 'filiado') {
      femaleAffiliatedCount += 1;
    }

    const race = c.raca?.toString().trim().toLowerCase();
    if (race && PPI_RACES.has(race)) ppiCount += 1;
  });

  const totalCandidates = valid.length;
  // Usa vagasMulheres da configuração em vez de constante hardcoded
  const mulheresFaltando = Math.max(vagasMulheres - femaleAffiliatedCount, 0);

  return {
    totalCandidates,
    totalVotoProjMax,
    totalVotoProjMin,
    totalFefcHistorico,
    totalFefcProjetado,
    ppiCount,
    mulheresFaltando,
  };
};

const ConsolidatedView = () => {
  const { user, token, setSelectedEstado } = useAuth();
  const estados = user?.estados || [];

  // Verifica se o usuário é Gestor
  const isGestor = (user?.perfil || '').toString().trim().toLowerCase() === 'gestor';

  // Alterna qual seção aparece primeiro, mantendo ambas visíveis (como na referência)
  const [order, setOrder] = useState('federalFirst'); // federalFirst | estadualFirst
  const [statsByEstadoEstadual, setStatsByEstadoEstadual] = useState({});
  const [statsByEstadoFederal, setStatsByEstadoFederal] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const estadosKey = useMemo(() => estados.join('|'), [estados]);

  useEffect(() => {
    if (!token || estados.length === 0) {
      setStatsByEstadoEstadual({});
      setStatsByEstadoFederal({});
      return;
    }

    let cancelled = false;
    const fetchAll = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Buscar dados de candidatos estaduais
        const resultsEstadual = await Promise.all(
          estados.map(async (estado) => {
            const response = await fetch(
              `${API_V1_BASE_URL}/candidatos?estado=${encodeURIComponent(estado)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) {
              throw new Error(`Erro ao buscar candidatos estaduais para ${estado}`);
            }
            const data = await response.json();
            return [estado, buildStats(data, 'estadual', estado)];
          })
        );

        // Buscar dados de candidatos federais
        const resultsFederal = await Promise.all(
          estados.map(async (estado) => {
            const response = await fetch(
              `${API_V1_BASE_URL}/candidatos-federais?estado=${encodeURIComponent(estado)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) {
              throw new Error(`Erro ao buscar candidatos federais para ${estado}`);
            }
            const data = await response.json();
            return [estado, buildStats(data, 'federal', estado)];
          })
        );

        if (cancelled) return;
        setStatsByEstadoEstadual(Object.fromEntries(resultsEstadual));
        setStatsByEstadoFederal(Object.fromEntries(resultsFederal));
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setHasError(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [token, estadosKey, estados.length]);

  const sections = order === 'federalFirst' ? ['federal', 'estadual'] : ['estadual', 'federal'];

  const buildMetricsForTipo = (tipo, estado) => {
    // Seleciona os stats corretos baseado no tipo de cargo
    const stats = tipo === 'federal' 
      ? statsByEstadoFederal[estado] 
      : statsByEstadoEstadual[estado];

    // Busca os dados eleitorais para obter o quociente eleitoral correto
    const electoralData = getElectoralData(tipo, estado);
    const quocienteEleitoral = electoralData.quocienteEleitoral;

    return [
      {
        key: 'cadeiras',
        label: 'Projeção de Cadeiras',
        value: formatDecimalOrPlaceholder((stats?.totalVotoProjMax ?? 0) / quocienteEleitoral),
      },
      { key: 'percent', label: 'Percentual de Votos da Chapa', value: '000.000' },
      {
        key: 'vmax',
        label: 'Projeção de Votos Máxima',
        value: formatNumberOrPlaceholder(stats?.totalVotoProjMax ?? 0),
      },
      {
        key: 'vmin',
        label: 'Projeção de Votos Mínimo',
        value: formatNumberOrPlaceholder(stats?.totalVotoProjMin ?? 0),
      },
      {
        key: 'fefc_hist',
        label: 'FEFC pelo Histórico',
        value: formatCurrencyOrPlaceholder(stats?.totalFefcHistorico ?? 0),
      },
      {
        key: 'fefc_proj',
        label: 'FEFC Projetado',
        value: formatCurrencyOrPlaceholder(stats?.totalFefcProjetado ?? 0),
      },
      {
        key: 'mulheres',
        label: 'Vagas de Mulheres Faltando',
        value: formatNumberOrPlaceholder(stats?.mulheresFaltando ?? 0),
      },
      {
        key: 'ppi',
        label: 'Candidatos Declarados PPI',
        value: formatNumberOrPlaceholder(stats?.ppiCount ?? 0),
      },
    ];
  };

  return (
    <div className="consolidated">
      {isGestor && (
        <div className="consolidated__tabs">
          <div className="consolidated__tabs-inner">
            <button
              type="button"
              className={`consolidated__tab ${order === 'federalFirst' ? 'consolidated__tab--active' : ''}`}
              onClick={() => setOrder('federalFirst')}
            >
              DEPUTADOS ESTADUAIS
            </button>
            <button
              type="button"
              className={`consolidated__tab ${order === 'estadualFirst' ? 'consolidated__tab--active' : ''}`}
              onClick={() => setOrder('estadualFirst')}
            >
              DEPUTADOS FEDERAIS
            </button>
          </div>
        </div>
      )}

      {hasError && (
        <div className="consolidated__error">
          Não foi possível carregar os dados consolidados. Verifique se o backend está ativo.
        </div>
      )}
      {isLoading && <div className="consolidated__loading">Carregando dados dos estados...</div>}

      {sections.map((tipo) => {
        const variant = tipo === 'federal' ? 'purple' : 'green';
        const subtitle = tipo === 'federal' ? 'DEPUTADOS FEDERAIS' : 'DEPUTADOS ESTADUAIS';

        return (
          <div className="consolidated__section" key={tipo}>
            <div className="consolidated__grid">
              {estados.map((estado) => (
                <StateCard
                  key={`${tipo}-${estado}`}
                  estado={estado}
                  variant={variant}
                  subtitle={subtitle}
                  metrics={buildMetricsForTipo(tipo, estado)}
                  onViewCandidates={() => setSelectedEstado(estado)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConsolidatedView;


