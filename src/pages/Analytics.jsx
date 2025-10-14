import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';

export function Analytics() {
  // Datos de ejemplo
  const stats = {
    thisMonth: {
      reservations: 234,
      covers: 856,
      revenue: 38450,
      avgTicket: 44.90,
      occupancy: 78,
      noShows: 12,
    },
    lastMonth: {
      reservations: 198,
      covers: 724,
      revenue: 32180,
      avgTicket: 44.45,
      occupancy: 71,
      noShows: 18,
    },
  };

  const getChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  const timeSlotData = [
    { slot: '12:00-13:00', reservations: 15, covers: 48 },
    { slot: '13:00-14:00', reservations: 28, covers: 89 },
    { slot: '14:00-15:00', reservations: 32, covers: 103 },
    { slot: '15:00-16:00', reservations: 18, covers: 52 },
    { slot: '20:00-21:00', reservations: 35, covers: 124 },
    { slot: '21:00-22:00', reservations: 42, covers: 156 },
    { slot: '22:00-23:00', reservations: 38, covers: 132 },
    { slot: '23:00-24:00', reservations: 26, covers: 82 },
  ];

  const topCustomers = [
    { name: 'María García', visits: 23, totalSpent: 1955 },
    { name: 'Ana Martínez', visits: 18, totalSpent: 1710 },
    { name: 'Juan Pérez', visits: 15, totalSpent: 975 },
    { name: 'Carlos Ruiz', visits: 12, totalSpent: 840 },
    { name: 'Laura Sánchez', visits: 11, totalSpent: 792 },
  ];

  const sourceData = [
    { source: 'WhatsApp', reservations: 142, percentage: 60.7 },
    { source: 'Manual', reservations: 48, percentage: 20.5 },
    { source: 'Web', reservations: 32, percentage: 13.7 },
    { source: 'Teléfono', reservations: 12, percentage: 5.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis y métricas del restaurante
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar período
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Reservas este mes"
          value={stats.thisMonth.reservations}
          change={getChange(stats.thisMonth.reservations, stats.lastMonth.reservations)}
          icon={Calendar}
          iconColor="text-blue-500"
        />
        
        <StatCard
          title="Comensales totales"
          value={stats.thisMonth.covers}
          change={getChange(stats.thisMonth.covers, stats.lastMonth.covers)}
          icon={Users}
          iconColor="text-green-500"
        />
        
        <StatCard
          title="Ingresos estimados"
          value={`${stats.thisMonth.revenue.toLocaleString('es-ES')}€`}
          change={getChange(stats.thisMonth.revenue, stats.lastMonth.revenue)}
          icon={DollarSign}
          iconColor="text-emerald-500"
        />
        
        <StatCard
          title="Ticket promedio"
          value={`${stats.thisMonth.avgTicket}€`}
          change={getChange(stats.thisMonth.avgTicket, stats.lastMonth.avgTicket)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
        
        <StatCard
          title="Tasa de ocupación"
          value={`${stats.thisMonth.occupancy}%`}
          change={getChange(stats.thisMonth.occupancy, stats.lastMonth.occupancy)}
          icon={Clock}
          iconColor="text-orange-500"
        />
        
        <StatCard
          title="No-shows"
          value={stats.thisMonth.noShows}
          change={getChange(stats.lastMonth.noShows, stats.thisMonth.noShows)} // Invertido: menos es mejor
          icon={AlertCircle}
          iconColor="text-red-500"
          inverse
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Franjas horarias más populares</CardTitle>
            <CardDescription>Reservas y comensales por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeSlotData.map((slot, index) => (
                <div key={slot.slot} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{slot.slot}</span>
                    <div className="flex gap-4 text-gray-500">
                      <span>{slot.reservations} reservas</span>
                      <span>{slot.covers} comensales</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${(slot.covers / 156) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top 5 clientes del mes
            </CardTitle>
            <CardDescription>Basado en número de visitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {customer.visits} visitas · {customer.totalSpent}€ total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Fuente de reservas</CardTitle>
          <CardDescription>De dónde vienen las reservas este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceData.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-sm text-gray-500">
                      {source.reservations} reservas
                    </span>
                  </div>
                  <span className="font-semibold">{source.percentage}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Insights del mes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              ✓
            </div>
            <p>
              Las reservas han aumentado un{' '}
              <span className="font-semibold">
                {getChange(stats.thisMonth.reservations, stats.lastMonth.reservations).value}%
              </span>{' '}
              respecto al mes pasado
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              ✓
            </div>
            <p>
              La franja horaria más popular es de{' '}
              <span className="font-semibold">21:00-22:00</span> con 42 reservas
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              ✓
            </div>
            <p>
              Los no-shows han disminuido un{' '}
              <span className="font-semibold">
                {getChange(stats.lastMonth.noShows, stats.thisMonth.noShows).value}%
              </span>
              {' '}gracias a las confirmaciones automáticas
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              💡
            </div>
            <p>
              <span className="font-semibold">WhatsApp</span> es tu principal canal de reservas
              con un 60.7% del total
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, iconColor, inverse = false }) {
  const isPositive = inverse ? !change.isPositive : change.isPositive;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {change.value}%
              </span>
              <span className="text-gray-500">vs mes pasado</span>
            </div>
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};