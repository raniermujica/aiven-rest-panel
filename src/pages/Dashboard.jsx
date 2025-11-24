import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  ListChecks,
  BarChart3,
  Star,
  Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { CreateAppointmentModal } from '@/components/layout/CreateAppointmentModal';
import { BlockSlotModal } from '@/components/BlockSlotModal';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  console.log('👤 User en Dashboard:', user);
  console.log('🏢 Business en Dashboard:', user?.business);
  console.log('📝 Nombre del negocio:', user?.business?.name);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, statsData] = await Promise.all([
        api.getTodayReservations(),
        api.getReservationStats(),
      ]);
      
      setTodayAppointments(appointmentsData.appointments || []);
      setStats(statsData.today || {});
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlock = async (blockData) => {
    try {
      await api.createBlockedSlot(blockData);
      console.log('✅ Bloqueo creado exitosamente');
    } catch (error) {
      console.error('❌ Error creando bloqueo:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando panel...</p>
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
            Panel de Control
          </h1>
          <p className="text-white mt-1">
            Bienvenido, {user?.name} - {user?.business?.name}
          </p>
        </div>
        
        {/* ✅ BOTÓN BLOQUEAR DISPONIBILIDAD */}
        <Button
          onClick={() => setShowBlockModal(true)}
          variant="outline"
          className="border-red-600 text-red-400 hover:bg-red-900/20"
        >
          <Ban className="mr-2 h-4 w-4" />
          Bloquear Disponibilidad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title={`${terminology.bookings} Hoy`}
          value={stats?.total || 0}
          icon={Calendar}
          color="blue"
          onClick={() => navigate('/reservations/today')}
        />
        <StatsCard
          title="Confirmadas"
          value={stats?.confirmado || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Pendientes"
          value={stats?.pendiente || 0}
          icon={AlertCircle}
          color="yellow"
        />
        <StatsCard
          title="Completadas"
          value={stats?.completada || 0}
          icon={Clock}
          color="gray"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              icon={UserPlus}
              label={`Crear ${terminology.booking}`}
              description={`Nueva ${terminology.booking.toLowerCase()} manual`}
              onClick={() => setShowCreateModal(true)}
              color="blue"
            />
            <QuickActionButton
              icon={Star}
              label={`${terminology.customers} VIP`}
              description="Ver clientes destacados"
              onClick={() => navigate('/customers?filter=vip')}
              color="yellow"
            />
            <QuickActionButton
              icon={BarChart3}
              label="Ver Estadísticas"
              description="Análisis y métricas"
              onClick={() => navigate('/analytics')}
              color="purple"
            />
            <QuickActionButton
              icon={Ban}
              label="Bloquear Horarios"
              description="Gestionar disponibilidad"
              onClick={() => setShowBlockModal(true)}
              color="red"
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{terminology.bookings} de Hoy</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reservations')}
          >
            Ver Todas
          </Button>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-white mx-auto" />
              <p className="mt-4 text-white">
                No hay {terminology.bookings.toLowerCase()} para hoy
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Crear Primera {terminology.booking}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                />
              ))}
              {todayAppointments.length > 5 && (
                <div className="text-center pt-3 border-t">
                  <button
                    className="text-sm text-blue-300 hover:text-blue-700"
                    onClick={() => navigate('/reservations')}
                  >
                    Ver {todayAppointments.length - 5} {terminology.bookings.toLowerCase()} más
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadDashboardData();
          setShowCreateModal(false);
        }}
      />

      {/* ✅ MODAL BLOQUEO */}
      <BlockSlotModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSave={handleSaveBlock}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, onClick }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card 
      className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label, description, onClick, color, disabled }) {
  const colorClasses = {
    blue: 'bg-[#1a2f38] text-blue-400 hover:bg-[#09181f]',
    yellow: 'bg-[#1a2f38] text-yellow-400 hover:bg-[#09181f]',
    purple: 'bg-[#1a2f38] text-purple-400 hover:bg-[#09181f]',
    red: 'bg-[#1a2f38] text-red-400 hover:bg-[#09181f]',
    gray: 'bg-[#1a2f38] text-gray-500 cursor-not-allowed opacity-60',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-4 rounded-lg border border-gray-700
        transition-all text-left w-full
        ${disabled ? colorClasses.gray : colorClasses[color]}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[#0a1820]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

function AppointmentRow({ appointment, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-green-100 text-green-800',
      completada: 'bg-gray-100 text-gray-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pendiente;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  };

  // Formatear hora
  const appointmentDate = new Date(appointment.appointment_time);
  const madridDate = new Date(appointmentDate.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const timeStr = madridDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a2f38] rounded-lg hover:bg-[#09181f] transition-colors cursor-pointer border border-gray-700"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="text-center">
          <Clock className="h-5 w-5 text-white mx-auto" />
          <span className="text-sm font-semibold text-white mt-1 block">
            {timeStr}
          </span>
        </div>
        
        <div className="flex-1">
          <p className="font-medium text-white">{appointment.client_name}</p>
          <p className="text-sm text-gray-400">
            {appointment.service_name}
            {appointment.duration_minutes && ` • ${appointment.duration_minutes} min`}
          </p>
        </div>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
        {getStatusLabel(appointment.status)}
      </span>
    </div>
  );
};