import { useState } from 'react';
import { X, Ban, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function BlockSlotModal({ open, onClose, onSave, initialDate = null, initialTime = null }) {
  const [blockType, setBlockType] = useState('time_range');
  const [selectedDate, setSelectedDate] = useState(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(initialTime || '09:00');
  const [endTime, setEndTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      let blockedFrom, blockedUntil;
      let finalBlockType = blockType;

      if (blockType === 'full_day') {
        // Día completo: usar 'full_restaurant'
        finalBlockType = 'full_restaurant';
        blockedFrom = selectedDate + 'T00:00:00';
        blockedUntil = selectedDate + 'T23:59:59';
      } else if (blockType === 'date_range') {
        // Rango de días: usar 'full_restaurant' con fechas extendidas
        if (!endDate) {
          setError('Selecciona una fecha de fin');
          setLoading(false);
          return;
        }
        finalBlockType = 'full_restaurant';
        blockedFrom = selectedDate + 'T00:00:00';
        blockedUntil = endDate + 'T23:59:59';
      } else {
        // Franja horaria: usar 'time_range'
        if (!endTime) {
          setError('Selecciona una hora de fin');
          setLoading(false);
          return;
        }
        finalBlockType = 'time_range';
        blockedFrom = selectedDate + `T${startTime}:00`;
        blockedUntil = selectedDate + `T${endTime}:00`;
      }

      const data = {
        block_type: finalBlockType,
        blocked_from: blockedFrom,
        blocked_until: blockedUntil,
        reason: reason.trim() || null,
      };

      console.log('[BlockSlotModal] Enviando datos:', data);

      await onSave(data);
      handleClose();
    } catch (err) {
      console.error('Error creando bloqueo:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear bloqueo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBlockType('time_range');
    setSelectedDate(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setStartTime(initialTime || '09:00');
    setEndTime('');
    setEndDate('');
    setReason('');
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center border border-red-700/50">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Bloquear horario</h2>
              <p className="text-sm text-gray-400">Impide que se agenden citas</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 text-red-300 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-700/50">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de bloqueo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de bloqueo
            </label>
            <select
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="time_range">Franja horaria</option>
              <option value="full_day">Día completo</option>
              <option value="date_range">Rango de días</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {blockType === 'time_range' && 'Bloquea una franja horaria específica'}
              {blockType === 'full_day' && 'Bloquea todo el día (00:00 - 23:59)'}
              {blockType === 'date_range' && 'Bloquea varios días consecutivos'}
            </p>
          </div>

          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha {blockType === 'date_range' ? 'de inicio' : ''}
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Fecha de fin (solo para date_range) */}
          {blockType === 'date_range' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de fin
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={selectedDate}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Horarios (solo para time_range) */}
          {blockType === 'time_range' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora inicio
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora fin
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Vacaciones, Mantenimiento, Evento especial..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Este mensaje se mostrará al intentar agendar en este horario
            </p>
          </div>

          {/* Resumen visual */}
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
            <p className="text-sm text-gray-300 mb-1">
              <span className="font-semibold text-white">Se bloqueará:</span>
            </p>
            <p className="text-sm text-red-300">
              {blockType === 'full_day' && (
                <>📅 Todo el día {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}</>
              )}
              {blockType === 'date_range' && endDate && (
                <>📅 Del {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })} al {format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}</>
              )}
              {blockType === 'time_range' && endTime && (
                <>🕐 {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })} de {startTime} a {endTime}</>
              )}
            </p>
            {reason && (
              <p className="text-xs text-gray-400 mt-2">
                Motivo: {reason}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Guardando...' : 'Bloquear horario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};