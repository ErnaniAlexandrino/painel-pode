import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StateCard from './StateCard';
import './ConsolidatedView.css';

const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';
const QUOCIENTE_ELETORAL = 352120;
const FEMALE_QUOTA = 21;

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

const buildEstadualStats = (candidates) => {
  const valid = (Array.isArray(candidates) ? candidates : []).filter(
    (c) => c && c.id !== 'placeholder' && c.id != null
  );

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
  // Mesma regra usada em MetricsCards.js
  const mulheresFaltando = Math.max(FEMALE_QUOTA - femaleAffiliatedCount, 0);

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

  // Alterna qual seção aparece primeiro, mantendo ambas visíveis (como na referência)
  const [order, setOrder] = useState('federalFirst'); // federalFirst | estadualFirst
  const [statsByEstado, setStatsByEstado] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const estadosKey = useMemo(() => estados.join('|'), [estados]);

  useEffect(() => {
    if (!token || estados.length === 0) {
      setStatsByEstado({});
      return;
    }

    let cancelled = false;
    const fetchAll = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const results = await Promise.all(
          estados.map(async (estado) => {
            const response = await fetch(
              `${API_V1_BASE_URL}/candidatos?estado=${encodeURIComponent(estado)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) {
              throw new Error(`Erro ao buscar candidatos para ${estado}`);
            }
            const data = await response.json();
            return [estado, buildEstadualStats(data)];
          })
        );

        if (cancelled) return;
        setStatsByEstado(Object.fromEntries(results));
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
    const stats = statsByEstado[estado];

    // Federais: layout pronto; dados por estado ainda não existem na API atual
    const isFederal = tipo === 'federal';

    return [
      {
        key: 'cadeiras',
        label: 'Projeção de Cadeiras',
        value: isFederal
          ? '0,00'
          : formatDecimalOrPlaceholder((stats?.totalVotoProjMax ?? 0) / QUOCIENTE_ELETORAL),
      },
      { key: 'percent', label: 'Percentual de Votos da Chapa', value: '000.000' },
      {
        key: 'vmax',
        label: 'Projeção de Votos Máxima',
        value: isFederal ? '000.000' : formatNumberOrPlaceholder(stats?.totalVotoProjMax ?? 0),
      },
      {
        key: 'vmin',
        label: 'Projeção de Votos Mínimo',
        value: isFederal ? '000.000' : formatNumberOrPlaceholder(stats?.totalVotoProjMin ?? 0),
      },
      {
        key: 'fefc_hist',
        label: 'FEFC pelo Histórico',
        value: isFederal ? 'R$ 0' : formatCurrencyOrPlaceholder(stats?.totalFefcHistorico ?? 0),
      },
      {
        key: 'fefc_proj',
        label: 'FEFC Projetado',
        value: isFederal ? 'R$ 0' : formatCurrencyOrPlaceholder(stats?.totalFefcProjetado ?? 0),
      },
      {
        key: 'mulheres',
        label: 'Vagas de Mulheres Faltando',
        value: isFederal ? '000.000' : formatNumberOrPlaceholder(stats?.mulheresFaltando ?? 0),
      },
      {
        key: 'ppi',
        label: 'Candidatos Declarados PPI',
        value: isFederal ? '000.000' : formatNumberOrPlaceholder(stats?.ppiCount ?? 0),
      },
    ];
  };

  return (
    <div className="consolidated">
      <div className="consolidated__tabs">
        <div className="consolidated__tabs-inner">
          <button
            type="button"
            className={`consolidated__tab ${order === 'federalFirst' ? 'consolidated__tab--active' : ''}`}
            onClick={() => setOrder('federalFirst')}
          >
            DEPUTADOS FEDERAIS
          </button>
          <button
            type="button"
            className={`consolidated__tab ${order === 'estadualFirst' ? 'consolidated__tab--active' : ''}`}
            onClick={() => setOrder('estadualFirst')}
          >
            DEPUTADOS ESTADUAIS
          </button>
        </div>
      </div>

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


