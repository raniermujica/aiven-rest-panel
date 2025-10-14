import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TodayReservations } from './pages/TodayReservations';
import { useAuthStore } from './store/authStore';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

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
                  <Route path="/reservations" element={<div>Todas las reservas</div>} />
                  <Route path="/customers" element={<div>Clientes</div>} />
                  <Route path="/waitlist" element={<div>Lista de espera</div>} />
                  <Route path="/analytics" element={<div>Estadísticas</div>} />
                  <Route path="/settings" element={<div>Configuración</div>} />
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
