import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Star,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
  StarOff,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Customers() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVip, setFilterVip] = useState(searchParams.get('filter') === 'vip');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [filterVip]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterVip) {
        params.is_vip = 'true';
      }

      const data = await api.getCustomers(params);
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getCustomerStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleToggleVip = async (customerId) => {
    try {
      await api.toggleCustomerVip(customerId);
      await loadCustomers();
      await loadStats();
    } catch (error) {
      console.error('Error cambiando estado VIP:', error);
      alert('Error al cambiar el estado VIP');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.deleteCustomer(customerId);
      await loadCustomers();
      await loadStats();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente. Puede tener citas asociadas.');
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando {terminology.customers.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {terminology.customers}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu base de {terminology.customers.toLowerCase()}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo {terminology.customer}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={`Total ${terminology.customers}`}
            value={stats.total}
            icon={User}
            color="blue"
          />
          <StatsCard
            title={`${terminology.customers} VIP`}
            value={stats.vip}
            icon={Star}
            color="yellow"
          />
          <StatsCard
            title="Nuevos Este Mes"
            value={stats.newThisMonth}
            icon={TrendingUp}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={`Buscar ${terminology.customers.toLowerCase()}...`}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {/* VIP Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterVip ? "default" : "outline"}
                onClick={() => {
                  setFilterVip(!filterVip);
                  if (!filterVip) {
                    setSearchParams({ filter: 'vip' });
                  } else {
                    setSearchParams({});
                  }
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Solo VIP
              </Button>
              <Button
                variant="outline"
                onClick={loadCustomers}
              >
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {customers.length} {terminology.customers}
            {filterVip && ' VIP'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">
                No hay {terminology.customers.toLowerCase()} 
                {filterVip && ' VIP'} {searchTerm && ' que coincidan con la búsqueda'}
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                Agregar Primer {terminology.customer}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onToggleVip={handleToggleVip}
                  onView={handleViewCustomer}
                  onDelete={handleDeleteCustomer}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadCustomers();
            loadStats();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={() => {
            loadCustomers();
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
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

function CustomerCard({ customer, onToggleVip, onView, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-blue-600">
            {customer.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{customer.name}</span>
            {customer.is_vip && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            {customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-semibold text-gray-900">{customer.total_visits || 0}</p>
            <p className="text-gray-500">Visitas</p>
          </div>
          {customer.first_visit_at && (
            <div className="text-center">
              <p className="text-gray-500">Primera visita</p>
              <p className="font-medium text-gray-700">
                {new Date(customer.first_visit_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(customer)}
          title="Ver detalles"
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleVip(customer.id)}
          title={customer.is_vip ? 'Quitar VIP' : 'Marcar como VIP'}
        >
          {customer.is_vip ? (
            <StarOff className="h-4 w-4" />
          ) : (
            <Star className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(customer.id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CreateCustomerModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.phone) {
      setError('Nombre y teléfono son requeridos');
      setLoading(false);
      return;
    }

    try {
      await api.createCustomer(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creando cliente:', error);
      setError(error.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Nuevo Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="34612345678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, onUpdate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerDetails();
  }, [customer.id]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomer(customer.id);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {customer.name}
                {customer.is_vip && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </h2>
              <p className="text-sm text-gray-500">{customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3">Información de Contacto</h3>
            <div className="space-y-2 text-sm">
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-semibold mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Visitas</p>
                <p className="text-2xl font-bold">{customer.total_visits || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Primera Visita</p>
                <p className="text-lg font-semibold">
                  {customer.first_visit_at 
                    ? new Date(customer.first_visit_at).toLocaleDateString('es-ES')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div>
            <h3 className="font-semibold mb-3">Últimas Citas</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-gray-500">No hay citas registradas</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((apt) => {
                  const date = new Date(apt.scheduled_date);
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{apt.service_name}</p>
                        <p className="text-gray-600">
                          {date.toLocaleDateString('es-ES')} - {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs',
                        apt.status === 'completada' ? 'bg-green-100 text-green-800' :
                        apt.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {apt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {customer.notes && (
            <div>
              <h3 className="font-semibold mb-3">Notas</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};