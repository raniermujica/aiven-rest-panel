import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Analytics() {
  const { user } = useAuthStore();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const terminology = user?.business?.terminology || {
    booking: 'Reserva',
    bookings: 'Reservas',
    customer: 'Cliente',
    customers: 'Clientes',
    capacity: 'Personas',
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [dashboard, monthly, customers] = await Promise.all([
        api.getDashboardStats(),
        api.getMonthlyStats(),
        api.getTopCustomers(5),
      ]);
      
      setDashboardStats(dashboard);
      setMonthlyStats(monthly);
      setTopCustomers(customers.customers || []);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const thisMonth = monthlyStats?.thisMonth || {};
  const lastMonth = monthlyStats?.lastMonth || {};
  
  const reservationsChange = calculateChange(thisMonth.reservations, lastMonth.reservations);
  const coversChange = calculateChange(thisMonth.covers, lastMonth.covers);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis y métricas de {user?.business?.name || 'tu negocio'}
          </p>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar reporte
        </Button>
      </div>

      {/* Today's Overview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen de hoy</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {terminology.bookings} totales
                  </p>
                  <p className="text-2xl font-bold">{dashboardStats?.today?.total || 0}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {dashboardStats?.today?.confirmed || 0} confirmadas
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {terminology.capacity} hoy
                  </p>
                  <p className="text-2xl font-bold">{dashboardStats?.today?.covers || 0}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Total del día
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">VIP hoy</p>
                  <p className="text-2xl font-bold">{dashboardStats?.vipToday || 0}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {terminology.customers} especiales
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ocupación</p>
                  <p className="text-2xl font-bold">{dashboardStats?.occupancyRate || 0}%</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Del aforo total
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Comparativa mensual
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                {terminology.bookings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{thisMonth.reservations || 0}</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <div className="flex items-center gap-2">
                  {reservationsChange > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : reservationsChange < 0 ? (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    reservationsChange > 0 
                      ? 'text-green-600' 
                      : reservationsChange < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {reservationsChange > 0 ? '+' : ''}{reservationsChange}%
                  </span>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                {terminology.capacity}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{thisMonth.covers || 0}</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <div className="flex items-center gap-2">
                  {coversChange > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : coversChange < 0 ? (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    coversChange > 0 
                      ? 'text-green-600' 
                      : coversChange < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {coversChange > 0 ? '+' : ''}{coversChange}%
                  </span>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                No-shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">{thisMonth.noShows || 0}</p>
                  <p className="text-xs text-gray-500">Este mes</p>
                </div>
                <div className="text-xs text-gray-500">
                  vs {lastMonth.noShows || 0} mes anterior
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top {terminology.customers}</CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length > 0 ? (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-gray-500">
                        {customer.total_visits} visitas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-gray-200">
                      <div 
                        className="h-full rounded-full bg-blue-500"
                        style={{ 
                          width: `${Math.min((customer.total_visits / (topCustomers[0]?.total_visits || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay datos suficientes aún
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Tendencia positiva</h3>
                <p className="mt-1 text-sm text-green-700">
                  {reservationsChange > 0 
                    ? `Las ${terminology.bookings.toLowerCase()} aumentaron un ${reservationsChange}% este mes`
                    : 'Mantén el buen trabajo con tus clientes'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  {terminology.customers} leales
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Tienes {topCustomers.length} {terminology.customers.toLowerCase()} frecuentes. Considera crear un programa de fidelidad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};