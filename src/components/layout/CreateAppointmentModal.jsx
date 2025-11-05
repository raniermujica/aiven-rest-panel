import { useState, useEffect, useCallback } from 'react'; // ✅ Agregar useCallback
import { X, AlertCircle, CheckCircle, Clock, Plus, Trash2, Mail } from 'lucide-react';
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
  
  const [selectedServices, setSelectedServices] = useState([]);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    scheduledDate: '',
    appointmentTime: '',
    notes: '',
  });

  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true);
  const [tempServiceId, setTempServiceId] = useState('');

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    customer: 'Cliente',
    service: 'Servicio',
  };

  // Cargar servicios
  useEffect(() => {
    if (isOpen) {
      loadServices();
      
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        scheduledDate: today,
        appointmentTime: '10:00',
        notes: '',
      });
      setAvailability(null);
      setSelectedServices([]);
      setTempServiceId('');
      setError('');
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

  // ✅ Calcular duración total del carrito
  const getTotalDuration = useCallback(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  // ✅ Agregar servicio al carrito
  const handleAddService = () => {
    if (!tempServiceId) return;
    
    const service = services.find(s => s.id === tempServiceId);
    if (!service) return;

    if (selectedServices.find(s => s.serviceId === service.id)) {
      setError('Este servicio ya está agregado');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedServices([...selectedServices, {
      serviceId: service.id,
      serviceName: service.name,
      durationMinutes: service.duration_minutes || 60,
      price: service.price || 0,
    }]);

    setTempServiceId('');
  };

  // ✅ Eliminar servicio del carrito
  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.serviceId !== serviceId));
  };

  // ✅ FUNCIÓN DE VERIFICACIÓN DE DISPONIBILIDAD (con useCallback)
  const checkAvailability = useCallback(async () => {
    if (!formData.scheduledDate || !formData.appointmentTime || selectedServices.length === 0) {
      setAvailability(null);
      return;
    }

    try {
      setCheckingAvailability(true);
      
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
      
      const result = await api.checkAppointmentAvailability(
        formData.scheduledDate,
        formData.appointmentTime,
        totalDuration
      );
      
      setAvailability(result);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, [formData.scheduledDate, formData.appointmentTime, selectedServices]);

  // ✅ Ejecutar verificación cuando cambian fecha/hora/servicios
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // ✅ Validación de email
  const validateEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    if (formData.clientEmail && !validateEmail(formData.clientEmail)) {
      setError('El formato del email no es válido');
      setLoading(false);
      return;
    }

    if (!formData.scheduledDate || !formData.appointmentTime) {
      setError('Fecha y hora son requeridas');
      setLoading(false);
      return;
    }

    if (selectedServices.length === 0) {
      setError('Debes agregar al menos un servicio');
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
      const response = await api.createAppointment({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail || null,
        scheduledDate: formData.scheduledDate,
        appointmentTime: formData.appointmentTime,
        services: selectedServices, 
        notes: formData.notes,
      });

      // Enviar email de confirmación si está activado y hay email
      if (sendEmailConfirmation && formData.clientEmail && response.appointment?.id) {
        try {
          await api.sendAppointmentConfirmation(response.appointment.id);
          console.log('✅ Email de confirmación enviado');
        } catch (emailError) {
          console.error('⚠️ Error enviando email:', emailError);
        }
      }

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

  const totalDuration = getTotalDuration();
  const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nueva {terminology.booking}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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

          {/* ✅ EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              placeholder="juan@example.com"
            />
            <p className="text-xs text-gray-400 mt-1">
              📧 Se enviará confirmación por email si se proporciona
            </p>
          </div>

          {/* SERVICIOS */}
          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Servicios *
            </label>
            
            <div className="flex gap-2 mb-3">
              <select
                className="flex-1 px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={tempServiceId}
                onChange={(e) => setTempServiceId(e.target.value)}
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
              <Button
                type="button"
                onClick={handleAddService}
                disabled={!tempServiceId}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            {selectedServices.length > 0 && (
              <div className="bg-[#0a1820] border border-gray-700 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Servicios seleccionados ({selectedServices.length})
                </p>
                {selectedServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#1a2f38] p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{service.serviceName}</p>
                      <p className="text-xs text-gray-400">
                        {service.durationMinutes} min
                        {service.price > 0 && ` • €${service.price}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(service.serviceId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duración total:</span>
                    <span className="font-semibold text-white">{totalDuration} min</span>
                  </div>
                  {totalPrice > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Precio total:</span>
                      <span className="font-semibold text-green-400">€{totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          {formData.scheduledDate && formData.appointmentTime && selectedServices.length > 0 && (
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
                    <p className="text-xs text-green-400 mt-1">
                      Duración: {totalDuration} min ({formData.appointmentTime} - 
                      {new Date(new Date(`2000-01-01T${formData.appointmentTime}`).getTime() + totalDuration * 60000).toTimeString().slice(0, 5)})
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-200">Horario no disponible</p>
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
            <textarea
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
            />
          </div>

          {/* Checkbox Email */}
          {formData.clientEmail && (
            <div className="flex items-center space-x-2 bg-blue-900/20 border border-blue-700/30 p-3 rounded-lg">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmailConfirmation}
                onChange={(e) => setSendEmailConfirmation(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-300 cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Enviar email de confirmación al cliente
              </label>
            </div>
          )}

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
              disabled={loading || checkingAvailability || selectedServices.length === 0 || (availability && !availability.available)}
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