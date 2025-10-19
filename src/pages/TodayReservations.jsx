import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users as UsersIcon, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Star,
  Eye,
  Download,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { CreateReservationModal } from '@/components/layout/CreateReservationModal';

export function TodayReservations() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isRestaurant = user?.business?.type === 'restaurant';
  const terminology = user?.business?.terminology || {
    booking: 'Reserva',
    bookings: 'Reservas',
    customer: 'Cliente',
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const [reservationsData, statsData] = await Promise.all([
        api.getTodayReservations(),
        api.getReservationStats(),
      ]);
      
      setReservations(reservationsData.reservations || []);
      setStats(statsData.today || {});
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = async (reservationId, newStatus) => {
    try {
      await api.updateReservationStatus(reservationId, newStatus);
      await loadReservations();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">{terminology.bookings} de hoy</h1>
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
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Phone className="mr-2 h-4 w-4" />
            Nueva {terminology.booking.toLowerCase()}
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
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.confirmed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Solo mostrar "En mesa" para restaurantes */}
        {isRestaurant && (
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
                  <p className="text-2xl font-bold">{stats?.seated || 0}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mostrar "Completadas" para no-restaurantes */}
        {!isRestaurant && (
          <Card 
            className={cn(
              'cursor-pointer transition-colors',
              filter === 'completed' && 'ring-2 ring-gray-500'
            )}
            onClick={() => setFilter('completed')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reservations List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredReservations.map((reservation) => (
          <ReservationCard 
            key={reservation.id} 
            reservation={reservation}
            onMarkStatus={handleMarkStatus}
            terminology={terminology}
          />
        ))}
      </div>

      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No hay {terminology.bookings.toLowerCase()} {filter !== 'all' && `con estado "${filter}"`}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Las {terminology.bookings.toLowerCase()} aparecerán aquí cuando se creen
            </p>
          </CardContent>
        </Card>
      )}

      <CreateReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadReservations();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

function ReservationCard({ reservation, onMarkStatus, terminology }) {
  const { user } = useAuthStore();
  const isRestaurant = user?.business?.type === 'restaurant';

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
      completed: {
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
      },
    };

    if (isRestaurant) {
      statusMap.seated = {
        label: 'En mesa',
        color: 'bg-blue-100 text-blue-800',
        icon: UsersIcon,
      };
    }

    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(reservation.status);
  const StatusIcon = statusInfo.icon;
  const customer = reservation.customers || {};

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              {customer.is_vip && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
            </div>
            <p className="text-sm text-gray-600">{customer.phone}</p>
          </div>
          
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{reservation.reservation_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{reservation.party_size} personas</span>
          </div>
        </div>

        {reservation.special_requests && (
          <div className="mt-2 rounded-lg bg-blue-50 p-2">
            <p className="text-xs font-semibold text-blue-900">Nota</p>
            <p className="text-xs text-blue-700">{reservation.special_requests}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {reservation.status === 'pending' && (
            <Button size="sm" className="flex-1" onClick={() => onMarkStatus(reservation.id, 'confirmed')}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Confirmar
            </Button>
          )}
          
          {reservation.status === 'confirmed' && isRestaurant && (
            <Button size="sm" className="flex-1" onClick={() => onMarkStatus(reservation.id, 'seated')}>
              <UsersIcon className="mr-1 h-4 w-4" />
              Marcar llegada
            </Button>
          )}

          {reservation.status === 'confirmed' && !isRestaurant && (
            <Button size="sm" className="flex-1" onClick={() => onMarkStatus(reservation.id, 'completed')}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Completar
            </Button>
          )}

          {reservation.status === 'seated' && (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onMarkStatus(reservation.id, 'completed')}>
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