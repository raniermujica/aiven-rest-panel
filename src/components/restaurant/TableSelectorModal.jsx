// src/components/restaurant/TableSelectorModal.jsx

import { useState, useEffect } from 'react';
import { X, Users, UtensilsCrossed, AlertCircle, Loader2, CheckCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { assignTable, createTableAssignment, getTableStatus } from '@/services/tablesApi';
import { cn } from '@/lib/utils';

export function TableSelectorModal({ 
  isOpen, 
  appointmentId,
  appointmentDate, 
  appointmentTime,
  partySize, 
  duration = 90,
  currentTableId = null,
  onTableAssigned,
  onClose 
}) {
  const { token, user } = useAuthStore();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(currentTableId);
  const [viewMode, setViewMode] = useState('suggested'); // 'suggested' | 'all'

  useEffect(() => {
    if (isOpen) {
      loadAvailableTables();
    }
  }, [isOpen, appointmentDate]);

  const loadAvailableTables = async () => {
    try {
      setLoading(true);
      
      // Obtener estado de todas las mesas para la fecha
      const data = await getTableStatus(token, user.business.slug, appointmentDate);
      
      // Filtrar y clasificar mesas
      const allTables = data.tables || [];
      
      // Calcular disponibilidad considerando el horario de la cita
      const tablesWithAvailability = allTables.map(table => {
        const isAvailable = checkTableAvailability(table, appointmentTime, duration);
        const isSuitable = table.min_capacity <= partySize && table.capacity >= partySize;
        const score = calculateTableScore(table, partySize);
        
        return {
          ...table,
          isAvailable,
          isSuitable,
          score,
          isCurrent: table.id === currentTableId
        };
      });

      // Ordenar por score (mejores primero)
      tablesWithAvailability.sort((a, b) => b.score - a.score);
      
      setTables(tablesWithAvailability);
    } catch (error) {
      console.error('Error cargando mesas:', error);
      alert('Error al cargar mesas disponibles');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si la mesa está disponible en el horario
  const checkTableAvailability = (table, time, duration) => {
    if (!table.reservations || table.reservations.length === 0) return true;
    
    const [hours, minutes] = time.split(':').map(Number);
    const requestStart = hours * 60 + minutes;
    const requestEnd = requestStart + duration;

    for (const reservation of table.reservations) {
      const [resHours, resMinutes] = reservation.time.split(':').map(Number);
      const resStart = resHours * 60 + resMinutes;
      const resEnd = resStart + (reservation.duration || 90);

      // Detectar solapamiento
      if (requestStart < resEnd && requestEnd > resStart) {
        return false;
      }
    }

    return true;
  };

  // Calcular score de adecuación de la mesa
  const calculateTableScore = (table, partySize) => {
    let score = 100;

    // Penalizar si no está disponible
    if (!table.isAvailable) score -= 50;

    // Penalizar si no es adecuada por capacidad
    if (table.capacity < partySize) score -= 100;
    if (table.min_capacity > partySize) score -= 30;

    // Recompensar capacidad exacta o +1
    const capacityDiff = table.capacity - partySize;
    if (capacityDiff === 0) score += 20; // Capacidad perfecta
    else if (capacityDiff === 1) score += 15; // Capacidad +1
    else if (capacityDiff > 1) score -= capacityDiff * 5; // Penalizar desperdicio

    // Prioridad de la mesa
    score -= table.priority * 2;

    // Terraza tiene menor prioridad
    if (table.table_type === 'terraza') score -= 5;

    return Math.max(0, score);
  };

  const handleAssignTable = async () => {
    if (!selectedTableId) {
      alert('Por favor selecciona una mesa');
      return;
    }

    try {
      setAssigning(true);

      await createTableAssignment(token, user.business.slug, {
        appointmentId,
        tableId: selectedTableId
      });

      alert('✅ Mesa asignada correctamente');
      onTableAssigned();
      onClose();
    } catch (error) {
      console.error('Error asignando mesa:', error);
      alert('Error al asignar la mesa');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  // Filtrar mesas según modo de vista
  const displayTables = viewMode === 'suggested' 
    ? tables.filter(t => t.isSuitable && t.isAvailable)
    : tables;

  const suggestedCount = tables.filter(t => t.isSuitable && t.isAvailable).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#0a1820] p-6 shadow-xl border border-gray-700">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Seleccionar Mesa
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {partySize} personas • {appointmentTime} • {duration} minutos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'suggested' ? 'default' : 'outline'}
            onClick={() => setViewMode('suggested')}
            className={viewMode === 'suggested' ? 'bg-blue-600' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Sugeridas ({suggestedCount})
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'bg-blue-600' : ''}
          >
            Todas ({tables.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : displayTables.length === 0 ? (
          <div className="rounded-lg bg-[#1a2f38] border border-gray-700 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">
              No hay mesas {viewMode === 'suggested' ? 'sugeridas' : 'disponibles'}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {viewMode === 'suggested' 
                ? 'Intenta ver todas las mesas o ajustar el horario de la reserva'
                : 'No hay mesas configuradas para este restaurante'}
            </p>
            {viewMode === 'suggested' && (
              <Button onClick={() => setViewMode('all')} variant="outline">
                Ver todas las mesas
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Tables Grid */}
            <div className="grid gap-3 md:grid-cols-2 mb-6">
              {displayTables.map(table => (
                <TableOption
                  key={table.id}
                  table={table}
                  partySize={partySize}
                  selected={selectedTableId === table.id}
                  onSelect={() => setSelectedTableId(table.id)}
                />
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 bg-transparent text-white hover:bg-[#1a2f38]"
                disabled={assigning}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignTable}
                disabled={!selectedTableId || assigning}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Asignar Mesa
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente para cada opción de mesa
function TableOption({ table, partySize, selected, onSelect }) {
  const getStatusColor = () => {
    if (table.isCurrent) return 'border-blue-500 bg-blue-500/10';
    if (!table.isAvailable) return 'border-red-500/50 bg-red-500/5';
    if (!table.isSuitable) return 'border-yellow-500/50 bg-yellow-500/5';
    if (selected) return 'border-green-500 bg-green-500/10';
    return 'border-gray-700 bg-[#1a2f38] hover:border-blue-500/50';
  };

  const getRecommendationBadge = () => {
    if (table.isCurrent) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/50 px-2 py-0.5 text-xs font-medium text-blue-400">
          <CheckCircle className="h-3 w-3" />
          Actual
        </span>
      );
    }
    
    if (table.score >= 100 && table.isAvailable && table.isSuitable) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 border border-green-500/50 px-2 py-0.5 text-xs font-medium text-green-400">
          ⭐ Recomendada
        </span>
      );
    }

    if (!table.isAvailable) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/50 px-2 py-0.5 text-xs font-medium text-red-400">
          <AlertCircle className="h-3 w-3" />
          Ocupada
        </span>
      );
    }

    if (!table.isSuitable) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 px-2 py-0.5 text-xs font-medium text-yellow-400">
          <AlertCircle className="h-3 w-3" />
          Capacidad no ideal
        </span>
      );
    }

    return null;
  };

  const capacityDiff = table.capacity - partySize;
  const isDisabled = !table.isAvailable || (!table.isSuitable && capacityDiff < 0);

  return (
    <button
      onClick={() => !isDisabled && onSelect()}
      disabled={isDisabled}
      className={cn(
        'rounded-lg border-2 p-4 text-left transition-all',
        getStatusColor(),
        !isDisabled && 'cursor-pointer hover:scale-[1.02]',
        isDisabled && 'opacity-50 cursor-not-allowed',
        selected && 'ring-2 ring-green-500'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Mesa {table.table_number}
            {selected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </h3>
        </div>
        {getRecommendationBadge()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-gray-400">
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

        {/* Info adicional */}
        <div className="text-xs text-gray-500">
          {capacityDiff === 0 && <p className="text-green-400">✓ Capacidad perfecta</p>}
          {capacityDiff === 1 && <p className="text-green-400">✓ Capacidad óptima</p>}
          {capacityDiff > 1 && table.isSuitable && (
            <p className="text-yellow-400">⚠ Sobra espacio ({capacityDiff} personas)</p>
          )}
          {capacityDiff < 0 && (
            <p className="text-red-400">✗ Capacidad insuficiente</p>
          )}
        </div>

        {/* Reservas del día */}
        {table.reservations && table.reservations.length > 0 && (
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
            <p className="font-semibold mb-1">Reservas del día:</p>
            <div className="space-y-1">
              {table.reservations.slice(0, 3).map((res, idx) => (
                <p key={idx}>• {res.time} - {res.customerName} ({res.partySize} pax)</p>
              ))}
              {table.reservations.length > 3 && (
                <p className="text-gray-600">+ {table.reservations.length - 3} más...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  );
};