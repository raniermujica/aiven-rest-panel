import { useState } from 'react';
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
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  MessageSquare,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVIP, setFilterVIP] = useState(false);

  // Datos de ejemplo
  const customers = [
    {
      id: 1,
      name: 'Juan Pérez',
      phone: '+34 600 123 456',
      email: 'juan.perez@email.com',
      isVIP: true,
      totalVisits: 15,
      lastVisit: '2025-10-10',
      firstVisit: '2024-03-15',
      avgSpending: 65,
      birthday: '1985-05-20',
      allergies: ['Gluten'],
      favoriteTable: 'Mesa 5',
      notes: 'Le gusta la terraza. Siempre pide vino tinto.',
    },
    {
      id: 2,
      name: 'María García',
      phone: '+34 600 789 012',
      email: 'maria.garcia@email.com',
      isVIP: true,
      totalVisits: 23,
      lastVisit: '2025-10-12',
      firstVisit: '2023-11-20',
      avgSpending: 85,
      birthday: '1990-08-15',
      allergies: ['Lactosa', 'Mariscos'],
      favoriteTable: 'Mesa 12',
      notes: 'Cliente muy fiel. Celebra aniversario cada año.',
    },
    {
      id: 3,
      name: 'Carlos López',
      phone: '+34 600 345 678',
      email: 'carlos.lopez@email.com',
      isVIP: false,
      totalVisits: 5,
      lastVisit: '2025-10-08',
      firstVisit: '2025-06-10',
      avgSpending: 45,
      birthday: null,
      allergies: [],
      favoriteTable: null,
      notes: null,
    },
    {
      id: 4,
      name: 'Ana Martínez',
      phone: '+34 600 901 234',
      email: 'ana.martinez@email.com',
      isVIP: true,
      totalVisits: 18,
      lastVisit: '2025-10-13',
      firstVisit: '2024-01-05',
      avgSpending: 95,
      birthday: '1988-12-03',
      allergies: ['Frutos secos'],
      favoriteTable: 'Mesa 3',
      notes: 'Influencer local. Le gusta compartir fotos.',
    },
    {
      id: 5,
      name: 'Pedro Sánchez',
      phone: '+34 600 567 890',
      email: null,
      isVIP: false,
      totalVisits: 2,
      lastVisit: '2025-09-20',
      firstVisit: '2025-08-15',
      avgSpending: 38,
      birthday: null,
      allergies: [],
      favoriteTable: null,
      notes: null,
    },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVIP = !filterVIP || customer.isVIP;
    
    return matchesSearch && matchesVIP;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.isVIP).length,
    newThisMonth: customers.filter(c => {
      const firstVisit = new Date(c.firstVisit);
      const now = new Date();
      return firstVisit.getMonth() === now.getMonth() && 
             firstVisit.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Base de datos de clientes y gestión de relaciones
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total clientes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes VIP</p>
                <p className="text-2xl font-bold">{stats.vip}</p>
              </div>
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nuevos este mes</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* VIP Filter */}
            <Button
              size="sm"
              variant={filterVIP ? 'default' : 'outline'}
              onClick={() => setFilterVIP(!filterVIP)}
            >
              <Star className={cn(
                'mr-2 h-4 w-4',
                filterVIP && 'fill-yellow-300'
              )} />
              Solo VIP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCustomers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No se encontraron clientes
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Intenta cambiar los filtros de búsqueda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CustomerCard({ customer }) {
  const daysSinceLastVisit = Math.floor(
    (new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      customer.isVIP && 'ring-2 ring-yellow-400'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <span className="text-lg font-bold text-white">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {customer.name}
                </h3>
                {customer.isVIP && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {customer.totalVisits} visitas
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
              {customer.phone}
            </a>
          </div>
          
          {customer.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                {customer.email}
              </a>
            </div>
          )}

          {customer.birthday && (
            <div className="flex items-center gap-2 text-gray-600">
              <Gift className="h-4 w-4" />
              <span>
                Cumpleaños: {new Date(customer.birthday).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center text-sm">
          <div>
            <p className="font-semibold text-gray-900">{customer.totalVisits}</p>
            <p className="text-xs text-gray-500">Visitas</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{customer.avgSpending}€</p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{daysSinceLastVisit}d</p>
            <p className="text-xs text-gray-500">Última visita</p>
          </div>
        </div>

        {/* Allergies Alert */}
        {customer.allergies && customer.allergies.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-900">Alergias</p>
              <p className="text-xs text-red-700">
                {customer.allergies.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="flex-1 text-xs text-blue-700">{customer.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="mr-1 h-4 w-4" />
            Ver perfil
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar className="mr-1 h-4 w-4" />
            Nueva reserva
          </Button>
          <Button size="sm" variant="outline">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};