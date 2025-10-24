import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  
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

    try {
      // Combinar fecha y hora en formato ISO
      const scheduledDateTime = `${formData.scheduledDate}T${formData.appointmentTime}:00Z`;

      await api.createAppointment({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        scheduledDate: scheduledDateTime,
        appointmentTime: scheduledDateTime,
        serviceName: formData.serviceName || 'Servicio',
        serviceId: formData.serviceId,
        durationMinutes: formData.durationMinutes,
        notes: formData.notes,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creando cita:', error);
      setError(error.message || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Nueva {terminology.booking}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {terminology.service}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.serviceId || ''}
              onChange={handleServiceChange}
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              disabled={loading}
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