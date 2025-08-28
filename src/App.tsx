import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import UserVPSManagement from './pages/user/VPSManagement';
import UserBilling from './pages/user/Billing';
import UserSupport from './pages/user/Support';
import AdminUsers from './pages/admin/Users';
import AdminVPS from './pages/admin/VPS';
import AdminSettings from './pages/admin/Settings';
import TestAuth from './components/auth/TestAuth';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/vps" element={
            <ProtectedRoute>
              <UserVPSManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/billing" element={
            <ProtectedRoute>
              <UserBilling />
            </ProtectedRoute>
          } />
          
          <Route path="/support" element={
            <ProtectedRoute>
              <UserSupport />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/vps" element={
            <ProtectedRoute adminOnly>
              <AdminVPS />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {/* Debug component - remove in production */}
      <TestAuth />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
}

export default App;