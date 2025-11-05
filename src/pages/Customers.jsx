import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterVip, setFilterVip] = useState(searchParams.get('filter') === 'vip');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (!urlSearch && searchTerm) {
      setSearchTerm('');
    }

    loadCustomers();
    loadStats();
  }, [filterVip]);

  const loadCustomers = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      const params = {};

      if (filterVip) {
        params.is_vip = 'true';
      }

      const data = await api.getCustomers(params);
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
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
    navigate(`/customers/${customer.id}`);
  };

  // ✅ FILTRADO LOCAL (igual que AllReservations)
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando {terminology.customers.toLowerCase()}...</p>
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
            {terminology.customers}
          </h1>
          <p className="text-gray-400 mt-1">
            Gestiona tu base de {terminology.customers.toLowerCase()}
          </p>
        </div>
        <Button 
        variant="outline"
        onClick={() => setShowCreateModal(true)}>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={`Buscar ${terminology.customers.toLowerCase()}...`}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* VIP Filter */}
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
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredCustomers.length} {terminology.customers}
            {filterVip && ' VIP'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-white">
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
              {filteredCustomers.map((customer) => (
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

      {/* Modals */}
      {showCreateModal && (
        <CreateCustomerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadCustomers();
            loadStats();
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={() => {
            loadCustomers();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-500/30',
    yellow: 'bg-yellow-900/20 border-yellow-500/30',
    green: 'bg-green-900/20 border-green-500/30',
  };

  const iconClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <Card className={cn('border-2', colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
          </div>
          <div className={cn('p-3 rounded-full', iconClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerCard({ customer, onToggleVip, onView, onDelete }) {
  return (
  <div className="bg-[#0a1820] p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0',
          customer.is_vip ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
        )}>
          {customer.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{customer.name}</h3>
            {customer.is_vip && (
              <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1 text-sm text-gray-400">
            {customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(customer)}
          className="flex-1 md:flex-none"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleVip(customer.id)}
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
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);
}

function CreateCustomerModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nuevo Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
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
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{customer.name}</h2>
              <p className="text-sm text-gray-400">{customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-white mb-4">Últimas Citas</h3>
          {loading ? (
            <p className="text-gray-400">Cargando...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-400">No hay citas registradas</p>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-3 bg-[#0a1820] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{apt.service_name}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(apt.appointment_time).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};