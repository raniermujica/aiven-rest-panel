import { useState, useEffect } from 'react';
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
  Users,
  UserPlus,
  Eye,
  Edit,
  Cake,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Customers() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVIP, setFilterVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    loadCustomers();
  }, [filterVIP]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filterVIP) params.vipOnly = 'true';
      if (searchTerm) params.search = searchTerm;

      const [customersData, statsData] = await Promise.all([
        api.getCustomers(params),
        api.getCustomerStats(),
      ]);
      
      setCustomers(customersData.customers || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCustomers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
            {terminology.customers}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu base de datos de {terminology.customers.toLowerCase()}
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo {terminology.customer.toLowerCase()}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total {terminology.customers.toLowerCase()}
                </p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {terminology.customers} VIP
                </p>
                <p className="text-2xl font-bold">{stats?.vip || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Nuevos este mes
                </p>
                <p className="text-2xl font-bold">{stats?.newThisMonth || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={`Buscar por nombre, teléfono o email...`}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch}>
              Buscar
            </Button>
            <Button
              variant={filterVIP ? 'default' : 'outline'}
              onClick={() => setFilterVIP(!filterVIP)}
            >
              <Star className="mr-2 h-4 w-4" />
              Solo VIP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} terminology={terminology} />
        ))}
      </div>

      {customers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No se encontraron {terminology.customers.toLowerCase()}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterVIP 
                ? 'Intenta cambiar los filtros de búsqueda'
                : `Los ${terminology.customers.toLowerCase()} aparecerán aquí cuando se registren`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CreateCustomerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadCustomers();
          }}
          terminology={terminology}
        />
      )}
    </div>
  );
}

function CustomerCard({ customer, terminology }) {
  const preferences = customer.customer_preferences?.[0] || {};
  const hasAlerts = preferences.allergies?.length > 0 || preferences.dietary_restrictions?.length > 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <span className="text-lg font-bold text-blue-600">
                {customer.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                {customer.is_vip && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {customer.total_visits || 0} visitas
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {customer.email}
            </div>
          )}
          {customer.birthday && (
            <div className="flex items-center gap-2 text-gray-600">
              <Cake className="h-4 w-4 text-gray-400" />
              {new Date(customer.birthday).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>

        {/* Alerts */}
        {hasAlerts && (
          <div className="rounded-lg bg-red-50 p-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-900">Alerta</p>
                {preferences.allergies?.length > 0 && (
                  <p className="text-xs text-red-700">
                    Alergias: {preferences.allergies.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="mr-1 h-4 w-4" />
            Ver perfil
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCustomerModal({ onClose, onSuccess, terminology }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    isVIP: false,
    notes: '',
    allergies: '',
    dietaryRestrictions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.createCustomer({
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        dietaryRestrictions: formData.dietaryRestrictions ? formData.dietaryRestrictions.split(',').map(s => s.trim()) : [],
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error creando cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Nuevo {terminology.customer}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+34 600 123 456"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Alergias (separadas por comas)
              </label>
              <Input
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Ej: gluten, mariscos"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vip"
                checked={formData.isVIP}
                onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
              />
              <label htmlFor="vip" className="text-sm font-medium text-gray-700">
                Marcar como VIP
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creando...' : 'Crear cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};