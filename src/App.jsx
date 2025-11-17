import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
// import { DemoLayout } from './components/layout/DemoLayout';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TodayReservations } from './pages/TodayReservations';
import { AllReservations } from './pages/AllReservations';
import { Customers } from './pages/Customers';
import TableManagement from './pages/restaurant/TableManagement';
import { Waitlist } from './pages/Waitlist';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { SuperAdmin } from './pages/SuperAdmin';
import { CustomerProfile } from '@/pages/CustomerProfile';
import { AppointmentDetail } from '@/pages/AppointmentDetail';
import CalendarView from './components/calendar/CalendarView';
import Demo from './pages/Demo';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PERMISSIONS } from './utils/permissions';
import { useAuthStore } from './store/authStore';
import TableStatus from './pages/restaurant/TableStatus';

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

          {/* Ruta Demo - SIN Layout */}
          {/* <Route 
            path="/demo" 
            element={
              <DemoLayout>
                <Demo />
              </DemoLayout>
            } 
          /> */}
<Route path="/demo" element={<Demo />} />

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
                    <Route path="/reservations" element={<AllReservations />} />
                    <Route path="/reservations/today" element={<TodayReservations />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:customerId" element={<CustomerProfile />} />
                    <Route path="/appointments/:appointmentId" element={<AppointmentDetail />} />
                    <Route path="/waitlist" element={<Waitlist />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/tables" element={<TableManagement />} />
                    <Route path="/tables/status" element={<TableStatus />} />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute permission={PERMISSIONS.VIEW_SETTINGS}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
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