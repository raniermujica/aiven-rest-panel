import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  Users as UsersIcon, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Star,
  AlertTriangle,
  MessageSquare,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TodayReservations() {
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed

  // Datos de ejemplo (después vendrán del backend)
  const reservations = [
    {
      id: 1,
      time: '14:00',
      customerName: 'Juan Pérez',
      phone: '+34 600 123 456',
      partySize: 4,
      status: 'confirmed',
      isVIP: false,
      table: 'Mesa 5',
      notes: 'Cumpleaños, necesitan velas',
      allergies: null,
    },
    {
      id: 2,
      time: '14:30',
      customerName: 'María García',
      phone: '+34 600 789 012',
      partySize: 2,
      status: 'pending',
      isVIP: true,
      table: 'Mesa 12',
      notes: null,
      allergies: ['Gluten', 'Lactosa'],
    },
    {
      id: 3,
      time: '15:00',
      customerName: 'Carlos López',
      phone: '+34 600 345 678',
      partySize: 6,
      status: 'confirmed',
      isVIP: false,
      table: 'Mesa 8',
      notes: 'Prefieren terraza',
      allergies: null,
    },
    {
      id: 4,
      time: '21:00',
      customerName: 'Ana Martínez',
      phone: '+34 600 901 234',
      partySize: 2,
      status: 'seated',
      isVIP: true,
      table: 'Mesa 3',
      notes: 'Aniversario',
      allergies: ['Mariscos'],
    },
    {
      id: 5,
      time: '21:30',
      customerName: 'Pedro Sánchez',
      phone: '+34 600 567 890',
      partySize: 8,
      status: 'pending',
      isVIP: false,
      table: null,
      notes: 'Evento corporativo',
      allergies: null,
    },
  ];

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas de hoy</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button size="sm">
            <Phone className="mr-2 h-4 w-4" />
            Nueva reserva
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={cn(
            'cursor-pointer transition-colors',
            filter === 'all' && 'ring-2 ring-blue-500'
          )}
          onClick={() => setFilter('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            'cursor-pointer transition-colors',
            filter === 'pending' && 'ring-2 ring-yellow-500'
          )}
          onClick={() => setFilter('pending')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            'cursor-pointer transition-colors',
            filter === 'confirmed' && 'ring-2 ring-green-500'
          )}
          onClick={() => setFilter('confirmed')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Confirmadas</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            'cursor-pointer transition-colors',
            filter === 'seated' && 'ring-2 ring-blue-500'
          )}
          onClick={() => setFilter('seated')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">En mesa</p>
                <p className="text-2xl font-bold">{stats.seated}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredReservations.map((reservation) => (
          <ReservationCard 
            key={reservation.id} 
            reservation={reservation} 
          />
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No hay reservas {filter !== 'all' && `con estado "${filter}"`}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Las reservas aparecerán aquí cuando se creen
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReservationCard({ reservation }) {
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      confirmed: {
        label: 'Confirmada',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      seated: {
        label: 'En mesa',
        color: 'bg-blue-100 text-blue-800',
        icon: UsersIcon,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(reservation.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      reservation.isVIP && 'ring-2 ring-yellow-400'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Time Badge */}
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-blue-100">
              <span className="text-xs font-medium text-blue-600">
                {reservation.time.split(':')[0]}
              </span>
              <span className="text-lg font-bold text-blue-600">
                {reservation.time.split(':')[1]}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {reservation.customerName}
                </h3>
                {reservation.isVIP && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">{reservation.phone}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusInfo.color
          )}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {reservation.partySize} personas
            </span>
          </div>
          
          {reservation.table && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{reservation.table}</span>
            </div>
          )}
        </div>

        {/* Alerts */}
        {reservation.allergies && reservation.allergies.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-900">Alergias</p>
              <p className="text-xs text-red-700">
                {reservation.allergies.join(', ')}
              </p>
            </div>
          </div>
        )}

        {reservation.notes && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900">Nota</p>
              <p className="text-xs text-blue-700">{reservation.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {reservation.status === 'pending' && (
            <Button size="sm" className="flex-1">
              <CheckCircle className="mr-1 h-4 w-4" />
              Confirmar
            </Button>
          )}
          
          {reservation.status === 'confirmed' && (
            <Button size="sm" className="flex-1">
              <UsersIcon className="mr-1 h-4 w-4" />
              Marcar llegada
            </Button>
          )}

          {reservation.status === 'seated' && (
            <Button size="sm" variant="outline" className="flex-1">
              <CheckCircle className="mr-1 h-4 w-4" />
              Finalizar
            </Button>
          )}

          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="outline">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};