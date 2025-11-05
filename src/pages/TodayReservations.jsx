import { useState, useEffect } from 'react';
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
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CreateAppointmentModal } from '@/components/layout/CreateAppointmentModal';

export function TodayReservations() {
  const { user } = useAuthStore();
  const navigate = useNavigate(); 
  const [filter, setFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [appointmentsData, statsData] = await Promise.all([
        api.getTodayReservations(),
        api.getReservationStats(),
      ]);

      setAppointments(appointmentsData.appointments || []);
      setStats(statsData.today || {});
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToAppointment = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('⚠️ ¿Estás seguro de que deseas eliminar esta cita?')) {
      return;
    }
    
    if (!confirm('Esta acción NO se puede deshacer. ¿Confirmas la eliminación?')) {
      return;
    }

    try {
      await api.deleteAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando {terminology.bookings.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {terminology.bookings} de Hoy
          </h1>
          <p className="text-white mt-1">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Button 
        variant="outline"
        onClick={() => setShowCreateModal(true)}>
          + Nueva {terminology.booking}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Confirmadas"
            value={stats.confirmado || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Pendientes"
            value={stats.pendiente || 0}
            icon={AlertCircle}
            color="yellow"
          />
          <StatsCard
            title="Completadas"
            value={stats.completada || 0}
            icon={CheckCircle}
            color="gray"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton
          label="Todas"
          count={appointments.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterButton
          label="Confirmadas"
          count={appointments.filter(a => a.status === 'confirmado').length}
          active={filter === 'confirmado'}
          onClick={() => setFilter('confirmado')}
        />
        <FilterButton
          label="Pendientes"
          count={appointments.filter(a => a.status === 'pendiente').length}
          active={filter === 'pendiente'}
          onClick={() => setFilter('pendiente')}
        />
        <FilterButton
          label="Completadas"
          count={appointments.filter(a => a.status === 'completada').length}
          active={filter === 'completada'}
          onClick={() => setFilter('completada')}
        />
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onNavigate={handleNavigateToAppointment}
            onDelete={handleDeleteAppointment}
            terminology={terminology}
          />
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-white" />
            <p className="mt-4 text-lg font-medium text-white">
              No hay {terminology.bookings.toLowerCase()} {filter !== 'all' && `con estado "${filter}"`}
            </p>
            <p className="mt-1 text-sm text-white">
              Las {terminology.bookings.toLowerCase()} aparecerán aquí cuando se creen
            </p>
          </CardContent>
        </Card>
      )}

      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadAppointments();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-black',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-white hover:bg-gray-800'
      )}
    >
      {label} ({count})
    </button>
  );
}

function AppointmentCard({ appointment, onNavigate, onDelete, terminology }) {
  const getStatusInfo = (status) => {
    const statusMap = {
      pendiente: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      confirmado: {
        label: 'Confirmada',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      completada: {
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
      },
      cancelada: {
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
      no_show: {
        label: 'No Show',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
      },
    };
    return statusMap[status] || statusMap.pendiente;
  };

  const statusInfo = getStatusInfo(appointment.status);
  const StatusIcon = statusInfo.icon;

  // Formatear hora (convertir UTC a Madrid)
  const appointmentDate = new Date(appointment.appointment_time);
  const timeStr = appointmentDate.toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onNavigate(appointment.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-lg font-semibold">{timeStr}</span>
              <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusInfo.color)}>
                <StatusIcon className="h-3 w-3 inline mr-1" />
                {statusInfo.label}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-white">
                <User className="h-4 w-4" />
                <span className="font-medium">{appointment.client_name}</span>
              </div>

              <div className="flex items-center gap-2 text-white">
                <Phone className="h-4 w-4" />
                <span>{appointment.client_phone}</span>
              </div>

              {/* ✅ MODIFICADO: Mostrar servicio + indicador */}
              {appointment.service_name && (
                <div className="flex items-center gap-2 text-white">
                  <Star className="h-4 w-4" />
                  <span>{appointment.service_name}</span>
                  {appointment.services_count > 1 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      +{appointment.services_count - 1} servicio{appointment.services_count > 2 ? 's' : ''}
                    </span>
                  )}
                  {appointment.duration_minutes && (
                    <span className="text-sm text-white">
                      ({appointment.duration_minutes} min)
                    </span>
                  )}
                </div>
              )}

              {appointment.notes && (
                <div className="flex items-start gap-2 text-white">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">{appointment.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate(appointment.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalles
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(appointment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};