import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ThemeProvider } from './components/layout/ThemeProvider';
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

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

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
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <SuperAdminRoute>
                <SuperAdmin />
              </SuperAdminRoute>
            }
          />

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
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;