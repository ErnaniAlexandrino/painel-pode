import React, { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';
const AUTOCOMPLETE_MIN_CHARS = 2;
const AUTOCOMPLETE_LIMIT = 10;

const RACE_OPTIONS = ['Preta', 'Parda', 'Branca', 'Indígena', 'Amarela'];
const stripAccents = (value) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeRace = (race) => {
  if (!race) {
    return '';
  }

  const normalized = stripAccents(race.toString().trim().toLowerCase());
  const matched = RACE_OPTIONS.find((option) => {
    const optionNormalized = stripAccents(option.toLowerCase());
    return optionNormalized === normalized;
  });

  return matched ?? '';
};

const createEmptyCandidate = () => ({
  vaga: '',
  nome_urna: '',
  voto_proj_max: '',
  voto_proj_min: '',
  historico_votos: '',
  cargo_disputado: '',
  ano: '',
  fefc_projetado: '',
  fefc_historico: '',
  reduto: '',
  partido: '',
  genero: '',
  raca: '',
  status: 'Filiado',
  has_info: false,
  posicao_candidato: '',
});

const mapSuggestionToCandidate = (suggestion) => {
  if (!suggestion?.raw) {
    return createEmptyCandidate();
  }

  const data = suggestion.raw;

  return {
    ...createEmptyCandidate(),
    nome_urna: data.candidato ?? suggestion.nome ?? '',
    historico_votos:
      data.historico_de_votos !== null && data.historico_de_votos !== undefined
        ? String(data.historico_de_votos)
        : '',
    cargo_disputado: data.cargo ?? suggestion.cargo ?? '',
    ano: data.ano !== null && data.ano !== undefined ? String(data.ano) : '',
    fefc_historico:
      data.historico_de_fefc !== null && data.historico_de_fefc !== undefined
        ? String(data.historico_de_fefc)
        : '',
    partido: data.partido ?? suggestion.partido ?? '',
    genero: data.genero ?? '',
    raca: normalizeRace(data.raca_cor) || normalizeRace(suggestion.raca),
    status: data.situacao ?? 'Filiado',
  };
};

const placeholderCandidate = {
  id: 'placeholder',
  vaga: '-',
  posicao_candidato: '-',
  nome_urna: 'Carregando candidatos...',
  voto_proj_max: '-',
  voto_proj_min: '-',
  historico_votos: '-',
  cargo_disputado: '-',
  ano: '-',
  fefc_projetado: '-',
  fefc_historico: '-',
  reduto: '-',
  partido: '-',
  genero: '-',
  raca: '-',
  status: 'Filiado',
  has_info: false,
};

const sortByPosition = (items) =>
  [...items].sort(
    (a, b) =>
      Number(a?.posicao_candidato ?? Number.MAX_SAFE_INTEGER) -
      Number(b?.posicao_candidato ?? Number.MAX_SAFE_INTEGER)
  );

const PPI_RACES = new Set(['preta', 'parda', 'indígena']);

const CandidatesTable = ({
  onFemaleAffiliatedCountChange = () => {},
  onConfirmedCountChange = () => {},
  onNegotiationCountChange = () => {},
  onPpiCountChange = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [newCandidate, setNewCandidate] = useState(createEmptyCandidate());
  const [candidates, setCandidates] = useState([placeholderCandidate]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [isAutoCompleteLoading, setIsAutoCompleteLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [hasFetchError, setHasFetchError] = useState(false);

  useEffect(() => {
    if (!Array.isArray(candidates)) {
      onFemaleAffiliatedCountChange(0);
      onConfirmedCountChange(0);
      onNegotiationCountChange(0);
      onPpiCountChange(0);
      return;
    }

    const totals = candidates.reduce(
      (acc, candidate) => {
        if (!candidate?.id || candidate.id === 'placeholder') {
          return acc;
        }

        const genero = candidate.genero?.toString().trim().toLowerCase();
        const status = candidate.status?.toString().trim().toLowerCase();
        const race = candidate.raca?.toString().trim().toLowerCase();

        if (genero === 'feminino' && status === 'filiado') {
          acc.femaleAffiliated += 1;
        }

        if (status === 'filiado') {
          acc.confirmed += 1;
        } else if (status === 'em negociação') {
          acc.negotiation += 1;
        }

        if (PPI_RACES.has(race)) {
          acc.ppi += 1;
        }

        return acc;
      },
      { femaleAffiliated: 0, confirmed: 0, negotiation: 0, ppi: 0 }
    );

    onFemaleAffiliatedCountChange(totals.femaleAffiliated);
    onConfirmedCountChange(totals.confirmed);
    onNegotiationCountChange(totals.negotiation);
    onPpiCountChange(totals.ppi);
  }, [
    candidates,
    onConfirmedCountChange,
    onFemaleAffiliatedCountChange,
    onNegotiationCountChange,
    onPpiCountChange,
  ]);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/candidatos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar candidatos');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inesperada do servidor: ${text.slice(0, 100)}`);
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const sortedList = list.length ? sortByPosition(list) : [placeholderCandidate];
      setCandidates(sortedList);
      setHasFetchError(false);
    } catch (error) {
      console.error(error);
      alert('Não foi possível carregar os candidatos.');
      setHasFetchError(true);
      const fallback = [placeholderCandidate];
      setCandidates(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const fetchAutoComplete = useCallback(async (term, controller) => {
    if (term.length < AUTOCOMPLETE_MIN_CHARS) {
      setAutoCompleteOptions([]);
      return;
    }

    setIsAutoCompleteLoading(true);
    try {
      const params = new URLSearchParams({
        nome_candidato: term,
        limit: String(AUTOCOMPLETE_LIMIT),
      });
      const response = await fetch(
        `${API_V1_BASE_URL}/candidatos2022sp?${params.toString()}`,
        { signal: controller?.signal }
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar sugestões');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inesperada do servidor: ${text.slice(0, 100)}`);
      }
      const data = await response.json();
      const suggestions = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.id,
        nome: item.candidato,
        partido: item.partido,
        cargo: item.cargo,
        raw: item,
      }));
      setAutoCompleteOptions(suggestions);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    } finally {
      setIsAutoCompleteLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setAutoCompleteOptions([]);
      setSelectedSuggestion(null);
      return;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(() => {
      fetchAutoComplete(searchTerm.trim(), controller);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(debounceId);
    };
  }, [fetchAutoComplete, searchTerm]);

  useEffect(() => {
    if (
      selectedSuggestion &&
      selectedSuggestion.nome?.toLowerCase() !== searchTerm.trim().toLowerCase()
    ) {
      setSelectedSuggestion(null);
    }
  }, [searchTerm, selectedSuggestion]);

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
      )
    );
  };

  const getStatusClass = (status) =>
    status === 'Filiado' ? 'status-filiado' : 'status-negociacao';

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.nome_urna?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setShowAddForm(true);
    if (selectedSuggestion) {
      setNewCandidate(mapSuggestionToCandidate(selectedSuggestion));
    } else {
      setNewCandidate(createEmptyCandidate());
    }
  };

  const handleInputChange = (field, value) => {
    setNewCandidate((prev) => ({
      ...prev,
      [field]: field === 'raca' ? normalizeRace(value) : value,
    }));
  };

  const handleOkClick = async () => {
    if (!newCandidate.nome_urna.trim()) {
      alert('Por favor, preencha o nome de urna.');
      return;
    }

    if (
      !newCandidate.posicao_candidato ||
      Number.isNaN(Number(newCandidate.posicao_candidato))
    ) {
      alert('Informe a posição do candidato no grid.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...newCandidate,
        posicao_candidato: Number(newCandidate.posicao_candidato),
      };

      const response = await fetch(`${API_BASE_URL}/candidato/cadastrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar candidato');
      }

      const createdCandidate = await response.json();
      setCandidates((prev) => sortByPosition([...prev, createdCandidate]));
      setShowAddForm(false);
      setNewCandidate(createEmptyCandidate());
    } catch (error) {
      console.error(error);
      alert('Não foi possível cadastrar o candidato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setShowAddForm(false);
    setNewCandidate(createEmptyCandidate());
  };

  const handleEditClick = (candidate) => {
    setEditingId(candidate.id);
    setEditingCandidate({ ...candidate });
  };

  const handleEditChange = (field, value) => {
    setEditingCandidate((prev) => ({
      ...prev,
      [field]: field === 'raca' ? normalizeRace(value) : value,
    }));
  };

  const buildGridPayload = (candidate) => ({
    vaga: candidate.vaga || null,
    nome_urna: candidate.nome_urna?.trim() || '',
    voto_proj_max: candidate.voto_proj_max || null,
    voto_proj_min: candidate.voto_proj_min || null,
    historico_votos: candidate.historico_votos || null,
    cargo_disputado: candidate.cargo_disputado || null,
    ano: candidate.ano || null,
    fefc_projetado: candidate.fefc_projetado || null,
    fefc_historico: candidate.fefc_historico || null,
    reduto: candidate.reduto || null,
    partido: candidate.partido || null,
    genero: candidate.genero || null,
    raca: candidate.raca || null,
    status: candidate.status || null,
    has_info: Boolean(candidate.has_info),
    posicao_candidato: Number(candidate.posicao_candidato),
  });

  const handleSaveEdit = async () => {
    if (!editingCandidate || !editingCandidate.nome_urna?.trim()) {
      alert('Por favor, preencha o nome de urna.');
      return;
    }

    if (
      !editingCandidate.posicao_candidato ||
      Number.isNaN(Number(editingCandidate.posicao_candidato))
    ) {
      alert('Informe uma posição válida para o candidato.');
      return;
    }

    if (!editingCandidate.id) {
      alert('Não foi possível identificar o candidato para atualização.');
      return;
    }

    const updatedCandidate = {
      ...editingCandidate,
      posicao_candidato: Number(editingCandidate.posicao_candidato),
    };

    setIsSavingEdit(true);
    try {
      const response = await fetch(`${API_BASE_URL}/candidato/${editingCandidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildGridPayload(updatedCandidate)),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar candidato');
      }

      const savedCandidate = await response.json();
      setCandidates((prev) =>
        sortByPosition(
          prev.map((candidate) => (candidate.id === savedCandidate.id ? savedCandidate : candidate))
        )
      );
      setEditingId(null);
      setEditingCandidate(null);
    } catch (error) {
      console.error(error);
      alert('Não foi possível salvar as alterações do candidato.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCandidate(null);
  };

  const handleDeleteClick = (candidateId) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      setCandidates((prev) => prev.filter((candidate) => candidate.id !== candidateId));
      if (editingId === candidateId) {
        setEditingId(null);
        setEditingCandidate(null);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.nome);
    setSelectedSuggestion(suggestion);
    setAutoCompleteOptions([]);
  };

  return (
    <div className="table-container">
      <div className="search-container">
        <div className="search-row">
          <input
            type="text"
            placeholder="Buscar por nome de urna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="add-button"
            onClick={handleAddClick}
            title="Adicionar novo candidato"
          >
            + Add
          </button>
        </div>
        {searchTerm && (
          <>
            <div className="search-feedback">
              <span className="search-results">
                {filteredCandidates.length} resultado(s) encontrado(s)
              </span>
              {selectedSuggestion && (
                <div className="search-selected">
                  Selecionado: <strong>{selectedSuggestion.nome}</strong>{' '}
                  <span>{selectedSuggestion.partido}</span>
                </div>
              )}
            </div>
            <div className="search-autocomplete">
              {isAutoCompleteLoading && (
                <div className="search-autocomplete__status">Buscando sugestões...</div>
              )}
              {!isAutoCompleteLoading &&
                searchTerm.length >= AUTOCOMPLETE_MIN_CHARS &&
                autoCompleteOptions.length === 0 && (
                  <div className="search-autocomplete__status">
                    Nenhum candidato encontrado
                  </div>
                )}
              {autoCompleteOptions.length > 0 && (
                <ul className="search-autocomplete__list">
                  {autoCompleteOptions.map((option) => (
                    <li
                      key={option.id}
                      className="search-autocomplete__item"
                      onClick={() => handleSuggestionClick(option)}
                    >
                      <div className="search-autocomplete__item-main">
                        <strong>{option.nome}</strong>
                        <span>{option.partido}</span>
                      </div>
                      <small>{option.cargo}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
        {hasFetchError && (
          <div className="search-error">
            Não foi possível conectar ao backend. Verifique se o servidor está ativo.
          </div>
        )}
      </div>
      {showAddForm && (
        <div className="add-form-container">
          <div className="add-form-header">
            <h3>Adicionar Novo Candidato</h3>
            <button className="cancel-button" onClick={handleCancelClick}>
              ✕
            </button>
          </div>
          <div className="add-form-grid">
            <div className="form-cell">
              <label>Vagas</label>
              <input
                type="text"
                value={newCandidate.vaga}
                onChange={(e) => handleInputChange('vaga', e.target.value)}
                placeholder="Vaga/ID"
              />
            </div>
            <div className="form-cell">
              <label>Nome de Urna</label>
              <input
                type="text"
                value={newCandidate.nome_urna}
                onChange={(e) => handleInputChange('nome_urna', e.target.value)}
                placeholder="Nome"
                required
              />
            </div>
            <div className="form-cell">
              <label>Posição no grid</label>
              <input
                type="number"
                value={newCandidate.posicao_candidato}
                onChange={(e) => handleInputChange('posicao_candidato', e.target.value)}
                placeholder="Posição"
                min="1"
              />
            </div>
            <div className="form-cell">
              <label>Voto Proj. MAX.</label>
              <input
                type="text"
                value={newCandidate.voto_proj_max}
                onChange={(e) => handleInputChange('voto_proj_max', e.target.value)}
                placeholder="Max"
              />
            </div>
            <div className="form-cell">
              <label>Voto Proj. MIN.</label>
              <input
                type="text"
                value={newCandidate.voto_proj_min}
                onChange={(e) => handleInputChange('voto_proj_min', e.target.value)}
                placeholder="Min"
              />
            </div>
            <div className="form-cell">
              <label>Hist. Votação</label>
              <input
                type="text"
                value={newCandidate.historico_votos}
                onChange={(e) => handleInputChange('historico_votos', e.target.value)}
                placeholder="Histórico"
              />
            </div>
            <div className="form-cell">
              <label>Cargo Disputado</label>
              <input
                type="text"
                value={newCandidate.cargo_disputado}
                onChange={(e) => handleInputChange('cargo_disputado', e.target.value)}
                placeholder="Cargo"
              />
            </div>
            <div className="form-cell">
              <label>Ano</label>
              <input
                type="text"
                value={newCandidate.ano}
                onChange={(e) => handleInputChange('ano', e.target.value)}
                placeholder="Ano"
              />
            </div>
            <div className="form-cell">
              <label>FEFC Projetado</label>
              <input
                type="text"
                value={newCandidate.fefc_projetado}
                onChange={(e) => handleInputChange('fefc_projetado', e.target.value)}
                placeholder="FEFC Proj."
              />
            </div>
            <div className="form-cell">
              <label>Histórico FEFC</label>
              <input
                type="text"
                value={newCandidate.fefc_historico}
                onChange={(e) => handleInputChange('fefc_historico', e.target.value)}
                placeholder="Hist. FEFC"
              />
            </div>
            <div className="form-cell">
              <label>Reduto</label>
              <input
                type="text"
                value={newCandidate.reduto}
                onChange={(e) => handleInputChange('reduto', e.target.value)}
                placeholder="Reduto"
              />
            </div>
            <div className="form-cell">
              <label>Partido</label>
              <input
                type="text"
                value={newCandidate.partido}
                onChange={(e) => handleInputChange('partido', e.target.value)}
                placeholder="Partido"
              />
            </div>
            <div className="form-cell">
              <label>Gênero</label>
              <input
                type="text"
                value={newCandidate.genero}
                onChange={(e) => handleInputChange('genero', e.target.value)}
                placeholder="Gênero"
              />
            </div>
            <div className="form-cell">
              <label>Raça</label>
              <select
                value={newCandidate.raca}
                onChange={(e) => handleInputChange('raca', e.target.value)}
                className="status-select"
              >
                <option value="">Selecione</option>
                {RACE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-cell">
              <label>Status</label>
              <select
                value={newCandidate.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="status-select"
              >
                <option value="Filiado">Filiado</option>
                <option value="Em negociação">Em Negociação</option>
              </select>
            </div>
            <div className="form-cell checkbox-cell">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCandidate.has_info}
                  onChange={(e) => handleInputChange('has_info', e.target.checked)}
                />
                Possui observação
              </label>
            </div>
          </div>
          <div className="add-form-actions">
            <button className="ok-button" onClick={handleOkClick} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'OK'}
            </button>
            <button className="cancel-form-button" onClick={handleCancelClick}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="loading-message">Carregando candidatos...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Vagas</th>
              <th>Posição</th>
              <th>Nome de Urna</th>
              <th>Voto Proj. MAX.</th>
              <th>Voto Proj. MIN.</th>
              <th>Hist. Votação</th>
              <th>Cargo Disputado</th>
              <th>Ano</th>
              <th>FEFC Projetado</th>
              <th>Histórico FEFC</th>
              <th>Reduto</th>
              <th>Partido</th>
              <th>Gênero</th>
              <th>Raça</th>
              <th>Status</th>
              <th>Obs:</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate) => {
              const isEditing = editingId === candidate.id;
              const displayCandidate = isEditing ? editingCandidate : candidate;

              return (
                <tr key={candidate.id ?? `${candidate.vaga}-${candidate.posicao_candidato}`}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.vaga ?? ''}
                        onChange={(e) => handleEditChange('vaga', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.vaga || '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayCandidate.posicao_candidato ?? ''}
                        onChange={(e) => handleEditChange('posicao_candidato', e.target.value)}
                        className="edit-input"
                        min="1"
                      />
                    ) : (
                      candidate.posicao_candidato
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.nome_urna ?? ''}
                        onChange={(e) => handleEditChange('nome_urna', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.nome_urna
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.voto_proj_max ?? ''}
                        onChange={(e) => handleEditChange('voto_proj_max', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.voto_proj_max
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.voto_proj_min ?? ''}
                        onChange={(e) => handleEditChange('voto_proj_min', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.voto_proj_min
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.historico_votos ?? ''}
                        onChange={(e) => handleEditChange('historico_votos', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.historico_votos
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.cargo_disputado ?? ''}
                        onChange={(e) => handleEditChange('cargo_disputado', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.cargo_disputado
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.ano ?? ''}
                        onChange={(e) => handleEditChange('ano', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.ano
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.fefc_projetado ?? ''}
                        onChange={(e) => handleEditChange('fefc_projetado', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.fefc_projetado
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.fefc_historico ?? ''}
                        onChange={(e) => handleEditChange('fefc_historico', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.fefc_historico
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.reduto ?? ''}
                        onChange={(e) => handleEditChange('reduto', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.reduto
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.partido ?? ''}
                        onChange={(e) => handleEditChange('partido', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.partido
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayCandidate.genero ?? ''}
                        onChange={(e) => handleEditChange('genero', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      candidate.genero
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={displayCandidate.raca ?? ''}
                        onChange={(e) => handleEditChange('raca', e.target.value)}
                        className={`status-select`}
                      >
                        <option value="">Selecione</option>
                        {RACE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      candidate.raca
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={displayCandidate.status ?? 'Filiado'}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className={`status-select ${getStatusClass(displayCandidate.status)}`}
                      >
                        <option value="Filiado">Filiado</option>
                        <option value="Em negociação">Em Negociação</option>
                      </select>
                    ) : (
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                        className={`status-select ${getStatusClass(candidate.status)}`}
                      >
                        <option value="Filiado">Filiado</option>
                        <option value="Em negociação">Em Negociação</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <div className={`info-icon ${!candidate.has_info ? 'disabled' : ''}`}>i</div>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="action-buttons">
                        <button
                          className="action-btn save-btn"
                          onClick={handleSaveEdit}
                          title="Salvar alterações"
                          disabled={isSavingEdit}
                        >
                          {isSavingEdit ? '...' : '✓'}
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          onClick={handleCancelEdit}
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditClick(candidate)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(candidate.id)}
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CandidatesTable;

