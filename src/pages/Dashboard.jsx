import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Star, 
  TrendingUp,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function Dashboard() {
  // Datos de ejemplo (después vendrán del backend)
  const stats = {
    todayReservations: 12,
    todayCovers: 38,
    vipCustomers: 5,
    occupancyRate: 87,
    upcomingReservations: 3,
    pendingReservations: 2,
  };

  const upcomingReservations = [
    {
      id: 1,
      time: '14:00',
      customerName: 'Juan Pérez',
      partySize: 4,
      status: 'confirmed',
    },
    {
      id: 2,
      time: '14:30',
      customerName: 'María García',
      partySize: 2,
      status: 'pending',
    },
    {
      id: 3,
      time: '15:00',
      customerName: 'Carlos López',
      partySize: 6,
      status: 'confirmed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Resumen de actividad de hoy - {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Ver calendario
          </Button>
          <Button>
            <Phone className="mr-2 h-4 w-4" />
            Nueva reserva
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Reservas de hoy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReservations}</div>
            <p className="text-xs text-gray-500">
              {stats.pendingReservations} pendientes de confirmar
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Comensales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comensales totales
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCovers}</div>
            <p className="text-xs text-green-600">
              +12% vs ayer
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Clientes VIP */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes VIP hoy
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vipCustomers}</div>
            <p className="text-xs text-gray-500">
              Requieren atención especial
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Tasa de ocupación */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación estimada
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-gray-500">
              Capacidad máxima: 50 personas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximas reservas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximas reservas (2 horas)</CardTitle>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-lg font-bold text-blue-600">
                        {reservation.time}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{reservation.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {reservation.partySize} personas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {reservation.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Confirmada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        <AlertCircle className="h-3 w-3" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                Ver todas las reservas de hoy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start h-auto py-4">
                <Calendar className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Crear reserva manual</div>
                  <div className="text-xs text-gray-500">Agendar nueva reserva desde el panel</div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4">
                <Users className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Gestionar lista de espera</div>
                  <div className="text-xs text-gray-500">Ver clientes en espera de mesa</div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4">
                <Star className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Clientes VIP</div>
                  <div className="text-xs text-gray-500">Ver y gestionar clientes VIP</div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4">
                <TrendingUp className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Ver estadísticas</div>
                  <div className="text-xs text-gray-500">Análisis y reportes del restaurante</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Sistema de IA activo</h3>
            <p className="text-sm text-blue-700">
              El agente de WhatsApp está respondiendo automáticamente. Tienes 3 conversaciones activas.
            </p>
          </div>
          <Button variant="outline" className="bg-white">
            Ver conversaciones
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};