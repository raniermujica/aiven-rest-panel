import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Plus, Trash2, Calendar, User, Phone, Mail, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // ✅ CARRITO DE SERVICIOS
  const [selectedServices, setSelectedServices] = useState([]);
  const [tempServiceId, setTempServiceId] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 2,
    specialRequests: '',
    tablePreference: '',
  });

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    customer: 'Cliente',
  };

  const isRestaurant = user?.business?.type === 'restaurant';

  // Inicializar modal
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (!isRestaurant) {
        loadServices();
      }
      
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        reservationDate: today,
        reservationTime: '10:00',
        partySize: isRestaurant ? 2 : 1,
        specialRequests: '',
        tablePreference: '',
      });
      setSelectedServices([]);
      setTempServiceId('');
      setAvailability(null);
      setError('');
    }
  }, [isOpen, isRestaurant]);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  // ✅ CALCULAR DURACIÓN TOTAL
  const getTotalDuration = () => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  };

  // ✅ CALCULAR PRECIO TOTAL
  const getTotalPrice = () => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  // ✅ AGREGAR SERVICIO AL CARRITO
  const handleAddService = () => {
    if (!tempServiceId) return;
    
    const service = services.find(s => s.id === tempServiceId);
    if (!service) return;

    // Verificar si ya está en el carrito
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
    setError('');
  };

  // ✅ ELIMINAR SERVICIO DEL CARRITO
  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.serviceId !== serviceId));
  };

  // ✅ CHECK AVAILABILITY cuando cambian fecha/hora/servicios
  useEffect(() => {
    if (formData.reservationDate && formData.reservationTime && selectedServices.length > 0) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [formData.reservationDate, formData.reservationTime, selectedServices]);

  const checkAvailability = async () => {
    if (!formData.reservationDate || !formData.reservationTime || selectedServices.length === 0) {
      return;
    }

    try {
      setCheckingAvailability(true);
      setError('');
      
      const totalDuration = getTotalDuration();
      
      const result = await api.checkAppointmentAvailability(
        formData.reservationDate,
        formData.reservationTime,
        totalDuration,
        selectedServices
      );
      
      setAvailability(result);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      setAvailability(null);
      setError('Error al verificar disponibilidad');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email || '',
        });
      }
    } else {
      setFormData({
        ...formData,
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!isRestaurant && selectedServices.length === 0) {
      setError('Debes agregar al menos un servicio');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      setError('Nombre y teléfono del cliente son requeridos');
      return;
    }

    if (!formData.reservationDate || !formData.reservationTime) {
      setError('Fecha y hora son requeridas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || null,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        partySize: parseInt(formData.partySize),
        specialRequests: formData.specialRequests || null,
        source: 'manual',
      };

      // Para restaurantes
      if (isRestaurant) {
        if (formData.tablePreference) {
          payload.tablePreference = formData.tablePreference;
        }
      } else {
        // Para beauty/otros: agregar servicios
        payload.services = selectedServices;
      }

      await api.createReservation(payload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error creando cita:', error);
      setError(error.response?.data?.error || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#0a1820] border border-gray-700 shadow-xl">
        <div className="sticky top-0 bg-[#0a1820] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Crear {terminology.booking}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* SECCIÓN: CLIENTE */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Información del {terminology.customer.toLowerCase()}
            </h3>

            <div>
              <label className="text-sm font-medium text-white">
                <User className="inline h-4 w-4 mr-1" />
                Seleccionar {terminology.customer.toLowerCase()} existente (opcional)
              </label>
              <select
                onChange={handleCustomerSelect}
                className="mt-1 w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Nuevo {terminology.customer.toLowerCase()}</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">
                  <User className="inline h-4 w-4 mr-1" />
                  Nombre completo *
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Nombre del cliente"
                  required
                  className="bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Teléfono *
                </label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+34 612 345 678"
                  required
                  className="bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white">
                <Mail className="inline h-4 w-4 mr-1" />
                Email (opcional)
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="email@ejemplo.com"
                className="bg-[#1a2f38] border-gray-600 text-white"
              />
            </div>
          </div>

          {/* SECCIÓN: SERVICIOS (Solo para non-restaurant) */}
          {!isRestaurant && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Servicios
              </h3>

              {/* Agregar servicio */}
              <div className="flex gap-2">
                <select
                  value={tempServiceId}
                  onChange={(e) => setTempServiceId(e.target.value)}
                  className="flex-1 rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar servicio...</option>
                  {services
                    .filter(s => !selectedServices.find(ss => ss.serviceId === s.id))
                    .map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - €{service.price} ({service.duration_minutes} min)
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAddService}
                  disabled={!tempServiceId}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Lista de servicios seleccionados */}
              {selectedServices.length > 0 && (
                <div className="space-y-2">
                  {selectedServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1a2f38] rounded-lg border border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{service.serviceName}</p>
                        <p className="text-sm text-gray-400">
                          {service.durationMinutes} min • €{service.price}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(service.serviceId)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Resumen */}
                  <div className="mt-3 p-3 bg-blue-950 rounded-lg border border-blue-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-200">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Duración total:
                      </span>
                      <span className="text-white font-semibold">{getTotalDuration()} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-blue-200">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Precio total:
                      </span>
                      <span className="text-white font-semibold">€{getTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: FECHA Y HORA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Fecha y hora
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                  required
                  className="bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Hora *
                </label>
                <Input
                  type="time"
                  value={formData.reservationTime}
                  onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                  required
                  className="bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>
            </div>

            {/* INDICADOR DE DISPONIBILIDAD */}
            {checkingAvailability && (
              <div className="flex items-center gap-2 p-3 bg-blue-950 rounded-lg border border-blue-800">
                <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                <span className="text-blue-200 text-sm">Verificando disponibilidad...</span>
              </div>
            )}

            {availability && !checkingAvailability && (
              <div
                className={cn(
                  'p-3 rounded-lg border',
                  availability.available
                    ? 'bg-green-950 border-green-800'
                    : 'bg-red-950 border-red-800'
                )}
              >
                <div className="flex items-center gap-2">
                  {availability.available ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-200 font-medium">Horario disponible</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="flex-1">
                        <span className="text-red-200 font-medium block">
                          {availability.business_hours_message || 'Horario no disponible'}
                        </span>
                        {availability.suggested_times && availability.suggested_times.length > 0 && (
                          <div className="mt-2">
                            <p className="text-red-200 text-sm mb-1">Horarios sugeridos:</p>
                            <div className="flex flex-wrap gap-2">
                              {availability.suggested_times.map((time, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, reservationTime: time })}
                                  className="px-2 py-1 bg-red-900 hover:bg-red-800 text-red-100 text-xs rounded"
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN: NOTAS */}
          <div>
            <label className="text-sm font-medium text-white">
              Notas (opcional)
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Información adicional..."
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 bg-red-950 border border-red-800 rounded-lg">
              <p className="text-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!isRestaurant && selectedServices.length === 0) || (availability && !availability.available)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creando...' : `Crear ${terminology.booking}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};