import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { api } from '../../services/api';
import { supabase } from '../../config/supabase';
import '../../styles/calendarStyles.css';
import { CreateAppointmentModal } from '../layout/CreateAppointmentModal';
import { Button } from '@/components/ui/button';
import { Plus, Circle } from 'lucide-react';

export default function CalendarView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (mobile) {
          calendarApi.changeView('timeGridDay');
        } else {
          calendarApi.changeView('timeGridWeek');
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const data = await api.getReservations(params);

      const calendarEvents = (data.appointments || []).map(apt => {
        const startDate = new Date(apt.appointment_time);
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
            duration: apt.duration_minutes,
            statusLabel: getStatusLabel(apt.status)
          }
        };
      });

      setEvents(calendarEvents);

    } catch (error) {
      console.error('❌ Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `restaurant_id=eq.0649df2c-d1ad-41e0-a1f8-40b6cbd15adb`
        },
        (payload) => {
          console.log('🔄 Cambio detectado:', payload);

          if (payload.eventType === 'INSERT') {
            const newApt = payload.new;
            const startDate = new Date(newApt.appointment_time);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + (newApt.duration_minutes || 60));

            const newEvent = {
              id: String(newApt.id),
              title: `${newApt.client_name} - ${newApt.service_name}`,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              backgroundColor: getStatusColor(newApt.status),
              borderColor: getStatusColor(newApt.status),
              extendedProps: {
                status: newApt.status,
                customerName: newApt.client_name,
                customerPhone: newApt.client_phone,
                service: newApt.service_name,
                duration: newApt.duration_minutes,
                statusLabel: getStatusLabel(newApt.status)
              }
            };

            setEvents(prev => [...prev, newEvent]);
          }

          if (payload.eventType === 'UPDATE') {
            const updatedApt = payload.new;
            const startDate = new Date(updatedApt.appointment_time);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + (updatedApt.duration_minutes || 60));

            setEvents(prev =>
              prev.map(event =>
                event.id === String(updatedApt.id)
                  ? {
                    ...event,
                    title: `${updatedApt.client_name} - ${updatedApt.service_name}`,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    backgroundColor: getStatusColor(updatedApt.status),
                    borderColor: getStatusColor(updatedApt.status),
                    extendedProps: {
                      status: updatedApt.status,
                      customerName: updatedApt.client_name,
                      customerPhone: updatedApt.client_phone,
                      service: updatedApt.service_name,
                      duration: updatedApt.duration_minutes,
                      statusLabel: getStatusLabel(updatedApt.status)
                    }
                  }
                  : event
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(event => event.id !== String(payload.old.id)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDatesSet = async (dateInfo) => {
    try {
      const params = {
        startDate: dateInfo.startStr.split('T')[0],
        endDate: dateInfo.endStr.split('T')[0]
      };

      const data = await api.getReservations(params);

      const calendarEvents = (data.appointments || []).map(apt => {
        const startDate = new Date(apt.appointment_time);
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
            duration: apt.duration_minutes,
            statusLabel: getStatusLabel(apt.status)
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error recargando citas:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmado': '#10b981',
      'pendiente': '#f59e0b',
      'completada': '#8b5cf6',
      'cancelada': '#ef4444',
      'no_show': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmado': 'Confirmada',
      'pendiente': 'Pendiente',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_show': 'No Show'
    };
    return labels[status] || status;
  };

  const handleEventClick = (info) => {
    navigate(`/appointments/${info.event.id}`);
  };

  const handleDateClick = (info) => {
    // Solo permitir crear citas en vista semanal y diaria
    const currentView = info.view.type;

    if (currentView === 'dayGridMonth') {
      const calendarApi = info.view.calendar;
      calendarApi.changeView('timeGridDay', info.dateStr);
      return;
    }

    setSelectedSlot({
      date: info.dateStr.split('T')[0],
      time: info.dateStr.split('T')[1]?.substring(0, 5) || '09:00'
    });
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSelectedSlot(null);
    loadAppointments();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  const renderEventContent = (eventInfo) => {
    const view = eventInfo.view.type;

    if (view === 'dayGridMonth') {
      return null;
    }

    return {
      html: `
      <div class="fc-event-main-frame">
        <div class="fc-event-time">${eventInfo.timeText}</div>
        <div class="fc-event-title">${eventInfo.event.title}</div>
      </div>
    `
    };
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendario de Citas</h1>
          <p className="mt-1 text-sm text-gray-300">
            {events.length} {events.length === 1 ? 'cita programada' : 'citas programadas'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowCreateModal(true)}
          className="text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Leyenda de Estados */}
      <div className="flex flex-wrap gap-4 p-4 bg-[#1a2f38] rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          <span className="text-sm text-gray-300">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span className="text-sm text-gray-300">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-purple-500 text-purple-500" />
          <span className="text-sm text-gray-300">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          <span className="text-sm text-gray-300">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-gray-500 text-gray-500" />
          <span className="text-sm text-gray-300">No Show</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-lg bg-[#d9d9d9] p-6 shadow ">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          locale={esLocale}
          headerToolbar={
            isMobile
              ? {
                left: 'prev,next',
                center: 'title',
                right: 'today'
              }
              : {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }
          }
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          titleFormat={{
            year: 'numeric',
            month: 'long'
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
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          events={events}
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          eventContent={renderEventContent}
          dayCellContent={(arg) => {
            if (arg.view.type === 'dayGridMonth') {
              const dayEvents = events.filter(event => {
                const eventDate = new Date(event.start);
                const cellDate = new Date(arg.date);

                // Comparar solo año, mes y día (ignorar hora)
                return eventDate.getFullYear() === cellDate.getFullYear() &&
                  eventDate.getMonth() === cellDate.getMonth() &&
                  eventDate.getDate() === cellDate.getDate();
              });

              if (dayEvents.length > 0) {
                return {
                  html: `
          <div class="fc-daygrid-day-top">
            <div class="fc-daygrid-day-number">${arg.dayNumberText}</div>
          </div>
          <div class="custom-event-counter">
            <span class="event-count">${dayEvents.length}</span>
            <span class="event-label">${dayEvents.length === 1 ? 'cita' : 'citas'}</span>
          </div>
        `
                };
              }
            }
            return { html: `<div class="fc-daygrid-day-number">${arg.dayNumberText}</div>` };
          }}
          eventDidMount={(info) => {
            const bgColor = info.event.backgroundColor;
            const eventEl = info.el;

            eventEl.style.backgroundColor = bgColor;
            eventEl.style.borderColor = bgColor;
            eventEl.style.color = 'white';
            eventEl.style.fontWeight = '600';

            eventEl.title = `${info.event.extendedProps.customerName} - ${info.event.extendedProps.service} (${info.event.extendedProps.duration} min) - ${info.event.extendedProps.statusLabel}`;
          }}
        />
      </div>

      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedSlot(null);
        }}
        onSuccess={handleCreateSuccess}
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot?.time}
      />
    </div>
  );
};