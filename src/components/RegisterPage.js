import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoPodemos from '../assests/imagens/logo_podemos.svg';
import './RegisterPage.css';

const estadosBrasileiros = [
  'ACRE', 'ALAGOAS', 'AMAPÁ', 'AMAZONAS', 'BAHIA', 'CEARÁ',
  'DISTRITO FEDERAL', 'ESPÍRITO SANTO', 'GOIÁS', 'MARANHÃO',
  'MATO GROSSO', 'MATO GROSSO DO SUL', 'MINAS GERAIS', 'PARÁ',
  'PARAÍBA', 'PARANÁ', 'PERNAMBUCO', 'PIAUÍ', 'RIO DE JANEIRO',
  'RIO GRANDE DO NORTE', 'RIO GRANDE DO SUL', 'RONDÔNIA',
  'RORAIMA', 'SANTA CATARINA', 'SÃO PAULO', 'SERGIPE', 'TOCANTINS'
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    perfil: '',
    estados: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar estados selecionados se mudar de Coordenador para Gestor
    if (name === 'perfil' && value === 'Gestor') {
      setFormData((prev) => ({
        ...prev,
        estados: [],
      }));
    }
  };

  const handleEstadoChange = (estado) => {
    setFormData((prev) => {
      const estados = prev.estados.includes(estado)
        ? prev.estados.filter((e) => e !== estado)
        : [...prev.estados, estado];
      return { ...prev, estados };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirm_password) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.perfil === 'Coordenador' && formData.estados.length === 0) {
      setError('Selecione pelo menos um estado para o perfil Coordenador');
      return;
    }

    setLoading(true);

    // Preparar dados para envio
    const userData = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      perfil: formData.perfil,
      estados: formData.perfil === 'Coordenador' ? formData.estados.join(',') : null,
    };

    const result = await register(userData);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Erro ao cadastrar usuário');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <img src={logoPodemos} alt="Podemos 20" className="auth-logo" />
          <h2>Cadastro</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="full_name">Nome</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Seu nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirmar Senha</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Confirme sua senha"
            />
          </div>

          <div className="form-group">
            <label htmlFor="perfil">Perfil</label>
            <select
              id="perfil"
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um perfil</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Gestor">Gestor</option>
            </select>
          </div>

          {formData.perfil === 'Coordenador' && (
            <div className="form-group">
              <label>Estados</label>
              <div className="estados-grid">
                {estadosBrasileiros.map((estado) => (
                  <label key={estado} className="estado-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.estados.includes(estado)}
                      onChange={() => handleEstadoChange(estado)}
                    />
                    <span>{estado}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

