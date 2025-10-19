import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function AllReservations() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const isRestaurant = user?.business?.type === 'restaurant';
  const terminology = user?.business?.terminology || {
    booking: 'Reserva',
    bookings: 'Reservas',
  };

  useEffect(() => {
    loadReservations();
  }, [selectedDate, statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      const params = {
        date: selectedDate,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await api.getReservations(params);
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
      no_show: { label: 'No show', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    if (isRestaurant) {
      statusMap.seated = { label: 'En mesa', color: 'bg-blue-100 text-blue-800', icon: Users };
    }

    return statusMap[status] || statusMap.pending;
  };

  const statuses = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    ...(isRestaurant ? [{ value: 'seated', label: 'En mesa' }] : []),
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Todas las {terminology.bookings.toLowerCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Historial completo de {terminology.bookings.toLowerCase()}
          </p>
        </div>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Date Picker */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadReservations}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {terminology.bookings} - {new Date(selectedDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Hora</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Contacto</th>
                    <th className="pb-3 font-medium">Personas</th>
                    <th className="pb-3 font-medium">Mesa</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reservations.map((reservation) => {
                    const statusInfo = getStatusBadge(reservation.status);
                    const StatusIcon = statusInfo.icon;
                    const customer = reservation.customers || {};

                    return (
                      <tr key={reservation.id} className="text-sm">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {reservation.reservation_time.substring(0, 5)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium">{customer.name || 'N/A'}</div>
                        </td>
                        <td className="py-4">
                          <div className="text-gray-600">{customer.phone || 'N/A'}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            {reservation.party_size}
                          </div>
                        </td>
                        <td className="py-4">
                          {reservation.tables?.table_number || '-'}
                        </td>
                        <td className="py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            statusInfo.color
                          )}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                No hay {terminology.bookings.toLowerCase()} para esta fecha
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Selecciona otra fecha o estado para ver más resultados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};