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
  Phone,
  User,
  Trash2,
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CreateAppointmentModal } from '@/components/layout/CreateAppointmentModal';

export function AllReservations() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, statusFilter]);

  const loadAppointments = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const params = {
        date: selectedDate,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await api.getReservations(params);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
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

  // Filtrar por búsqueda
  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      apt.client_name?.toLowerCase().includes(search) ||
      apt.client_phone?.toLowerCase().includes(search) ||
      apt.service_name?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pendiente: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      confirmado: {
        label: 'Confirmada',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      completada: {
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle
      },
      cancelada: {
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      no_show: {
        label: 'No Show',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle
      },
    };
    return statusMap[status] || statusMap.pendiente;
  };

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
            Todas las {terminology.bookings}
          </h1>
          <p className="text-gray-400 mt-1">
            Gestiona todas las {terminology.bookings.toLowerCase()} de tu negocio
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Nueva {terminology.booking}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="h-4 w-4 inline mr-2" />
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-600 bg-[#1a2f38] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmado">Confirmadas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="h-4 w-4 inline mr-2" />
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Cliente, teléfono o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total"
          value={filteredAppointments.length}
          color="blue"
        />
        <StatCard
          label="Confirmadas"
          value={filteredAppointments.filter(a => a.status === 'confirmado').length}
          color="green"
        />
        <StatCard
          label="Pendientes"
          value={filteredAppointments.filter(a => a.status === 'pendiente').length}
          color="yellow"
        />
        <StatCard
          label="Completadas"
          value={filteredAppointments.filter(a => a.status === 'completada').length}
          color="gray"
        />
        <StatCard
          label="Canceladas"
          value={filteredAppointments.filter(a => a.status === 'cancelada').length}
          color="red"
        />
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredAppointments.length} {terminology.bookings}
            {selectedDate && ` - ${new Date(selectedDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-white">
                No hay {terminology.bookings.toLowerCase()} para esta fecha
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Crear {terminology.booking}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onNavigate={handleNavigateToAppointment}
                  onDelete={handleDeleteAppointment}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
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

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-900/20',
    green: 'border-green-500/30 bg-green-900/20',
    yellow: 'border-yellow-500/30 bg-yellow-900/20',
    gray: 'border-gray-500/30 bg-gray-800/50',
    red: 'border-red-500/30 bg-red-900/20',
  };

  return (
    <div className={cn('p-4 rounded-lg border-2', colorClasses[color])}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
    </div>
  );
}

function AppointmentCard({ appointment, onNavigate, onDelete, getStatusBadge }) {
  const statusInfo = getStatusBadge(appointment.status);
  const StatusIcon = statusInfo.icon;

  // Formatear fecha y hora
  const appointmentDate = new Date(appointment.appointment_time);
  const timeStr = appointmentDate.toLocaleTimeString('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a2f38] rounded-lg hover:bg-[#09181f] transition-colors border border-gray-700 cursor-pointer"
      onClick={() => onNavigate(appointment.id)}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Time */}
        <div className="text-center min-w-[80px]">
          <Clock className="h-5 w-5 text-gray-400 mx-auto" />
          <span className="text-sm font-semibold text-white mt-1 block">
            {timeStr}
          </span>
        </div>

        {/* Client Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-white">{appointment.client_name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">{appointment.client_phone}</span>
          </div>
        </div>

        {/* Service */}
        <div className="hidden md:block flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-white truncate">{appointment.service_name}</span>
            {/* ✅ AGREGADO: Indicador de servicios adicionales */}
            {appointment.services_count > 1 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex-shrink-0">
                +{appointment.services_count - 1}
              </span>
            )}
          </div>
          {appointment.duration_minutes && (
            <p className="text-xs text-gray-400 mt-1 ml-6">
              {appointment.duration_minutes} minutos
            </p>
          )}
        </div>

        {/* Status */}
        <div className="min-w-[120px]">
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium inline-flex items-center', statusInfo.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onNavigate(appointment.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
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
  );
};