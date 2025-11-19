import { useState, useEffect, useRef } from 'react';
import { DayPilotScheduler } from '@daypilot/daypilot-lite-react';
import moment from 'moment';
import 'moment/locale/es';
import { Calendar as CalendarIcon, Clock, Users, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';
import '../../styles/daypilot-custom.css'; // 🆕 Importar CSS personalizado

moment.locale('es');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ShiftOccupancy() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState('all');
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [filterTable, setFilterTable] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const schedulerRef = useRef();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const shifts = {
    lunch: { start: 7, end: 16, label: 'Almuerzo' },
    dinner: { start: 7, end: 24, label: 'Cena' },
    all: { start: 7, end: 24, label: 'Día completo' }
  };

  useEffect(() => {
    if (token && user?.business?.slug) {
      loadData();
    }
  }, [selectedDate, token, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-business-slug': user.business.slug,
      };

      const [tablesRes, reservationsRes] = await Promise.all([
        fetch(`${API_URL}/api/tables`, { headers }),
        fetch(`${API_URL}/api/reservations?date=${dateStr}`, { headers })
      ]);

      if (!tablesRes.ok || !reservationsRes.ok) throw new Error('Error cargando datos');

      const tablesData = await tablesRes.json();
      const reservationsData = await reservationsRes.json();

      setTables(tablesData.tables || []);
      const appointments = reservationsData.appointments || [];
      setReservations(appointments.map(apt => ({
        ...apt,
        reservation_date: apt.scheduled_date?.split('T')[0],
        reservation_time: apt.appointment_time?.split('T')[1]?.substring(0, 5),
        estimated_duration_minutes: apt.duration_minutes,
        customer: apt.customers
      })));
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table => {
    if (filterCapacity !== 'all') {
      const capacity = parseInt(filterCapacity);
      if (table.max_capacity < capacity) return false;
    }
    if (filterTable !== 'all' && table.id !== filterTable) return false;
    return true;
  });

  const shift = shifts[selectedShift];
  const startTime = moment(selectedDate).hour(shift.start).minute(0).second(0);
  const endTime = moment(selectedDate).hour(shift.end).minute(0).second(0);

  const resources = filteredTables.map(table => ({
    id: table.id,
    name: `Mesa ${table.table_number} (${table.min_capacity}-${table.max_capacity} pax)`,
  }));

  const events = reservations
    .filter(reservation => {
      if (!reservation.table_id) return false;
      if (filterTable !== 'all' && reservation.table_id !== filterTable) return false;

      const resDateTime = moment(`${reservation.reservation_date} ${reservation.reservation_time}`);
      return resDateTime.isBetween(startTime, endTime, null, '[]');
    })
    .map(reservation => {
      const resDateTime = moment(`${reservation.reservation_date} ${reservation.reservation_time}`);
      const duration = reservation.estimated_duration_minutes || 90;
      const endResTime = moment(resDateTime).add(duration, 'minutes');

      let backColor, borderColor, textColor;
      switch (reservation.status) {
        case 'confirmed':
        case 'confirmado':
          backColor = '#fef3c7';
          borderColor = '#f59e0b';
          textColor = '#92400e';
          break;
        case 'seated':
        case 'en_mesa':
          backColor = '#fecaca';
          borderColor = '#ef4444';
          textColor = '#991b1b';
          break;
        case 'completed':
        case 'completado':
          backColor = '#d1fae5';
          borderColor = '#10b981';
          textColor = '#065f46';
          break;
        default:
          backColor = '#e5e7eb';
          borderColor = '#6b7280';
          textColor = '#374151';
      }

      const customerName =
        (typeof reservation.customer === 'object' ? reservation.customer?.name : null) ||
        reservation.client_name ||
        'Sin nombre';

      return {
        id: reservation.id,
        resource: reservation.table_id,
        text: `${customerName} - ${reservation.party_size} pax`,
        start: resDateTime.format('YYYY-MM-DDTHH:mm:ss'),
        end: endResTime.format('YYYY-MM-DDTHH:mm:ss'),
        backColor,
        borderColor,
        fontColor: textColor,
        barHidden: false
      };
    });

  const calculateOccupancy = () => {
    if (filteredTables.length === 0) return 0;
    const totalMinutes = (shift.end - shift.start) * 60;
    const occupiedMinutes = events.reduce((sum, event) => {
      const duration = moment(event.end).diff(moment(event.start), 'minutes');
      return sum + duration;
    }, 0);
    const maxPossibleMinutes = filteredTables.length * totalMinutes;
    return Math.round((occupiedMinutes / maxPossibleMinutes) * 100);
  };

  const occupancy = calculateOccupancy();

  // Configuración de DayPilot CORREGIDA
 const config = {
  locale: 'es-es',
  timeHeaders: [
    { groupBy: 'Hour' },
    { groupBy: 'Cell', format: 'mm' }
  ],
  scale: 'CellDuration',
  cellDuration: 15,
  cellWidth: 60,
  days: 1,
  startDate: format(selectedDate, 'yyyy-MM-dd'),
  timeRangeSelectedHandling: 'Disabled',
  eventMoveHandling: 'Disabled',
  eventResizeHandling: 'Disabled',
  eventDeleteHandling: 'Disabled',
  eventClickHandling: 'Disabled',
  allowEventOverlap: false,
  resources: resources,
  events: events,
  height: 600,
  headerHeight: 30,
  rowHeaderColumns: [
    { title: 'Mesas', width: 200 }
  ],
  eventHeight: 40,
  eventBorderRadius: 8,

  // 🔹 Business hours (informativo)
  businessBeginsHour: shift.start,
  businessEndsHour: shift.end,

  // 🔹 Forzar ocultar horas fuera del turno
  onBeforeCellRender: args => {
    const hour = args.cell.start.getHours();
    if (hour < shift.start || hour >= shift.end) {
      args.cell.visible = false;
    }
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando ocupación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ocupación por Turnos</h1>
          <p className="text-gray-400">Vista en tiempo real del estado de las mesas</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Controles */}
      <div className="bg-[#1a2f38] rounded-lg border border-gray-700 p-6">
        {/* ... resto del código de controles igual ... */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0a1820] rounded-lg p-1">
              <button
                onClick={() => setSelectedDate(prev => {
                  const newDate = new Date(prev);
                  newDate.setDate(newDate.getDate() - 1);
                  return newDate;
                })}
                className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
              >
                ←
              </button>

              <div className="px-4 py-2 min-w-[200px] text-center">
                <div className="text-sm text-gray-400">
                  {format(selectedDate, 'EEEE', { locale: es })}
                </div>
                <div className="font-semibold text-white">
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </div>

              <button
                onClick={() => setSelectedDate(prev => {
                  const newDate = new Date(prev);
                  newDate.setDate(newDate.getDate() + 1);
                  return newDate;
                })}
                className="p-2 hover:bg-gray-700 rounded transition-colors text-white"
              >
                →
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(shifts).map(([key, shift]) => (
              <button
                key={key}
                onClick={() => setSelectedShift(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedShift === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0a1820] text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                {shift.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas y Filtros igual */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0a1820] rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Ocupación</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">{occupancy}%</div>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0a1820] rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Reservas</div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
          </div>

          <div className="bg-[#0a1820] rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Mesas activas</div>
            <div className="text-2xl font-bold text-white">{filteredTables.length}</div>
          </div>

          <div className="bg-[#0a1820] rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Comensales</div>
            <div className="text-2xl font-bold text-white">
              {reservations.reduce((sum, r) => sum + (r.party_size || 0), 0)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="px-3 py-2 border border-gray-600 bg-[#0a1820] text-white rounded-lg text-sm"
              >
                <option value="all">Todas las capacidades</option>
                <option value="2">2+ personas</option>
                <option value="4">4+ personas</option>
                <option value="6">6+ personas</option>
                <option value="8">8+ personas</option>
              </select>

              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="px-3 py-2 border border-gray-600 bg-[#0a1820] text-white rounded-lg text-sm"
              >
                <option value="all">Todas las mesas</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.table_number}
                  </option>
                ))}
              </select>

              {(filterCapacity !== 'all' || filterTable !== 'all') && (
                <button
                  onClick={() => {
                    setFilterCapacity('all');
                    setFilterTable('all');
                  }}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-[#1a2f38] rounded-lg border border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-white">Estados:</span>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500" />
            <span className="text-gray-300">Confirmada</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-500" />
            <span className="text-gray-300">En mesa</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" />
            <span className="text-gray-300">Completada</span>
          </div>
        </div>
      </div>

      {/* Timeline con DayPilot */}
      <div className="bg-[#0a1820] rounded-lg border border-gray-700 p-4">
        {filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No hay mesas disponibles</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No hay reservas para este día y turno</p>
          </div>
        ) : (
          <DayPilotScheduler
            {...config}
            ref={schedulerRef}
          />
        )}
      </div>
    </div>
  );
};