import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { api } from '@/services/api';

export function Calendar() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
  };

  // Cargar citas cuando cambie la fecha o la vista
  useEffect(() => {
    loadAppointments();
  }, [currentDate, view]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Calcular rango de fechas según la vista
      let startDate, endDate;
      
      if (view === 'week') {
        // Obtener inicio y fin de semana
        const start = new Date(currentDate);
        const dayOfWeek = start.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(start.getDate() + diff);
        startDate = start.toISOString().split('T')[0];
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        endDate = end.toISOString().split('T')[0];
      } else {
        // Vista diaria
        startDate = currentDate.toISOString().split('T')[0];
        endDate = startDate;
      }

      const data = await api.getCalendarReservations(startDate, endDate);
      setAppointments(data.reservations || []);
      
    } catch (error) {
      console.error('Error cargando citas del calendario:', error);
      // Si hay error, usar datos mock para desarrollo
      const mockAppointments = [
        {
          id: 1,
          customerName: 'María García',
          isVip: true,
          service: 'Corte + Tinte',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          duration: 90,
          status: 'confirmed'
        },
        {
          id: 2,
          customerName: 'Laura Martínez',
          isVip: false,
          service: 'Manicura completa',
          date: new Date().toISOString().split('T')[0],
          time: '11:00',
          duration: 60,
          status: 'confirmed'
        },
        {
          id: 3,
          customerName: 'Ana López',
          isVip: true,
          service: 'Tratamiento facial',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 60,
          status: 'pending'
        },
        {
          id: 4,
          customerName: 'Carmen Ruiz',
          isVip: false,
          service: 'Masaje relajante',
          date: new Date().toISOString().split('T')[0],
          time: '16:30',
          duration: 50,
          status: 'confirmed'
        },
        {
          id: 5,
          customerName: 'Isabel Torres',
          isVip: false,
          service: 'Depilación láser',
          date: new Date().toISOString().split('T')[0],
          time: '12:00',
          duration: 30,
          status: 'completed'
        },
      ];
      setAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  };

  // Navegación de fechas
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Formatear fecha para mostrar
  const formatDateRange = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // Vista semanal: mostrar rango
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(currentDate.getDate() + diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calendario de {terminology.bookings}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Vista completa de todas las {terminology.bookings.toLowerCase()} programadas
          </p>
        </div>

        {/* Selector de Vista */}
        <div className="flex items-center gap-2 rounded-lg border bg-white p-1">
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('day')}
          >
            <Clock className="mr-1 h-4 w-4" />
            Día
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('week')}
          >
            <CalendarIcon className="mr-1 h-4 w-4" />
            Semana
          </Button>
        </div>
      </div>

      {/* Navegación de Fechas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={view === 'week' ? goToPreviousWeek : goToPreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={goToToday}
              >
                Hoy
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={view === 'week' ? goToNextWeek : goToNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <CardTitle className="text-lg font-semibold">
              {formatDateRange()}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <CalendarGrid
            currentDate={currentDate}
            view={view}
            appointments={appointments}
            onSlotClick={(date, time) => {
              console.log('Click en slot:', date, time);
              alert(`Crear cita para ${date.toLocaleDateString('es-ES')} a las ${time}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};