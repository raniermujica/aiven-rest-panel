import { Star, Clock, User } from 'lucide-react';

export function AppointmentCard({ appointment, onClick }) {
  // Sistema de colores por servicio
  const getServiceColor = (service) => {
    const serviceLower = service.toLowerCase();
    
    if (serviceLower.includes('corte')) return 'bg-blue-100 border-blue-400 text-blue-900';
    if (serviceLower.includes('tinte') || serviceLower.includes('color')) return 'bg-purple-100 border-purple-400 text-purple-900';
    if (serviceLower.includes('manicura') || serviceLower.includes('uñas')) return 'bg-pink-100 border-pink-400 text-pink-900';
    if (serviceLower.includes('facial') || serviceLower.includes('tratamiento')) return 'bg-green-100 border-green-400 text-green-900';
    if (serviceLower.includes('masaje')) return 'bg-indigo-100 border-indigo-400 text-indigo-900';
    if (serviceLower.includes('depilación') || serviceLower.includes('laser')) return 'bg-orange-100 border-orange-400 text-orange-900';
    if (serviceLower.includes('maquillaje')) return 'bg-cyan-100 border-cyan-400 text-cyan-900';
    
    return 'bg-gray-100 border-gray-400 text-gray-900';
  };

  // Obtener estilo del estado
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'border-dashed opacity-90';
      case 'confirmed':
        return 'border-solid';
      case 'completed':
        return 'opacity-60';
      default:
        return 'border-solid';
    }
  };

  const colorClass = getServiceColor(appointment.service);
  const statusClass = getStatusStyle(appointment.status);

  // Calcular altura según duración (1 slot = 30 min = 60px)
  const height = (appointment.duration / 30) * 60 - 8; // -8 para padding

  return (
    <div
      className={`
        absolute inset-x-1 overflow-hidden rounded-md border-2 p-2 
        cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]
        ${colorClass} ${statusClass}
        ${appointment.isVip ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
      `}
      style={{ height: `${height}px` }}
      onClick={() => onClick(appointment)}
    >
      <div className="flex h-full flex-col text-xs">
        {/* Header con hora y VIP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-semibold">{appointment.time}</span>
          </div>
          {appointment.isVip && (
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>

        {/* Nombre del cliente */}
        <div className="mt-1 flex items-center gap-1">
          <User className="h-3 w-3" />
          <span className="truncate font-bold">{appointment.customerName}</span>
        </div>

        {/* Servicio */}
        <div className="mt-0.5 truncate text-[10px] opacity-75">
          {appointment.service}
        </div>

        {/* Duración (solo si hay espacio) */}
        {appointment.duration >= 60 && (
          <div className="mt-auto text-[10px] font-medium opacity-60">
            {appointment.duration} min
          </div>
        )}
      </div>
    </div>
  );
};