import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { api } from '../../services/api';
import '../../styles/calendarStyles.css';

export default function CalendarView() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getReservations();
      setAppointments(data.reservations || []);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const events = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.customer_name} - ${apt.service}`,
    start: `${apt.date}T${apt.time}`,
    end: calculateEndTime(apt.date, apt.time, apt.duration),
    extendedProps: {
      status: apt.status,
      customerName: apt.customer_name,
      customerPhone: apt.customer_phone,
      service: apt.service,
      duration: apt.duration,
      notes: apt.notes
    }
  }));

  const calculateEndTime = (date, time, duration) => {
    const start = new Date(`${date}T${time}`);
    start.setMinutes(start.getMinutes() + duration);
    return start.toISOString();
  };

  const handleEventClick = (info) => {
    navigate(`/appointments/${info.event.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
        <p className="mt-1 text-sm text-gray-500">Vista completa de todas las citas programadas</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          contentHeight={700}
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs">
              <div className="font-semibold">{eventInfo.timeText}</div>
              <div className="truncate">{eventInfo.event.title}</div>
            </div>
          )}
          eventClassNames={(arg) => {
            const status = arg.event.extendedProps.status;
            return [
              'border-l-4 cursor-pointer',
              status === 'confirmada' ? 'border-green-500 bg-green-50' :
              status === 'pendiente' ? 'border-yellow-500 bg-yellow-50' :
              status === 'completada' ? 'border-purple-500 bg-purple-50' :
              'border-red-500 bg-red-50'
            ];
          }}
        />
      </div>
    </div>
  );
};