import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, Users, Clock, Phone, User, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getTableStatus } from '@/services/tablesApi';
import { Button } from '@/components/ui/button';

export default function TableStatus() {
  const { token, user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadTableStatus();
  }, [selectedDate]);

  const loadTableStatus = async () => {
    try {
      setLoading(true);
      const data = await getTableStatus(token, user.business.slug, selectedDate);
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error cargando estado de mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (table) => {
    if (table.isOccupied) {
      return 'bg-red-500/20 border-red-500/50';
    }
    if (table.reservations && table.reservations.length > 0) {
      return 'bg-yellow-500/20 border-yellow-500/50';
    }
    return 'bg-green-500/20 border-green-500/50';
  };

  const getStatusText = (table) => {
    if (table.isOccupied) return 'Ocupada';
    if (table.reservations && table.reservations.length > 0) {
      return `${table.reservations.length} reserva(s)`;
    }
    return 'Disponible';
  };

  // Agrupar por tipo
  const salonTables = tables.filter(t => t.table_type === 'salon');
  const terrazaTables = tables.filter(t => t.table_type === 'terraza');

  // Calcular estadísticas
  const totalReservations = tables.reduce((sum, t) => sum + (t.reservations?.length || 0), 0);
  const occupiedTables = tables.filter(t => t.isOccupied).length;
  const availableTables = tables.filter(t => !t.isOccupied && t.reservations?.length === 0).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Estado de Mesas</h1>
          <p className="text-gray-400">Vista en tiempo real de ocupación</p>
        </div>
        <Button
          onClick={loadTableStatus}
          className="bg-blue-600 hover:bg-blue-700"
        >
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Mesas"
          value={tables.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Disponibles"
          value={availableTables}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Ocupadas"
          value={occupiedTables}
          icon={Users}
          color="red"
        />
        <StatCard
          label="Reservas del Día"
          value={totalReservations}
          icon={Calendar}
          color="yellow"
        />
      </div>

      {/* Salón */}
      {salonTables.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Salón ({salonTables.length} mesas)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salonTables.map(table => (
              <TableStatusCard key={table.id} table={table} />
            ))}
          </div>
        </div>
      )}

      {/* Terraza */}
      {terrazaTables.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Terraza ({terrazaTables.length} mesas)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {terrazaTables.map(table => (
              <TableStatusCard key={table.id} table={table} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-900/20',
    green: 'border-green-500/30 bg-green-900/20',
    yellow: 'border-yellow-500/30 bg-yellow-900/20',
    red: 'border-red-500/30 bg-red-900/20',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-white" />
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TableStatusCard({ table }) {
  const navigate = useNavigate();
  const hasReservations = table.reservations && table.reservations.length > 0;
  
  return (
    <div className="rounded-lg border-2 border-gray-700 bg-[#1a2f38] p-4">
      {/* Header de la mesa */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">Mesa {table.table_number}</h3>
        <p className="text-sm text-gray-400">
          <Users className="inline h-3 w-3 mr-1" />
          {table.min_capacity}-{table.capacity} personas • {table.table_type}
        </p>
      </div>

      {/* Reservas individuales */}
      {hasReservations ? (
        <div className="space-y-2">
          {table.reservations.map((reservation, idx) => {
            // 🆕 Color individual por estado de cada reserva
            const getReservationColor = () => {
              switch (reservation.status) {
                case 'confirmado':
                  return 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30';
                case 'pendiente':
                  return 'bg-blue-500/20 border-blue-500/50';
                case 'completado':
                  return 'bg-green-500/20 border-green-500/50';
                case 'cancelado':
                  return 'bg-red-500/20 border-red-500/50';
                default:
                  return 'bg-gray-500/20 border-gray-500/50';
              }
            };

            const getStatusBadge = () => {
              switch (reservation.status) {
                case 'confirmado':
                  return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">Confirmado</span>;
                case 'pendiente':
                  return <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400">Pendiente</span>;
                case 'completado':
                  return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 border border-green-500/50 text-green-400">Completado</span>;
                case 'cancelado':
                  return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 border border-red-500/50 text-red-400">Cancelado</span>;
                default:
                  return null;
              }
            };

            return (
              <div
                key={idx}
                onClick={() => navigate(`/appointments/${reservation.id}`)}
                className={`rounded-md border-2 p-3 cursor-pointer transition-all hover:scale-[1.02] ${getReservationColor()}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {reservation.time}
                  </span>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-gray-300 flex items-center gap-1 mb-1">
                  <User className="h-3 w-3" />
                  {reservation.customerName}
                </p>
                {reservation.customerPhone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3" />
                    {reservation.customerPhone}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  <Users className="h-3 w-3 inline mr-1" />
                  {reservation.partySize} personas • {reservation.duration || 90} min
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4 border-t border-gray-700 mt-3">
          Sin reservas programadas
        </p>
      )}
    </div>
  );
};