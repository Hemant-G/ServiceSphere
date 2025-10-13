import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './Dashboard/CustomerDashboard';
import ProviderDashboard from './Dashboard/ProviderDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return user.role === 'provider' ? <ProviderDashboard /> : <CustomerDashboard />;
};

export default Dashboard;
