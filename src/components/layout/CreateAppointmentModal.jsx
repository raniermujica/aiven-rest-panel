import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    scheduledDate: '',
    appointmentTime: '',
    serviceName: '',
    serviceId: null,
    durationMinutes: 60,
    notes: '',
  });

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    customer: 'Cliente',
    service: 'Servicio',
  };

  // Cargar servicios
  useEffect(() => {
    if (isOpen) {
      loadServices();
      
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        scheduledDate: today,
        appointmentTime: '10:00',
      }));
      setAvailability(null);
    }
  }, [isOpen]);
  
  const loadServices = async () => {
    try {
      const response = await api.getServices();
      setServices(response.services || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  // Check availability cuando cambia fecha/hora/duración
  useEffect(() => {
    if (formData.scheduledDate && formData.appointmentTime && formData.durationMinutes) {
      checkAvailability();
    }
  }, [formData.scheduledDate, formData.appointmentTime, formData.durationMinutes]);

  const checkAvailability = async () => {
    if (!formData.scheduledDate || !formData.appointmentTime) return;

    try {
      setCheckingAvailability(true);
      
      // Pasar hora en formato correcto
      const result = await api.checkAppointmentAvailability(
        formData.scheduledDate,
        formData.appointmentTime,
        formData.durationMinutes
      );
      
      setAvailability(result);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = services.find(s => s.id === serviceId);
    
    setFormData({
      ...formData,
      serviceId: serviceId || null,
      serviceName: service?.name || '',
      durationMinutes: service?.duration_minutes || 60,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Validaciones
  if (!formData.clientName || !formData.clientPhone) {
    setError('Nombre y teléfono del cliente son requeridos');
    setLoading(false);
    return;
  }

  if (!formData.scheduledDate || !formData.appointmentTime) {
    setError('Fecha y hora son requeridas');
    setLoading(false);
    return;
  }

  // Validar disponibilidad
  if (availability && !availability.available) {
    setError('El horario seleccionado no está disponible. Por favor elige otro horario.');
    setLoading(false);
    return;
  }

  try {
    await api.createAppointment({
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      scheduledDate: formData.scheduledDate,        // YYYY-MM-DD
      appointmentTime: formData.appointmentTime,      // HH:MM
      serviceName: formData.serviceName || 'Servicio',
      serviceId: formData.serviceId,
      durationMinutes: formData.durationMinutes,
      notes: formData.notes,
    });

    onSuccess();
  } catch (error) {
    console.error('Error creando cita:', error);
    
    if (error.response?.status === 409) {
      setError(error.response.data.message || 'Ya existe una cita en ese horario');
    } else {
      setError(error.message || 'Error al crear la cita');
    }
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    // ✅ CAMBIO 1: Overlay más oscuro
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {/* ✅ CAMBIO 2: Modal con fondo oscuro */}
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* ✅ CAMBIO 3: Header con border gris */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nueva {terminology.booking}</h2>
          {/* ✅ CAMBIO 4: Botón cerrar en gris */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Cliente */}
          <div>
            {/* ✅ CAMBIO 5: Labels en gris claro */}
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre del {terminology.customer} *
            </label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Teléfono *
            </label>
            <Input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="34612345678"
              required
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {terminology.service}
            </label>
            {/* ✅ CAMBIO 6: Select con fondo oscuro */}
            <select
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.serviceId || ''}
              onChange={handleServiceChange}
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.emoji && `${service.emoji} `}
                  {service.name} ({service.duration_minutes} min
                  {service.price && ` - €${service.price}`})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fecha *
              </label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hora *
              </label>
              <Input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Availability Check */}
          {formData.scheduledDate && formData.appointmentTime && (
            // ✅ CAMBIO 7: Indicador de disponibilidad con fondos oscuros
            <div className={cn(
              'p-3 rounded-lg text-sm flex items-start gap-2 border',
              checkingAvailability ? 'bg-gray-800/50 text-gray-300 border-gray-700' :
              availability?.available ? 'bg-green-900/30 text-green-300 border-green-700/50' :
              'bg-red-900/30 text-red-300 border-red-700/50'
            )}>
              {checkingAvailability ? (
                <>
                  <Clock className="h-5 w-5 animate-spin flex-shrink-0 mt-0.5" />
                  <span>Verificando disponibilidad...</span>
                </>
              ) : availability?.available ? (
                <>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-200">Horario disponible</p>
                    {availability.total_appointments_that_day > 0 && (
                      <p className="text-xs mt-1 text-green-400">
                        {availability.total_appointments_that_day} cita(s) ese día
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-200">Horario no disponible</p>
                    {availability?.has_conflict && availability?.conflicting_appointment && (
                      <p className="text-xs mt-1 text-red-400">
                        Conflicto con: {availability.conflicting_appointment.client_name} 
                        {' '}({availability.conflicting_appointment.duration} min)
                      </p>
                    )}
                    {availability?.business_hours_message && (
                      <p className="text-xs mt-1 text-red-400">{availability.business_hours_message}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notas
            </label>
            {/* ✅ CAMBIO 8: Textarea con fondo oscuro */}
            <textarea
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || checkingAvailability || (availability && !availability.available)}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear ' + terminology.booking}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};