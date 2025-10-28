import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Analytics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [
        overviewData,
        statusDataRes,
        servicesData,
        timelineData,
        revenueData,
      ] = await Promise.all([
        api.getOverviewStats(),
        api.getAppointmentsByStatus(period),
        api.getTopServices(5),
        api.getAppointmentsTimeline(7),
        api.getRevenueStats(),
      ]);

      setStats(overviewData);
      setStatusData(statusDataRes);
      setTopServices(servicesData.services || []);
      setTimeline(timelineData.timeline || []);
      setRevenue(revenueData);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const totalAppointmentsByStatus = statusData 
    ? Object.values(statusData).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
          <p className="text-white mt-1">
            Análisis del rendimiento de tu negocio
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Semana
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Mes
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('year')}
          >
            Año
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={`${terminology.bookings} Hoy`}
            value={stats.appointments?.today || 0}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title={`${terminology.bookings} Esta Semana`}
            value={stats.appointments?.thisWeek || 0}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title={`${terminology.bookings} Este Mes`}
            value={stats.appointments?.thisMonth || 0}
            icon={BarChart3}
            color="purple"
          />
          <StatsCard
            title={`Total ${terminology.customers}`}
            value={stats.customers?.total || 0}
            icon={Users}
            color="yellow"
          />
        </div>
      )}

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats && (
          <>
            <StatsCard
              title={`Nuevos ${terminology.customers} Este Mes`}
              value={stats.customers?.newThisMonth || 0}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title={`${terminology.customers} VIP`}
              value={stats.customers?.vip || 0}
              icon={Star}
              color="yellow"
            />
          </>
        )}
        {revenue && (
          <StatsCard
            title="Ingresos Estimados (Mes)"
            value={`€${revenue.estimatedRevenue?.toFixed(2) || 0}`}
            icon={DollarSign}
            color="green"
            subtitle={`${revenue.completedAppointments} citas completadas`}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {terminology.bookings} por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData && (
              <div className="space-y-4">
                <StatusBar
                  label="Confirmadas"
                  value={statusData.confirmado || 0}
                  total={totalAppointmentsByStatus}
                  color="green"
                  icon={CheckCircle}
                />
                <StatusBar
                  label="Pendientes"
                  value={statusData.pendiente || 0}
                  total={totalAppointmentsByStatus}
                  color="yellow"
                  icon={Clock}
                />
                <StatusBar
                  label="Completadas"
                  value={statusData.completada || 0}
                  total={totalAppointmentsByStatus}
                  color="blue"
                  icon={CheckCircle}
                />
                <StatusBar
                  label="Canceladas"
                  value={statusData.cancelada || 0}
                  total={totalAppointmentsByStatus}
                  color="red"
                  icon={XCircle}
                />
                <StatusBar
                  label="No Show"
                  value={statusData.no_show || 0}
                  total={totalAppointmentsByStatus}
                  color="gray"
                  icon={XCircle}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <p className="text-sm text-white text-center py-8">
                No hay datos suficientes
              </p>
            ) : (
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-700'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        <p className="text-sm text-gray-400">{service.count} veces</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{service.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {terminology.bookings} de los Últimos 7 Días
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-white text-center py-8">
              No hay datos suficientes
            </p>
          ) : (
            <div className="space-y-4">
              {timeline.map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                const dayNumber = date.getDate();
                const maxValue = Math.max(...timeline.map(d => d.total), 1);

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white capitalize">
                        {dayName} {dayNumber}
                      </span>
                      <span className="text-white">{day.total} citas</span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {day.confirmado > 0 && (
                        <div
                          className="bg-green-500 rounded"
                          style={{ width: `${(day.confirmado / maxValue) * 100}%` }}
                          title={`${day.confirmado} confirmadas`}
                        />
                      )}
                      {day.completada > 0 && (
                        <div
                          className="bg-blue-500 rounded"
                          style={{ width: `${(day.completada / maxValue) * 100}%` }}
                          title={`${day.completada} completadas`}
                        />
                      )}
                      {day.cancelada > 0 && (
                        <div
                          className="bg-red-500 rounded"
                          style={{ width: `${(day.cancelada / maxValue) * 100}%` }}
                          title={`${day.cancelada} canceladas`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-white">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBar({ label, value, total, color, icon: Icon }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  const bgColorClasses = {
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50',
    red: 'bg-red-50',
    gray: 'bg-gray-50',
  };

  const textColorClasses = {
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    gray: 'text-gray-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', textColorClasses[color])} />
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className={cn('w-full h-2 rounded-full', bgColorClasses[color])}>
        <div
          className={cn('h-2 rounded-full transition-all', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};