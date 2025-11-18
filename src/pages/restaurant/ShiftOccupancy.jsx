import { useState, useEffect } from 'react';
import Timeline from 'react-calendar-timeline';
import moment from 'moment';
import 'moment/locale/es';
import { Calendar, Clock, Users, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';
import '../../styles/timeline-custom.css';

moment.locale('es');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ShiftOccupancy() {
  // Estados
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState('all'); // 'all', 'lunch', 'dinner'
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [filterTable, setFilterTable] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Obtener token y restaurantId del store
  const token = useAuthStore((state) => state.token);
  const restaurantId = useAuthStore((state) => state.businessSlug);

  // Configuración de turnos
  const shifts = {
    lunch: { start: 13, end: 16, label: 'Almuerzo', color: '#f59e0b' },
    dinner: { start: 20, end: 23, label: 'Cena', color: '#8b5cf6' },
    all: { start: 8, end: 23, label: 'Día completo', color: '#2563eb' }
  };

  // Cargar datos
  useEffect(() => {
    console.log('=== useEffect disparado ===');
    console.log('Token existe:', !!token);
    console.log('RestaurantId existe:', !!restaurantId);
    console.log('RestaurantId value:', restaurantId);
    
    if (token && restaurantId) {
      console.log('Condiciones cumplidas, llamando loadData()');
      loadData();
    } else {
      console.warn('⚠️ Falta token o restaurantId');
      console.warn('Token:', token);
      console.warn('RestaurantId:', restaurantId);
    }
  }, [selectedDate, token, restaurantId]);

  const loadData = async () => {
    console.log('=== INICIO loadData ===');
    console.log('Token:', token ? 'EXISTE' : 'NO EXISTE');
    console.log('RestaurantId:', restaurantId);
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('Fecha seleccionada:', dateStr);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-business-slug': restaurantId
      };

      // Cargar mesas y reservas en paralelo
      console.log('Llamando a endpoints...');
      const [tablesRes, reservationsRes] = await Promise.all([
        fetch(`/api/tables`, { headers }),
        fetch(`/api/reservations?date=${dateStr}`, { headers })
      ]);

      console.log('Tables response status:', tablesRes.status);
      console.log('Reservations response status:', reservationsRes.status);

      if (!tablesRes.ok) {
        const errorText = await tablesRes.text();
        console.error('Error tables response:', errorText);
        throw new Error('Error cargando mesas');
      }

      if (!reservationsRes.ok) {
        const errorText = await reservationsRes.text();
        console.error('Error reservations response:', errorText);
        throw new Error('Error cargando reservas');
      }

      const tablesData = await tablesRes.json();
      const reservationsData = await reservationsRes.json();

      console.log('Mesas recibidas:', tablesData);
      console.log('Reservas recibidas:', reservationsData);

      setTables(tablesData.tables || []);
      setReservations(reservationsData.reservations || []);
      console.log('=== FIN loadData SUCCESS ===');
    } catch (error) {
      console.error('=== ERROR en loadData ===', error);
      alert('Error cargando ocupación: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  // Filtrar mesas
  const filteredTables = tables.filter(table => {
    if (filterCapacity !== 'all') {
      const capacity = parseInt(filterCapacity);
      if (table.max_capacity < capacity) return false;
    }
    if (filterTable !== 'all' && table.id !== filterTable) return false;
    return true;
  });

  // Preparar grupos (mesas) para Timeline
  const groups = filteredTables.map(table => ({
    id: table.id,
    title: (
      <div className="flex items-center gap-2 py-1">
        <span className="font-semibold text-gray-900">{table.table_number}</span>
        <span className="text-xs text-gray-500">
          ({table.min_capacity}-{table.max_capacity} pax)
        </span>
      </div>
    ),
    height: 60,
    stackItems: false
  }));

  // Preparar items (reservas) para Timeline
  const shift = shifts[selectedShift];
  const startTime = moment(selectedDate).hour(shift.start).minute(0).second(0);
  const endTime = moment(selectedDate).hour(shift.end).minute(0).second(0);

  const items = reservations
    .filter(reservation => {
      if (!reservation.table_id) return false;
      if (filterTable !== 'all' && reservation.table_id !== filterTable) return false;
      
      const resTime = moment(reservation.reservation_date + 'T' + reservation.reservation_time);
      return resTime.isBetween(startTime, endTime, null, '[]');
    })
    .map(reservation => {
      const resTime = moment(reservation.reservation_date + 'T' + reservation.reservation_time);
      const duration = reservation.estimated_duration_minutes || 90;
      const endResTime = moment(resTime).add(duration, 'minutes');

      // Colores según estado
      let bgColor, borderColor;
      switch(reservation.status) {
        case 'confirmed':
          bgColor = '#fef3c7'; // Amarillo claro
          borderColor = '#f59e0b'; // Amarillo
          break;
        case 'seated':
          bgColor = '#fecaca'; // Rojo claro
          borderColor = '#ef4444'; // Rojo
          break;
        case 'completed':
          bgColor = '#d1fae5'; // Verde claro
          borderColor = '#10b981'; // Verde
          break;
        default:
          bgColor = '#e5e7eb';
          borderColor = '#6b7280';
      }

      return {
        id: reservation.id,
        group: reservation.table_id,
        title: (
          <div className="px-2 py-1">
            <div className="font-semibold text-sm truncate">
              {reservation.customer?.name || 'Sin nombre'}
            </div>
            <div className="text-xs text-gray-600">
              {reservation.party_size} pax · {duration}min
            </div>
          </div>
        ),
        start_time: resTime.valueOf(),
        end_time: endResTime.valueOf(),
        itemProps: {
          style: {
            background: bgColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            color: '#1f2937'
          }
        }
      };
    });

  // Calcular % ocupación
  const calculateOccupancy = () => {
    if (filteredTables.length === 0) return 0;
    
    const totalMinutes = (shift.end - shift.start) * 60;
    const occupiedMinutes = items.reduce((sum, item) => {
      return sum + ((item.end_time - item.start_time) / 60000);
    }, 0);
    
    const maxPossibleMinutes = filteredTables.length * totalMinutes;
    return Math.round((occupiedMinutes / maxPossibleMinutes) * 100);
  };

  const occupancy = calculateOccupancy();

  // Handlers
  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ocupación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Selector de fecha */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <button
                onClick={handlePrevDay}
                className="p-2 hover:bg-white rounded transition-colors"
              >
                <span className="text-gray-600">←</span>
              </button>
              
              <div className="px-4 py-2 min-w-[200px] text-center">
                <div className="text-sm text-gray-500">
                  {format(selectedDate, 'EEEE', { locale: es })}
                </div>
                <div className="font-semibold text-gray-900">
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </div>

              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-white rounded transition-colors"
              >
                <span className="text-gray-600">→</span>
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Hoy
            </button>
          </div>

          {/* Selector de turno */}
          <div className="flex items-center gap-2">
            {Object.entries(shifts).map(([key, shift]) => (
              <button
                key={key}
                onClick={() => setSelectedShift(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedShift === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                {shift.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Ocupación</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">{occupancy}%</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Reservas</div>
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Mesas activas</div>
            <div className="text-2xl font-bold text-gray-900">{filteredTables.length}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Comensales</div>
            <div className="text-2xl font-bold text-gray-900">
              {reservations.reduce((sum, r) => sum + (r.party_size || 0), 0)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">Estados:</span>
          
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500" />
            <span className="text-gray-600">Reservada</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-500" />
            <span className="text-gray-600">Ocupada</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" />
            <span className="text-gray-600">Completada</span>
          </div>
        </div>
      </div>

      {/* Timeline Gantt */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay mesas disponibles con los filtros seleccionados</p>
          </div>
        ) : (
          <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={startTime}
            defaultTimeEnd={endTime}
            visibleTimeStart={startTime.valueOf()}
            visibleTimeEnd={endTime.valueOf()}
            canMove={false}
            canResize={false}
            canChangeGroup={false}
            lineHeight={60}
            itemHeightRatio={0.75}
            minZoom={60 * 60 * 1000} // 1 hora
            maxZoom={12 * 60 * 60 * 1000} // 12 horas
            sidebarWidth={200}
            rightSidebarWidth={0}
            traditionalZoom={false}
            stackItems={false}
            timeSteps={{
              second: 1,
              minute: 15,
              hour: 1,
              day: 1,
              month: 1,
              year: 1
            }}
          />
        )}
      </div>
    </div>
  );
};