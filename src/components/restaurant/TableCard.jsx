import { MapPin, Users, Settings } from 'lucide-react';

export function TableCard({ table, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500/20 text-green-400 border-green-500/30',
      reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      occupied: 'bg-red-500/20 text-red-400 border-red-500/30',
      blocked: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[status] || colors.available;
  };

  const getStatusText = (status) => {
    const texts = {
      available: 'Disponible',
      reserved: 'Reservada',
      occupied: 'Ocupada',
      blocked: 'Bloqueada',
      maintenance: 'Mantenimiento',
    };
    return texts[status] || status;
  };

  const getTypeColor = (type) => {
    return type === 'terraza' 
      ? 'bg-blue-500/10 border-blue-500/30' 
      : 'bg-gray-500/10 border-gray-700';
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getTypeColor(table.table_type)} bg-[#1a2f38]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Mesa {table.table_number}</h3>
            <span className={`rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(table.status)}`}>
              {getStatusText(table.status)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{table.min_capacity} - {table.capacity} personas</span>
            </div>
            {table.table_type && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="capitalize">{table.table_type}</span>
              </div>
            )}
          </div>

          {table.notes && (
            <p className="mt-2 text-xs text-gray-500">{table.notes}</p>
          )}

          {!table.auto_assignable && (
            <span className="mt-2 inline-block text-xs text-orange-400">
              ⚠️ Asignación manual únicamente
            </span>
          )}
        </div>

        <button
          onClick={() => onEdit(table)}
          className="rounded p-2 text-gray-400 hover:bg-[#0a1820] hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};