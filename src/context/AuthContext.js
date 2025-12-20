import React, { createContext, useState, useContext, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_V1_BASE_URL || 'http://localhost:8000/api/v1';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState(null);
  const [tipoCargo, setTipoCargo] = useState('estadual'); // 'estadual' ou 'federal'

  const decodeToken = (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        let estados = [];
        if (payload.estados) {
          // Se estados é uma string, converter para array
          if (typeof payload.estados === 'string') {
            estados = payload.estados.split(',').map(e => e.trim()).filter(e => e);
          } else if (Array.isArray(payload.estados)) {
            estados = payload.estados;
          }
        }
        return {
          id: parseInt(payload.sub),
          email: payload.email,
          full_name: payload.full_name,
          perfil: payload.perfil,
          estados: estados,
        };
      }
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
    }
    return null;
  };

  useEffect(() => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      const userData = decodeToken(savedToken);
      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
    // Este useEffect deve rodar apenas uma vez na inicialização
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Credenciais inválidas');
      }

      const data = await response.json();
      const accessToken = data.access_token;
      
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      
      // Decodificar o token para obter informações do usuário
      const userData = decodeToken(accessToken);
      if (userData) {
        setUser(userData);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao cadastrar usuário');
      }

      const data = await response.json();
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedEstado(null);
    setTipoCargo('estadual');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedEstado');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading,
    selectedEstado,
    setSelectedEstado,
    tipoCargo,
    setTipoCargo,
    decodeToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

