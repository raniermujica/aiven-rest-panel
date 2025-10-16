import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Users, 
  Phone, 
  UserPlus,
  CheckCircle,
  AlertCircle,
  Ban,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Waitlist() {
  const { user } = useAuthStore();
  const [waitlist, setWaitlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    customers: 'Clientes',
  };

  useEffect(() => {
    loadWaitlist();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadWaitlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      const [waitlistData, statsData] = await Promise.all([
        api.getWaitlist(),
        api.getWaitlistStats(),
      ]);
      
      setWaitlist(waitlistData.waitlist || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando lista de espera:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (entryId, newStatus) => {
    try {
      await api.updateWaitlistStatus(entryId, newStatus);
      await loadWaitlist();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const getWaitingTime = (addedAt) => {
    const now = new Date();
    const added = new Date(addedAt);
    const minutes = Math.floor((now - added) / 1000 / 60);
    
    if (minutes < 1) return 'Recién llegado';
    if (minutes === 1) return '1 minuto';
    return `${minutes} minutos`;
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
          <h1 className="text-3xl font-bold text-gray-900">Lista de espera</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la fila de {terminology.customers.toLowerCase()} esperando mesa
          </p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar a la lista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">En espera</p>
                <p className="text-2xl font-bold">{stats?.waiting || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total personas</p>
                <p className="text-2xl font-bold">{stats?.totalPeople || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Espera promedio</p>
                <p className="text-2xl font-bold">{stats?.avgWait || 0} min</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist */}
      <div className="grid gap-4 lg:grid-cols-2">
        {waitlist.map((entry) => (
          <WaitlistCard
            key={entry.id}
            entry={entry}
            onUpdateStatus={handleUpdateStatus}
            getWaitingTime={getWaitingTime}
            terminology={terminology}
          />
        ))}
      </div>

      {waitlist.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              No hay {terminology.customers.toLowerCase()} en espera
            </p>
            <p className="mt-1 text-sm text-gray-500">
              La lista de espera aparecerá aquí cuando haya {terminology.customers.toLowerCase()} esperando
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add to Waitlist Modal */}
      {showAddModal && (
        <AddToWaitlistModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadWaitlist();
          }}
          terminology={terminology}
        />
      )}
    </div>
  );
}

function WaitlistCard({ entry, onUpdateStatus, getWaitingTime, terminology }) {
  const customer = entry.customers || {};
  
  const getStatusInfo = (status) => {
    const statusMap = {
      waiting: {
        label: 'Esperando',
        color: 'bg-orange-100 text-orange-800',
        icon: Clock,
      },
      called: {
        label: 'Llamado',
        color: 'bg-blue-100 text-blue-800',
        icon: Phone,
      },
      seated: {
        label: 'Sentado',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
    };
    return statusMap[status] || statusMap.waiting;
  };

  const statusInfo = getStatusInfo(entry.status);
  const StatusIcon = statusInfo.icon;
  const waitingTime = getWaitingTime(entry.added_at);

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      customer.is_vip && 'ring-2 ring-yellow-400'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Position Badge */}
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-orange-100">
              <span className="text-xs font-medium text-orange-600">Turno</span>
              <span className="text-lg font-bold text-orange-600">
                #{entry.position || '?'}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {customer.name || 'Cliente'}
                </h3>
                {customer.is_vip && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">{customer.phone || 'Sin teléfono'}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusInfo.color
          )}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {entry.party_size} personas
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {waitingTime}
            </span>
          </div>
        </div>

        {/* Estimated Wait */}
        {entry.estimated_wait_minutes && (
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-900">
              Tiempo estimado de espera
            </p>
            <p className="text-sm text-blue-700">
              {entry.estimated_wait_minutes} minutos
            </p>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-900">Nota</p>
            <p className="text-xs text-gray-700">{entry.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {entry.status === 'waiting' && (
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onUpdateStatus(entry.id, 'called')}
              >
                <Phone className="mr-1 h-4 w-4" />
                Llamar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus(entry.id, 'cancelled')}
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {entry.status === 'called' && (
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onUpdateStatus(entry.id, 'seated')}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Marcar sentado
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus(entry.id, 'no_show')}
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddToWaitlistModal({ onClose, onSuccess, terminology }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    partySize: 2,
    estimatedWaitMinutes: 15,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.addToWaitlist(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error agregando a lista de espera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Agregar a lista de espera</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre del {terminology.customer.toLowerCase()} *
              </label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono *</label>
              <Input
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+34 600 123 456"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Número de personas *
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Tiempo estimado de espera (minutos)
              </label>
              <Input
                type="number"
                min="5"
                max="120"
                step="5"
                value={formData.estimatedWaitMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedWaitMinutes: parseInt(e.target.value) })}
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
                {loading ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};