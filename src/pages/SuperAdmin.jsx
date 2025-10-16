import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  Building2,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { api } from '@/services/api';
import { BUSINESS_TYPES } from '@/config/businessTypes';

export function SuperAdmin() {
  const [businesses, setBusinesses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await api.listBusinesses();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error cargando negocios:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel SuperAdmin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todos los negocios de la plataforma
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear nuevo negocio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total negocios</p>
                <p className="text-2xl font-bold">{businesses.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold">
                  {businesses.filter(b => b.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Restaurantes</p>
                <p className="text-2xl font-bold">
                  {businesses.filter(b => b.business_type === 'restaurant').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Salones/Clínicas</p>
                <p className="text-2xl font-bold">
                  {businesses.filter(b => b.business_type !== 'restaurant').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateBusinessForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadBusinesses();
          }}
        />
      )}

      {/* Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>Negocios registrados</CardTitle>
          <CardDescription>
            Listado de todos los negocios en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}

            {businesses.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-medium text-gray-900">
                  No hay negocios creados
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Crea el primer negocio para comenzar
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateBusinessForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    businessType: 'restaurant',
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.createBusiness(formData);
      setSuccess(response);
    } catch (err) {
      setError(err.message || 'Error creando negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generar slug desde el nombre
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  if (success) {
    return (
      <Card className="fixed inset-0 z-50 m-4 overflow-y-auto md:m-auto md:max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            ¡Negocio creado exitosamente!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">Información del negocio</h3>
            <div className="mt-2 space-y-1 text-sm text-green-800">
              <p><strong>Nombre:</strong> {success.business.name}</p>
              <p><strong>Tipo:</strong> {BUSINESS_TYPES[success.business.type]?.name}</p>
              <p><strong>Slug:</strong> {success.business.slug}</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Credenciales del administrador</h3>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p><strong>Nombre:</strong> {success.admin.name}</p>
              <p><strong>Email:</strong> {success.admin.email}</p>
              <p><strong>Contraseña temporal:</strong> {success.admin.temporaryPassword}</p>
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">URL de acceso</h3>
            <div className="mt-2 flex items-center gap-2">
              <Input 
                value={success.business.url} 
                readOnly 
                className="bg-white"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(success.business.url);
                  alert('URL copiada al portapapeles');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={() => {
                onSuccess();
                onClose();
              }}
            >
              Cerrar
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(success.business.url, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir panel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Crear nuevo negocio</CardTitle>
          <CardDescription>
            Configura un nuevo negocio y crea el usuario administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Tipo de negocio */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tipo de negocio *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                {Object.entries(BUSINESS_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre del negocio */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre del negocio *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Restaurante El Buen Sabor"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Slug (URL única) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="ej: buen-sabor"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                URL: {window.location.origin}/{formData.slug || 'slug'}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Datos del administrador</h3>

              {/* Nombre admin */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Nombre completo *
                </label>
                <Input
                  value={formData.adminName}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              {/* Email admin */}
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  placeholder="admin@negocio.com"
                  required
                />
              </div>

              {/* Password admin */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Contraseña temporal *
                </label>
                <Input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => handleChange('adminPassword', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
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
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear negocio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessCard({ business }) {
  const config = BUSINESS_TYPES[business.business_type] || BUSINESS_TYPES.restaurant;
  
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${config.color}-100`}>
          <Building2 className={`h-6 w-6 text-${config.color}-600`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{business.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              business.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {business.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span>{config.name}</span>
            <span>•</span>
            <span>{business.url}</span>
            <span>•</span>
            <span>{business.restaurant_users?.length || 0} usuarios</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(business.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};