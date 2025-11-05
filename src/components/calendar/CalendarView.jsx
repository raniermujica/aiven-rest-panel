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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Igual que AllReservations - traer todas sin filtro
      const data = await api.getReservations({});
      
      console.log('📅 Datos del backend:', data);
      console.log('📊 Appointments:', data.appointments);
      
      // Convertir a formato FullCalendar
      const calendarEvents = (data.appointments || []).map(apt => {
        console.log('🔄 Procesando:', apt);
        
        // Fecha y hora de inicio
        const startDate = new Date(apt.appointment_time);
        
        // Calcular fin
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (apt.duration_minutes || 60));
        
        return {
          id: String(apt.id),
          title: `${apt.client_name} - ${apt.service_name}`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: getStatusColor(apt.status),
          borderColor: getStatusColor(apt.status),
          extendedProps: {
            status: apt.status,
            customerName: apt.client_name,
            customerPhone: apt.client_phone,
            service: apt.service_name,
            duration: apt.duration_minutes
          }
        };
      });
      
      console.log('✅ Eventos generados:', calendarEvents);
      setEvents(calendarEvents);
      
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmado': '#10b981',
      'pendiente': '#f59e0b', 
      'completada': '#8b5cf6',
      'cancelada': '#ef4444',
      'no_show': '#ef4444'
    };
    return colors[status] || '#6b7280';
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
        <p className="mt-1 text-sm text-gray-500">
          {events.length} citas programadas
        </p>
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
          buttonText={{
            today: 'Hoy',
            week: 'Semana',
            day: 'Día'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          nowIndicator={true}
          editable={false}
          selectable={true}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>
    </div>
  );
};