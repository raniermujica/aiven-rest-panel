import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Phone, User, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getOccupancyByShift } from '@/services/tablesApi';
import { cn } from '@/lib/utils';

export default function ShiftOccupancy() {
  const { token, user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('all_day');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOccupancy();
  }, [selectedDate]);

  const loadOccupancy = async () => {
    try {
      setLoading(true);
      const response = await getOccupancyByShift(token, user.business.slug, selectedDate);
      setData(response);
    } catch (error) {
      console.error('Error cargando ocupación:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-white">No se pudo cargar la información</p>
      </div>
    );
  }

  const getShiftTables = () => {
    if (!data.tables) return [];

    switch (selectedShift) {
      case 'all_day':
        return data.tables.map(t => ({ ...t, reservations: t.allDayReservations }));
      case 'lunch':
        return data.tables.map(t => ({ ...t, reservations: t.lunchReservations }));
      case 'dinner':
        return data.tables.map(t => ({ ...t, reservations: t.dinnerReservations }));
      default:
        return data.tables;
    }
  };

  const tables = getShiftTables();

  // Calcular estadísticas del turno seleccionado
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.reservations?.some(r => r.checkedIn)).length;
  const reservedTables = tables.filter(t => t.reservations?.length > 0 && !t.reservations.some(r => r.checkedIn)).length;
  const availableTables = totalTables - occupiedTables - reservedTables;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ocupación por Turnos</h1>
          <p className="text-gray-400">Vista en tiempo real del estado de las mesas</p>
        </div>
        <Button onClick={loadOccupancy} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-4 rounded-lg bg-[#1a2f38] border border-gray-700 p-4">
        <Calendar className="h-5 w-5 text-blue-400" />
        <label className="text-sm font-medium text-white">Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-md border border-gray-600 bg-[#0a1820] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Shift Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedShift === 'all_day' ? 'default' : 'outline'}
          onClick={() => setSelectedShift('all_day')}
          className={cn(
            selectedShift === 'all_day' ? 'bg-blue-600' : 'bg-transparent border-gray-600 text-white'
          )}
        >
          Día Completo
          <span className="ml-2 text-xs opacity-75">
            {data.shifts.all_day.start_time} - {data.shifts.all_day.end_time}
          </span>
        </Button>

        {data.shifts.lunch && (
          <Button
            variant={selectedShift === 'lunch' ? 'default' : 'outline'}
            onClick={() => setSelectedShift('lunch')}
            className={cn(
              selectedShift === 'lunch' ? 'bg-blue-600' : 'bg-transparent border-gray-600 text-white'
            )}
          >
            Almuerzo
            <span className="ml-2 text-xs opacity-75">
              {data.shifts.lunch.start_time} - {data.shifts.lunch.end_time}
            </span>
          </Button>
        )}

        {data.shifts.dinner && (
          <Button
            variant={selectedShift === 'dinner' ? 'default' : 'outline'}
            onClick={() => setSelectedShift('dinner')}
            className={cn(
              selectedShift === 'dinner' ? 'bg-blue-600' : 'bg-transparent border-gray-600 text-white'
            )}
          >
            Cena
            <span className="ml-2 text-xs opacity-75">
              {data.shifts.dinner.start_time} - {data.shifts.dinner.end_time}
            </span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Mesas" value={totalTables} color="blue" />
        <StatCard label="Disponibles" value={availableTables} color="green" />
        <StatCard label="Reservadas" value={reservedTables} color="yellow" />
        <StatCard label="Ocupadas" value={occupiedTables} color="red" />
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map(table => (
          <TableCard key={table.id} table={table} onRefresh={loadOccupancy} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-900/20',
    green: 'border-green-500/30 bg-green-900/20',
    yellow: 'border-yellow-500/30 bg-yellow-900/20',
    red: 'border-red-500/30 bg-red-900/20',
  };

  return (
    <div className={cn('rounded-lg border-2 p-4', colors[color])}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function TableCard({ table, onRefresh }) {
  const hasReservations = table.reservations && table.reservations.length > 0;
  const isOccupied = hasReservations && table.reservations.some(r => r.checkedIn);
  
  const getCardColor = () => {
    if (isOccupied) return 'border-red-500/50 bg-red-500/10';
    if (hasReservations) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-green-500/50 bg-green-500/10';
  };

  const getStatusBadge = () => {
    if (isOccupied) {
      return (
        <span className="rounded-full bg-red-500/20 border border-red-500/50 px-2 py-1 text-xs font-medium text-red-400">
          Ocupada
        </span>
      );
    }
    if (hasReservations) {
      return (
        <span className="rounded-full bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 text-xs font-medium text-yellow-400">
          {table.reservations.length} reserva(s)
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-500/20 border border-green-500/50 px-2 py-1 text-xs font-medium text-green-400">
        Disponible
      </span>
    );
  };

  return (
    <Card className={cn('border-2 bg-[#1a2f38]', getCardColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Mesa {table.table_number}</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-400">
          <Users className="inline h-3 w-3 mr-1" />
          {table.min_capacity}-{table.capacity} personas
        </p>
      </CardHeader>

      <CardContent>
        {hasReservations ? (
          <div className="space-y-2">
            {table.reservations.map((reservation, idx) => (
              <div
                key={idx}
                className="rounded-md bg-[#0a1820] border border-gray-700 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {reservation.time}
                  </span>
                  {reservation.checkedIn && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {reservation.clientName}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {reservation.clientPhone}
                </p>
                <p className="text-xs text-gray-400">
                  <Users className="h-3 w-3 inline mr-1" />
                  {reservation.partySize} personas • {reservation.duration} min
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">
            Sin reservas en este turno
          </p>
        )}
      </CardContent>
    </Card>
  );
};