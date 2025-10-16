import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TodayReservations } from './pages/TodayReservations';
import { AllReservations } from './pages/AllReservations';
import { Customers } from './pages/Customers';
import { Waitlist } from './pages/Waitlist';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { SuperAdmin } from './pages/SuperAdmin';
import { useAuthStore } from './store/authStore';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Componente para rutas de SuperAdmin
function SuperAdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta SuperAdmin */}
        <Route
          path="/admin"
          element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reservations/today" element={<TodayReservations />} />
                  <Route path="/reservations" element={<AllReservations />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/waitlist" element={<Waitlist />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
