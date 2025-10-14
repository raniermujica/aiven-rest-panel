import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Clock,
  Phone,
  Star,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AllReservations() {
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Datos de ejemplo
  const reservations = [
    {
      id: 1,
      date: '2025-10-15',
      time: '14:00',
      customerName: 'Juan Pérez',
      phone: '+34 600 123 456',
      partySize: 4,
      status: 'confirmed',
      isVIP: false,
      table: 'Mesa 5',
      source: 'whatsapp',
    },
    {
      id: 2,
      date: '2025-10-15',
      time: '21:00',
      customerName: 'María García',
      phone: '+34 600 789 012',
      partySize: 2,
      status: 'confirmed',
      isVIP: true,
      table: 'Mesa 12',
      source: 'manual',
    },
    {
      id: 3,
      date: '2025-10-16',
      time: '14:30',
      customerName: 'Carlos López',
      phone: '+34 600 345 678',
      partySize: 6,
      status: 'pending',
      isVIP: false,
      table: null,
      source: 'web',
    },
    {
      id: 4,
      date: '2025-10-16',
      time: '21:30',
      customerName: 'Ana Martínez',
      phone: '+34 600 901 234',
      partySize: 2,
      status: 'cancelled',
      isVIP: true,
      table: 'Mesa 3',
      source: 'phone',
    },
    {
      id: 5,
      date: '2025-10-17',
      time: '15:00',
      customerName: 'Pedro Sánchez',
      phone: '+34 600 567 890',
      partySize: 8,
      status: 'confirmed',
      isVIP: false,
      table: 'Mesa 8',
      source: 'whatsapp',
    },
  ];

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         res.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedByDate = filteredReservations.reduce((acc, res) => {
    if (!acc[res.date]) acc[res.date] = [];
    acc[res.date].push(res);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todas las reservas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todas las reservas del restaurante
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva reserva
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                Todas
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pendientes
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('confirmed')}
              >
                Confirmadas
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('cancelled')}
              >
                Canceladas
              </Button>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex gap-2">
              <Button
                size="sm"
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
              >
                Lista
              </Button>
              <Button
                size="sm"
                variant={view === 'calendar' ? 'default' : 'outline'}
                onClick={() => setView('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {view === 'list' && (
        <div className="space-y-6">
          {Object.keys(groupedByDate).sort().map(date => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({groupedByDate[date].length} reservas)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {groupedByDate[date].map(reservation => (
                    <ReservationRow key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredReservations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-medium text-gray-900">
                  No se encontraron reservas
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Intenta cambiar los filtros de búsqueda
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Calendar View (placeholder) */}
      {view === 'calendar' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <CalendarIcon className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Vista de calendario
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Próximamente: vista de calendario interactivo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReservationRow({ reservation }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || colors.pending;
  };

  const getSourceIcon = (source) => {
    const icons = {
      whatsapp: '💬',
      manual: '✍️',
      web: '🌐',
      phone: '📞',
    };
    return icons[source] || '📝';
  };

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-blue-100">
          <span className="text-xs font-medium text-blue-600">
            {reservation.time.split(':')[0]}
          </span>
          <span className="text-sm font-bold text-blue-600">
            {reservation.time.split(':')[1]}
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {reservation.customerName}
            </span>
            {reservation.isVIP && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {reservation.phone}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {reservation.partySize} personas
            </span>
            {reservation.table && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reservation.table}
              </span>
            )}
            <span className="text-xs">
              {getSourceIcon(reservation.source)} {reservation.source}
            </span>
          </div>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-3">
        <span className={cn(
          'rounded-full px-3 py-1 text-xs font-medium',
          getStatusColor(reservation.status)
        )}>
          {reservation.status === 'pending' && 'Pendiente'}
          {reservation.status === 'confirmed' && 'Confirmada'}
          {reservation.status === 'cancelled' && 'Cancelada'}
          {reservation.status === 'completed' && 'Completada'}
        </span>

        <Button size="sm" variant="outline">
          Ver detalles
        </Button>
      </div>
    </div>
  );
};