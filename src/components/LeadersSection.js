import React, { useEffect, useState, useMemo } from 'react';

const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatCurrency = (num) => {
  if (num === null || num === undefined) return '-';
  return `R$ ${formatNumber(num)}`;
};

const LeadersSection = () => {
  const [leadersData, setLeadersData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    party: '',
    genero: '',
    situacao: '',
  });

  // Extrai valores únicos de uma coluna para popular os dropdowns
  const getUniqueValues = (column) => {
    const values = originalData.map((item) => item[column]);
    return [...new Set(values)].filter((v) => v && v !== '-').sort();
  };

  // Verifica se há algum filtro ativo
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== '');
  }, [filters]);

  // Aplica os filtros aos dados
  const applyFilters = () => {
    let filtered = [...originalData];

    if (filters.party) {
      filtered = filtered.filter((item) => item.party === filters.party);
    }
    if (filters.genero) {
      filtered = filtered.filter((item) => item.genero === filters.genero);
    }
    if (filters.situacao) {
      filtered = filtered.filter((item) => item.situacao === filters.situacao);
    }

    setLeadersData(filtered);
  };

  // Limpa todos os filtros
  const clearFilters = () => {
    setFilters({
      party: '',
      genero: '',
      situacao: '',
    });
  };

  // Atualiza um filtro específico
  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Aplica filtros quando os filtros mudam
  useEffect(() => {
    if (originalData.length > 0) {
      applyFilters();
    }
  }, [filters, originalData]);

  const fetchEstaduaisNaoEleitos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_V1_BASE_URL}/estaduais-nao-eleitos-sp?limit=100`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const data = await response.json();

      const mappedData = data.map((item) => ({
        name: item.candidato || '-',
        party: item.partido || '-',
        votes: formatNumber(item.historico_de_votos),
        fefc: formatCurrency(item.historico_de_fefc),
        genero: item.genero || '-',
        situacao: item.situacao || '-',
      }));

      setOriginalData(mappedData);
      setLeadersData(mappedData);
    } catch (err) {
      console.error('Erro ao buscar estaduais não eleitos:', err);
      setError('Erro ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstaduaisNaoEleitos();
  }, []);

  return (
    <div className="leaders-table">
      <div className="card-header purple">
        <span>TOP LÍDERES NÃO ELEITOS - DEP. ESTADUAL 2022</span>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Limpar Filtros
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Partido</th>
              <th>Votos</th>
              <th>FEFC</th>
              <th>Gênero</th>
              <th>Situação</th>
            </tr>
            <tr className="filter-row">
              <th></th>
              <th>
                <select
                  className="filter-select"
                  value={filters.party}
                  onChange={(e) => handleFilterChange('party', e.target.value)}
                >
                  <option value="">Todos</option>
                  {getUniqueValues('party').map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th></th>
              <th></th>
              <th>
                <select
                  className="filter-select"
                  value={filters.genero}
                  onChange={(e) => handleFilterChange('genero', e.target.value)}
                >
                  <option value="">Todos</option>
                  {getUniqueValues('genero').map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <select
                  className="filter-select"
                  value={filters.situacao}
                  onChange={(e) => handleFilterChange('situacao', e.target.value)}
                >
                  <option value="">Todos</option>
                  {getUniqueValues('situacao').map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {leadersData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  Nenhum dado disponível
                </td>
              </tr>
            ) : (
              leadersData.map((leader, index) => (
                <tr key={index}>
                  <td>{leader.name}</td>
                  <td>{leader.party}</td>
                  <td>{leader.votes}</td>
                  <td>{leader.fefc}</td>
                  <td>{leader.genero || '-'}</td>
                  <td>{leader.situacao || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeadersSection;


