import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Star,
  Phone,
  CalendarPlus,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { CreateAppointmentModal } from '@/components/layout/CreateAppointmentModal';

export function CustomerProfile() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [customer, setCustomer] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    booking: 'Cita',
    bookings: 'Citas',
  };

  useEffect(() => {
    loadCustomerProfile();
  }, [customerId]);

  const loadCustomerProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomerProfile(customerId);
      setCustomer(data.customer);
      setAppointments(data.appointments);
      setStats(data.stats);
      setEditForm(data.customer);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      alert('Error al cargar el perfil del cliente');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = (didCreate) => {
    setShowCreateModal(false);
    if (didCreate) {
      loadCustomerProfile(); 
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.updateCustomer(customerId, {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        notes: editForm.notes,
      });
      setIsEditing(false);
      await loadCustomerProfile();
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      alert('Error al actualizar el cliente');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar a ${customer.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.deleteCustomer(customerId);
      navigate('/customers');
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente. Puede tener citas asociadas.');
    }
  };

  const handleToggleVip = async () => {
    try {
      await api.toggleCustomerVip(customerId);
      await loadCustomerProfile();
    } catch (error) {
      console.error('Error cambiando estado VIP:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Cliente no encontrado</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Volver a {terminology.customers}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/customers')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <CalendarPlus className="h-4 w-4" />
              Agendar {terminology.booking}
            </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="gap-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(customer);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Perfil del cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold',
              customer.is_vip ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
            )}>
              {customer.name.charAt(0).toUpperCase()}
              <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={handleModalClose} // Llama a la nueva función al cerrar
        onSuccess={() => handleModalClose(true)} // Llama a la función y recarga

        // Esta es la parte clave: precarga los datos del cliente
        initialCustomer={{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        }}
      />
            </div>

            {/* Info principal */}
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{customer.name}</h1>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleToggleVip}
                      className={cn(
                        'gap-1',
                        customer.is_vip && 'bg-yellow-500 text-white hover:bg-yellow-600'
                      )}
                    >
                      <Star className={cn('h-4 w-4', customer.is_vip && 'fill-current')} />
                      {customer.is_vip ? 'VIP' : 'Marcar VIP'}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nombre
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Teléfono
                    </label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatCard
                icon={Calendar}
                label="Total Visitas"
                value={stats.totalVisits}
                color="blue"
              />
              <StatCard
                icon={DollarSign}
                label="Total Gastado"
                value={`€${stats.totalSpent}`}
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Promedio/Visita"
                value={`€${stats.averageSpent}`}
                color="purple"
              />
              <StatCard
                icon={Clock}
                label="Última Visita"
                value={stats.lastVisitDate 
                  ? new Date(stats.lastVisitDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                  : 'N/A'}
                color="orange"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <TabButton
          active={activeTab === 'info'}
          onClick={() => setActiveTab('info')}
        >
          Información
        </TabButton>
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </TabButton>
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Notas</h3>
            {!isEditing ? (
              <p className="text-gray-300">
                {customer.notes || 'Sin notas adicionales'}
              </p>
            ) : (
              <textarea
                className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notas sobre el cliente..."
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">
              Historial de {terminology.bookings}
            </h3>
            {appointments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No hay {terminology.bookings.toLowerCase()} registradas
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <AppointmentItem
                    key={apt.id}
                    appointment={apt}
                    terminology={terminology}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Servicios Favoritos
              </h3>
              {stats?.favoriteServices?.length > 0 ? (
                <div className="space-y-3">
                  {stats.favoriteServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-300">{service.name}</span>
                      <span className="text-blue-500 font-semibold">
                        {service.count} {service.count === 1 ? 'vez' : 'veces'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No hay datos suficientes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Resumen</h3>
              <div className="space-y-3">
                <InfoRow
                  label="Primera visita"
                  value={stats?.firstVisit 
                    ? new Date(stats.firstVisit).toLocaleDateString('es-ES')
                    : 'N/A'}
                />
                <InfoRow
                  label="Visitas completadas"
                  value={stats?.completedVisits || 0}
                />
                <InfoRow
                  label="Cliente desde"
                  value={customer.first_visit_at 
                    ? `${Math.floor((new Date() - new Date(customer.first_visit_at)) / (1000 * 60 * 60 * 24))} días`
                    : 'N/A'}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="bg-[#0a1820] p-4 rounded-lg border border-gray-700">
      <Icon className={cn('h-5 w-5 mb-2', colors[color])} />
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 font-medium transition-colors',
        active
          ? 'text-blue-500 border-b-2 border-blue-500'
          : 'text-gray-400 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function AppointmentItem({ appointment, terminology }) {
  const getStatusColor = (status) => {
    const colors = {
      completada: 'bg-green-100 text-green-800',
      confirmado: 'bg-blue-100 text-blue-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pendiente;
  };

  const date = new Date(appointment.appointment_time);
  const dateStr = date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="flex items-center justify-between p-4 bg-[#0a1820] rounded-lg border border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-medium text-white">{appointment.service_name}</span>
          <span className={cn('px-2 py-0.5 rounded-full text-xs', getStatusColor(appointment.status))}>
            {appointment.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{dateStr}</span>
          <span>{timeStr}</span>
          {appointment.duration_minutes && <span>{appointment.duration_minutes} min</span>}
        </div>
      </div>
      {appointment.amount_paid > 0 && (
        <div className="text-right">
          <p className="text-lg font-semibold text-green-500">
            €{parseFloat(appointment.amount_paid).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
};