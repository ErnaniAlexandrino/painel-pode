import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const API_V1_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';
const AUTOCOMPLETE_MIN_CHARS = 2;
const AUTOCOMPLETE_LIMIT = 10;

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
  historico_votos: '0',
  cargo_disputado: '',
  ano: '',
  fefc_projetado: '',
  fefc_historico: '',
  reduto: '',
  partido: '',
  genero: '',
  raca: '',
  status: 'Em negociação',
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
    nome_urna: data.nome_urna ?? suggestion.nome ?? '',
    historico_votos:
      data.votos !== null && data.votos !== undefined
        ? String(data.votos)
        : '0',
    cargo_disputado: data.cargo ?? suggestion.cargo ?? '',
    ano: data.ano !== null && data.ano !== undefined ? String(data.ano) : '',
    fefc_historico:
      data.fundo_total !== null && data.fundo_total !== undefined
        ? String(data.fundo_total)
        : '',
    partido: data.partido ?? suggestion.partido ?? '',
    genero: data.genero ?? '',
    raca: normalizeRace(data.raca) || normalizeRace(suggestion.raca),
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
  estado,
  tipoCargo = 'estadual',
  onFemaleAffiliatedCountChange = () => {},
  onConfirmedCountChange = () => {},
  onNegotiationCountChange = () => {},
  onPpiCountChange = () => {},
  onVotoProjMaxChange = () => {},
  onVotoProjMinChange = () => {},
  onHistoricoVotosChange = () => {},
}) => {
  // Função para obter endpoints baseados no tipo de cargo
  const getEndpoints = (tipo) => {
    if (tipo === 'federal') {
      return {
        list: 'candidatos-federais',
        create: 'candidato-federal/cadastrar',
        update: 'candidato-federal',
        updateOrder: 'candidatos-federais/update-order',
      };
    }
    return {
      list: 'candidatos',
      create: 'candidato/cadastrar',
      update: 'candidato',
      updateOrder: 'candidatos/update-order',
    };
  };

  const endpoints = getEndpoints(tipoCargo);
  const { token } = useAuth();
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

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error');

  const showModal = (message, type = 'error') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

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
        if (candidate?.id == null || candidate.id === 'placeholder') {
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

        // Somar projeções de votos
        const votoProjMax = Number(candidate.voto_proj_max) || 0;
        const votoProjMin = Number(candidate.voto_proj_min) || 0;
        const historicoVotos = Number(candidate.historico_votos) || 0;
        acc.totalVotoProjMax += votoProjMax;
        acc.totalVotoProjMin += votoProjMin;
        acc.totalHistoricoVotos += historicoVotos;

        return acc;
      },
      { femaleAffiliated: 0, confirmed: 0, negotiation: 0, ppi: 0, totalVotoProjMax: 0, totalVotoProjMin: 0, totalHistoricoVotos: 0 }
    );

    onFemaleAffiliatedCountChange(totals.femaleAffiliated);
    onConfirmedCountChange(totals.confirmed);
    onNegotiationCountChange(totals.negotiation);
    onPpiCountChange(totals.ppi);
    onVotoProjMaxChange(totals.totalVotoProjMax);
    onVotoProjMinChange(totals.totalVotoProjMin);
    onHistoricoVotosChange(totals.totalHistoricoVotos);
  }, [
    candidates,
    onConfirmedCountChange,
    onFemaleAffiliatedCountChange,
    onNegotiationCountChange,
    onPpiCountChange,
    onVotoProjMaxChange,
    onVotoProjMinChange,
    onHistoricoVotosChange,
  ]);

  const fetchCandidates = useCallback(async () => {
    if (!estado || !token) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_V1_BASE_URL}/${endpoints.list}?estado=${encodeURIComponent(estado)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      showModal('Não foi possível carregar os candidatos.', 'error');
      setHasFetchError(true);
      const fallback = [placeholderCandidate];
      setCandidates(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [estado, token, endpoints.list]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates, estado, token, tipoCargo]);

  const fetchAutoComplete = useCallback(async (term, controller) => {
    if (term.length < AUTOCOMPLETE_MIN_CHARS) {
      setAutoCompleteOptions([]);
      return;
    }

    setIsAutoCompleteLoading(true);
    try {
      const params = new URLSearchParams({
        nome: term,
        limit: String(AUTOCOMPLETE_LIMIT),
      });
      const response = await fetch(
        `${API_V1_BASE_URL}/candidatos-sp-22-24?${params.toString()}`,
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
        nome: item.nome_urna,
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

  const handleStatusChange = async (candidateId, newStatus) => {
    // Buscar o candidato antes de atualizar o estado
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      showModal('Candidato não encontrado.', 'error');
      return;
    }

    // Atualizar estado local imediatamente para feedback visual
    const previousCandidates = [...candidates];
    setCandidates((prevCandidates) =>
      prevCandidates.map((c) =>
        c.id === candidateId ? { ...c, status: newStatus } : c
      )
    );

    try {
      // Criar payload com o candidato atualizado com o novo status
      const updatedCandidate = { ...candidate, status: newStatus };
      const payload = buildGridPayload(updatedCandidate);

      const response = await fetch(`${API_V1_BASE_URL}/${endpoints.update}/${candidateId}?estado=${encodeURIComponent(estado)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar com a resposta do servidor
      const savedCandidate = await response.json();
      setCandidates((prev) =>
        sortByPosition(
          prev.map((c) => (c.id === savedCandidate.id ? savedCandidate : c))
        )
      );
    } catch (error) {
      console.error(error);
      // Reverter para o estado anterior em caso de erro
      setCandidates(previousCandidates);
      showModal('Não foi possível atualizar o status do candidato.', 'error');
    }
  };

  const getStatusClass = (status) =>
    status === 'Filiado' ? 'status-filiado' : 'status-negociacao';

  const handleAddClick = () => {
    setShowAddForm(true);
    const validCandidates = candidates.filter(c => c.id !== 'placeholder');
    const nextPosition = validCandidates.length + 1;

    if (selectedSuggestion) {
      const candidate = mapSuggestionToCandidate(selectedSuggestion);
      // Se o partido contém "PODE", definir status como "Filiado"
      const status = candidate.partido?.toUpperCase().includes('PODE') 
        ? 'Filiado' 
        : candidate.status;
      setNewCandidate({
        ...candidate,
        historico_votos: candidate.historico_votos || '0',
        posicao_candidato: nextPosition,
        status,
      });
    } else {
      setNewCandidate({
        ...createEmptyCandidate(),
        posicao_candidato: nextPosition,
      });
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
      showModal('Por favor, preencha o nome de urna.', 'warning');
      return;
    }

    if (
      !newCandidate.posicao_candidato ||
      Number.isNaN(Number(newCandidate.posicao_candidato))
    ) {
      showModal('Informe a posição do candidato no grid.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...newCandidate,
        posicao_candidato: Number(newCandidate.posicao_candidato),
      };

      const response = await fetch(`${API_V1_BASE_URL}/${endpoints.create}?estado=${encodeURIComponent(estado)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Não foi possível cadastrar o candidato.';
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            message = errorData.detail;
          }
        } catch (_) {
          // sem corpo JSON de erro, mantém mensagem padrão
        }
        showModal(message, 'error');
        return;
      }

      const createdCandidate = await response.json();
      setCandidates((prev) => sortByPosition([...prev, createdCandidate]));
      setShowAddForm(false);
      setNewCandidate(createEmptyCandidate());
    } catch (error) {
      console.error(error);
      showModal('Não foi possível cadastrar o candidato.', 'error');
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
      showModal('Por favor, preencha o nome de urna.', 'warning');
      return;
    }

    if (
      !editingCandidate.posicao_candidato ||
      Number.isNaN(Number(editingCandidate.posicao_candidato))
    ) {
      showModal('Informe uma posição válida para o candidato.', 'warning');
      return;
    }

    if (!editingCandidate.id) {
      showModal('Não foi possível identificar o candidato para atualização.', 'error');
      return;
    }

    const updatedCandidate = {
      ...editingCandidate,
      posicao_candidato: Number(editingCandidate.posicao_candidato),
    };

    setIsSavingEdit(true);
    try {
      const response = await fetch(`${API_V1_BASE_URL}/${endpoints.update}/${editingCandidate.id}?estado=${encodeURIComponent(estado)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      showModal('Não foi possível salvar as alterações do candidato.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCandidate(null);
  };

  const handleDeleteClick = async (candidateId) => {
    if (!candidateId || candidateId === 'placeholder') {
      showModal('Não é possível excluir este candidato.', 'warning');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este candidato?')) {
      return;
    }

    try {
      const response = await fetch(`${API_V1_BASE_URL}/${endpoints.update}/${candidateId}?estado=${encodeURIComponent(estado)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Não foi possível excluir o candidato.';
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            message = errorData.detail;
          }
        } catch (_) {
          // sem corpo JSON de erro, mantém mensagem padrão
        }
        showModal(message, 'error');
        return;
      }

      if (editingId === candidateId) {
        setEditingId(null);
        setEditingCandidate(null);
      }

      // Recarregar lista do backend para obter posições reindexadas
      await fetchCandidates();
      showModal('Candidato excluído com sucesso.', 'success');
    } catch (error) {
      console.error(error);
      showModal('Não foi possível excluir o candidato.', 'error');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.nome);
    setSelectedSuggestion(suggestion);
    setAutoCompleteOptions([]);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(candidates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedCandidates = items.map((candidate, index) => ({
      ...candidate,
      posicao_candidato: index + 1,
    }));

    const originalCandidates = candidates;
    setCandidates(updatedCandidates);

    const backendPayload = updatedCandidates.map((candidate) => ({
      id: candidate.id,
      posicao_candidato: candidate.posicao_candidato,
    }));

    try {
      const response = await fetch(`${API_V1_BASE_URL}/${endpoints.updateOrder}?estado=${encodeURIComponent(estado)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save the new order.');
      }
    } catch (error) {
      console.error(error);
      showModal('Ocorreu um erro ao salvar a nova ordem. Por favor, tente novamente.', 'error');
      setCandidates(originalCandidates);
    }
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
                placeholder="Posição"
                min="1"
                disabled
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
                value={newCandidate.historico_votos || '0'}
                onChange={(e) => handleInputChange('historico_votos', e.target.value)}
                placeholder="Histórico"
                disabled
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
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="table">
            <thead>
              <tr>
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
          <Droppable droppableId="candidates">
            {(provided) => (
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {candidates.map((candidate, index) => {
                  const isEditing = editingId === candidate.id;
                  const displayCandidate = isEditing ? editingCandidate : candidate;

                  return (
                    <Draggable
                      key={candidate.id}
                      draggableId={String(candidate.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            boxShadow: snapshot.isDragging ? '0 0 .4rem rgba(0,0,0,.5)' : 'none',
                          }}
                        >
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
                                disabled
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
                                ? formatCurrency(Number(candidate.fefc_projetado))
                                : '-'
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={displayCandidate.fefc_historico ?? ''}
                                onChange={(e) => handleEditChange('fefc_historico', e.target.value)}
                                className="edit-input"
                                disabled
                              />
                            ) : (
                              candidate.fefc_historico
                                ? formatCurrency(Number(candidate.fefc_historico))
                                : '-'
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
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
    )}
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      message={modalMessage}
      type={modalType}
    />
  </div>
);
};

export default CandidatesTable;

