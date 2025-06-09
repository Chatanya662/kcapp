import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import CustomersPage from './components/CustomersPage';
import DeliveriesPage from './components/DeliveriesPage';
import DeliveryBoysPage from './components/DeliveryBoysPage';
import { Loader2 } from 'lucide-react';
import './App.css';

// Placeholder component for reports page
const ReportsPage = () => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
    <p className="text-muted-foreground">Reports page coming soon...</p>
  </div>
);

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomersPage />;
      case 'deliveries':
        return <DeliveriesPage />;
      case 'delivery-boys':
        return <DeliveryBoysPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

