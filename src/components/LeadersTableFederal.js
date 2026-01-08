import React, { useEffect, useState, useMemo, useCallback } from 'react';

const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';

// Função auxiliar para formatar números com separador de milhar
const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Função auxiliar para formatar FEFC como moeda
const formatCurrency = (num) => {
  if (num === null || num === undefined) return '-';
  return `R$ ${formatNumber(Math.round(num))}`;
};

const LeadersTableFederal = () => {
  const [leadersData, setLeadersData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    ano: [],
    cargo: [],
    partido: [],
    genero: [],
    raca: [],
    resultado_agregado: [],
  });
  const [filters, setFilters] = useState({
    party: '',
    genero: '',
    raca: '',
    ano: '',
    cargo: '',
    resultado_agregado: '',
  });

  // Usa as opções de filtro do backend
  const getFilterOptions = (column) => {
    // Mapeia os nomes das colunas do frontend para os nomes do backend
    const columnMap = {
      'party': 'partido',
      'genero': 'genero',
      'raca': 'raca',
      'ano': 'ano',
      'cargo': 'cargo',
      'resultado_agregado': 'resultado_agregado',
    };
    
    const backendColumn = columnMap[column] || column;
    return filterOptions[backendColumn] || [];
  };

  // Verifica se há algum filtro ativo
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value !== '');
  }, [filters]);

  // Busca dados do backend com os filtros aplicados
  const fetchDataWithFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('limit', '500');
      
      if (filters.party) {
        params.append('partido', filters.party);
      }
      if (filters.genero) {
        params.append('genero', filters.genero);
      }
      if (filters.ano) {
        params.append('ano', filters.ano);
      }
      if (filters.resultado_agregado) {
        params.append('resultado_agregado', filters.resultado_agregado);
      }
      if (filters.cargo) {
        params.append('cargo', filters.cargo);
      }
      if (filters.raca) {
        params.append('raca', filters.raca);
      }
      
      const response = await fetch(`${API_V1_BASE_URL}/candidatos-sp-22-24?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mapear dados da API para formato da tabela
      const mappedData = data.map((item) => ({
        nome_completo: item.nome || '-',
        nome_urna: item.nome_urna || item.nome || '-',
        party: item.partido || '-',
        votes: formatNumber(item.votos),
        fefc: formatCurrency(item.fundo_total),
        cargo: item.cargo || '-',
        genero: item.genero || '-',
        raca: item.raca || '-',
        ano: item.ano ? item.ano.toString() : '-',
        resultado_agregado: item.resultado_agregado || '-',
      }));
      
      setOriginalData(mappedData);
      setLeadersData(mappedData);
    } catch (err) {
      console.error('Erro ao buscar candidatos SP:', err);
      setError('Erro ao carregar dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Limpa todos os filtros
  const clearFilters = () => {
    setFilters({
      party: '',
      genero: '',
      raca: '',
      ano: '',
      cargo: '',
      resultado_agregado: '',
    });
  };

  // Atualiza um filtro específico
  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Busca dados quando os filtros mudam
  useEffect(() => {
    fetchDataWithFilters();
  }, [fetchDataWithFilters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${API_V1_BASE_URL}/candidatos-sp-22-24/filter-options`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar opções de filtro: ${response.status}`);
      }
      
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Erro ao buscar opções de filtro:', err);
      // Não interrompe o carregamento se falhar, apenas loga o erro
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  return (
    <div className="leaders-table">
      <div className="card-header purple">
        <span>CANDIDATOS SP - 2020 / 2022 / 2024</span>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Limpar Filtros
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Carregando...
        </div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          {error}
        </div>
      ) : (
        <div className="leaders-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>Nome Urna</th>
                <th>Partido</th>
                <th>Votos</th>
                <th>Fundo Total</th>
                <th>Cargo</th>
                <th>Gênero</th>
                <th>Raça</th>
                <th>Ano</th>
                <th>Resultado</th>
              </tr>
              <tr className="filter-row">
                <th></th>
                <th></th>
                <th>
                  <select
                    className="filter-select"
                    value={filters.party}
                    onChange={(e) => handleFilterChange('party', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('party').map((value) => (
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
                    value={filters.cargo}
                    onChange={(e) => handleFilterChange('cargo', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('cargo').map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  <select
                    className="filter-select"
                    value={filters.genero}
                    onChange={(e) => handleFilterChange('genero', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('genero').map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  <select
                    className="filter-select"
                    value={filters.raca}
                    onChange={(e) => handleFilterChange('raca', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('raca').map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  <select
                    className="filter-select"
                    value={filters.ano}
                    onChange={(e) => handleFilterChange('ano', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('ano').map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </th>
                <th>
                  <select
                    className="filter-select"
                    value={filters.resultado_agregado}
                    onChange={(e) => handleFilterChange('resultado_agregado', e.target.value)}
                  >
                    <option value="">Todos</option>
                    {getFilterOptions('resultado_agregado').map((value) => (
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
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                leadersData.map((leader, index) => (
                  <tr key={index}>
                    <td>{leader.nome_completo}</td>
                    <td>{leader.nome_urna}</td>
                    <td>{leader.party}</td>
                    <td>{leader.votes}</td>
                    <td>{leader.fefc}</td>
                    <td>{leader.cargo}</td>
                    <td>{leader.genero}</td>
                    <td>{leader.raca}</td>
                    <td>{leader.ano}</td>
                    <td>{leader.resultado_agregado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadersTableFederal;

