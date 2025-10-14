import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Waitlist() {
  const [showAddForm, setShowAddForm] = useState(false);

  // Datos de ejemplo
  const waitlistEntries = [
    {
      id: 1,
      customerName: 'Roberto Gómez',
      phone: '+34 611 222 333',
      partySize: 4,
      estimatedWait: 25,
      addedAt: '2025-10-14T19:15:00',
      status: 'waiting',
      notes: 'Prefieren terraza si es posible',
    },
    {
      id: 2,
      customerName: 'Laura Fernández',
      phone: '+34 622 444 555',
      partySize: 2,
      estimatedWait: 15,
      addedAt: '2025-10-14T19:30:00',
      status: 'waiting',
      notes: null,
    },
    {
      id: 3,
      customerName: 'Diego Torres',
      phone: '+34 633 666 777',
      partySize: 6,
      estimatedWait: 40,
      addedAt: '2025-10-14T19:45:00',
      status: 'waiting',
      notes: 'Cumpleaños, tienen prisa',
    },
    {
      id: 4,
      customerName: 'Carmen Ruiz',
      phone: '+34 644 888 999',
      partySize: 3,
      estimatedWait: 20,
      addedAt: '2025-10-14T20:00:00',
      status: 'called',
      notes: null,
    },
  ];

  const activeEntries = waitlistEntries.filter(e => e.status === 'waiting');
  const calledEntries = waitlistEntries.filter(e => e.status === 'called');

  const stats = {
    waiting: activeEntries.length,
    avgWait: activeEntries.length > 0 
      ? Math.round(activeEntries.reduce((sum, e) => sum + e.estimatedWait, 0) / activeEntries.length)
      : 0,
    totalPeople: activeEntries.reduce((sum, e) => sum + e.partySize, 0),
  };

  const getWaitingTime = (addedAt) => {
    const minutes = Math.floor((new Date() - new Date(addedAt)) / 1000 / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de espera</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona clientes en espera de mesa
          </p>
        </div>
        
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir a lista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">En espera</p>
                <p className="text-2xl font-bold">{stats.waiting}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Espera promedio</p>
                <p className="text-2xl font-bold">{stats.avgWait} min</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total personas</p>
                <p className="text-2xl font-bold">{stats.totalPeople}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Añadir a lista de espera</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nombre del cliente
                </label>
                <Input placeholder="Nombre completo" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <Input placeholder="+34 600 000 000" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Número de personas
                </label>
                <Input type="number" min="1" placeholder="4" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tiempo estimado (min)
                </label>
                <Input type="number" min="5" placeholder="20" className="mt-1" />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Notas (opcional)
                </label>
                <Input placeholder="Preferencias, ocasión especial..." className="mt-1" />
              </div>

              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" className="flex-1">
                  Añadir a lista
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            En espera ({activeEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeEntries.length > 0 ? (
            <div className="space-y-3">
              {activeEntries.map((entry, index) => (
                <WaitlistCard 
                  key={entry.id} 
                  entry={entry} 
                  position={index + 1}
                  waitingTime={getWaitingTime(entry.addedAt)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                No hay clientes en espera
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Los clientes aparecerán aquí cuando no haya mesas disponibles
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Called Entries */}
      {calledEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Llamados ({calledEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calledEntries.map((entry) => (
                <WaitlistCard 
                  key={entry.id} 
                  entry={entry} 
                  position={null}
                  waitingTime={getWaitingTime(entry.addedAt)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WaitlistCard({ entry, position, waitingTime }) {
  return (
    <div className={cn(
      'flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between',
      entry.status === 'called' && 'border-blue-300 bg-blue-50'
    )}>
      <div className="flex items-center gap-4">
        {/* Position Badge */}
        {position !== null && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <span className="text-lg font-bold text-yellow-700">#{position}</span>
          </div>
        )}

        {entry.status === 'called' && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
        )}

        {/* Customer Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{entry.customerName}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {entry.phone}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {entry.partySize} personas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Esperando {waitingTime}
            </span>
          </div>
          {entry.notes && (
            <div className="mt-2 flex items-start gap-2 text-xs">
              <MessageSquare className="h-3 w-3 text-gray-400 mt-0.5" />
              <span className="text-gray-600">{entry.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Wait Time Badge */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-gray-100 px-3 py-2 text-center">
          <p className="text-xs text-gray-500">Tiempo estimado</p>
          <p className="text-lg font-bold text-gray-900">{entry.estimatedWait} min</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {entry.status === 'waiting' && (
          <>
            <Button size="sm" className="flex-1 sm:flex-none">
              <CheckCircle className="mr-1 h-4 w-4" />
              Llamar
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
          </>
        )}

        {entry.status === 'called' && (
          <>
            <Button size="sm" variant="default" className="flex-1 sm:flex-none">
              <CheckCircle className="mr-1 h-4 w-4" />
              Sentar
            </Button>
            <Button size="sm" variant="outline">
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};