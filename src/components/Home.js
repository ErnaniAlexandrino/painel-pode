import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import GestorDashboard from './GestorDashboard';

const Home = () => {
  const { user } = useAuth();
  const perfil = (user?.perfil || '').toString().trim().toLowerCase();

  if (perfil === 'gestor') {
    return <GestorDashboard />;
  }

  return <Dashboard />;
};

export default Home;


