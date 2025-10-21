import { Clock, Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

export function CalendarGrid({ currentDate, view, onSlotClick, appointments = [] }) {
  const generateHours = () => {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
      hours.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return hours;
  };

  const hours = generateHours();

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(currentDate.getDate() + diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = view === 'week' ? getWeekDays() : [currentDate];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastSlot = (date, time) => {
    const now = new Date();
    const slotDate = new Date(date);
    const [hours, minutes] = time.split(':');
    slotDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return slotDate < now;
  };

  const isSlotOccupied = (day, time) => {
    return appointments.some(apt => {
      const aptDate = new Date(apt.date);
      if (aptDate.toDateString() !== day.toDateString()) return false;

      const [aptHour, aptMinute] = apt.time.split(':').map(Number);
      const aptStartMinutes = aptHour * 60 + aptMinute;

      const [slotHour, slotMinute] = time.split(':').map(Number);
      const slotMinutes = slotHour * 60 + slotMinute;

      const aptEndMinutes = aptStartMinutes + apt.duration;
      return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  // Calcular posición de una cita en el grid - CORREGIDO
  const getAppointmentStyle = (appointment) => {
    const aptDate = new Date(appointment.date);
    const dayIndex = weekDays.findIndex(d => d.toDateString() === aptDate.toDateString());
    if (dayIndex === -1) return null;

    const [hour, minute] = appointment.time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const slotIndex = totalMinutes / 30;

    const top = slotIndex * 60; // 60px por slot

    return {
      top: `${top}px`,
      gridColumn: dayIndex + 2, // +2 porque la columna 1 es la de horas
      zIndex: 5
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] relative">
        {/* Header con los días */}
        <div className="sticky top-0 z-20 grid grid-cols-[80px_repeat(7,1fr)] border-b bg-gray-50">
          <div className="border-r p-3 text-center text-sm font-medium text-gray-500">
            <Clock className="mx-auto h-4 w-4" />
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`border-r p-3 text-center ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`text-xs font-medium uppercase ${
                isToday(day) ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className={`mt-1 text-lg font-bold ${
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Grid de horarios con citas integradas */}
        <div className="relative grid grid-cols-[80px_repeat(7,1fr)]">
          {hours.map((hour, hourIndex) => {
            const isFullHour = hour.endsWith(':00');
            
            return (
              <div
                key={hour}
                className="contents"
              >
                {/* Columna de hora */}
                <div className={`border-r border-b p-2 text-center ${
                  isFullHour ? 'bg-gray-50 border-gray-300' : 'border-gray-100'
                }`}
                style={{ minHeight: '60px' }}>
                  <span className={`text-xs font-medium ${
                    isFullHour ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {hour}
                  </span>
                </div>

                {/* Slots para cada día */}
                {weekDays.map((day, dayIndex) => {
                  const past = isPastSlot(day, hour);
                  const isOccupied = isSlotOccupied(day, hour);

                  return (
                    <div
                      key={dayIndex}
                      className={`group relative border-r border-b p-1 transition-colors ${
                        isFullHour ? 'border-gray-300' : 'border-gray-100'
                      } ${
                        past ? 'bg-gray-50' : isOccupied ? '' : 'cursor-pointer hover:bg-blue-50'
                      }`}
                      style={{ minHeight: '60px' }}
                      onClick={() => !past && !isOccupied && onSlotClick(day, hour)}
                    >
                      {/* Icono de agregar */}
                      {!past && !isOccupied && (
                        <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Capa de citas posicionadas correctamente */}
          {appointments.map((appointment) => {
            const style = getAppointmentStyle(appointment);
            if (!style) return null;

            return (
              <div
                key={appointment.id}
                className="pointer-events-auto absolute px-1"
                style={{
                  top: style.top,
                  gridColumn: style.gridColumn,
                  zIndex: style.zIndex,
                  left: 0,
                  right: 0
                }}
              >
                <AppointmentCard
                  appointment={appointment}
                  onClick={(apt) => {
                    console.log('Cita clickeada:', apt);
                    alert(`Ver detalles de: ${apt.customerName}\nServicio: ${apt.service}\nDuración: ${apt.duration} min`);
                  }}
                />
              </div>
            );
          })}

          {/* Indicador de hora actual */}
          {weekDays.some(day => isToday(day)) && (
            <CurrentTimeIndicator weekDays={weekDays} />
          )}
        </div>
      </div>
    </div>
  );
}

function CurrentTimeIndicator({ weekDays }) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  const minutesSinceMidnight = currentHour * 60 + currentMinutes;
  const position = (minutesSinceMidnight / 30) * 60 + 48;

  const todayIndex = weekDays.findIndex(day => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  });

  if (todayIndex === -1) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 col-span-full"
      style={{ 
        top: `${position}px`,
        left: 0,
        right: 0
      }}
    >
      <div className="flex items-center">
        <div className="w-[80px] pr-2 text-right">
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-0.5 flex-1 bg-red-500" />
      </div>
    </div>
  );
};