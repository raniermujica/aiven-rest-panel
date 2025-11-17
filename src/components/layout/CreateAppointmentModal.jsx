import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Phone, Mail, Scissors, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

export function CreateAppointmentModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 2,
    serviceId: '',
    specialRequests: '',
    tablePreference: '', 
  });

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
  };

  const isRestaurant = user?.business?.type === 'restaurant';

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (!isRestaurant) {
        loadServices();
      }
      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        reservationDate: '',
        reservationTime: '',
        partySize: isRestaurant ? 2 : 1,
        serviceId: '',
        specialRequests: '',
        tablePreference: '',
      });
    }
  }, [isOpen]);

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
    setLoading(true);

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

      // Agregar campos específicos según tipo de negocio
      if (isRestaurant) {
        if (formData.tablePreference) {
          payload.tablePreference = formData.tablePreference;
        }
      } else {
        // Para beauty/otros: agregar servicio
        if (formData.serviceId) {
          payload.serviceId = formData.serviceId;
        }
      }

      await api.createReservation(payload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert(error.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#0a1820] border border-gray-700 shadow-xl">
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
          {/* Sección: Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Información del {terminology.customer.toLowerCase()}
            </h3>

            {/* Selector de cliente existente */}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-white">
                  <User className="inline h-4 w-4 mr-1" />
                  Nombre completo *
                </label>
                <Input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                  className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Teléfono *
                </label>
                <Input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+34 600 123 456"
                  required
                  className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="ejemplo@email.com"
                className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Sección: Detalles de la reserva */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Detalles de la {terminology.booking.toLowerCase()}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-white">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
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
                  className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Campo específico para RESTAURANTES */}
            {isRestaurant && (
              <>
                <div>
                  <label className="text-sm font-medium text-white">
                    <Users className="inline h-4 w-4 mr-1" />
                    Número de comensales *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                    required
                    className="mt-1 bg-[#1a2f38] border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Preferencia de ubicación
                  </label>
                  <select
                    value={formData.tablePreference}
                    onChange={(e) => setFormData({ ...formData, tablePreference: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Asignación automática</option>
                    <option value="salon">Preferencia: Salón</option>
                    <option value="terraza">Preferencia: Terraza</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    El sistema asignará automáticamente la mejor mesa disponible
                  </p>
                </div>
              </>
            )}

            {/* Campo específico para BEAUTY/OTROS */}
            {!isRestaurant && (
              <div>
                <label className="text-sm font-medium text-white">
                  <Scissors className="inline h-4 w-4 mr-1" />
                  Servicio
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar servicio...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} {service.price && `- €${service.price}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-white">
                <Scissors className="inline h-4 w-4 mr-1" />
                {isRestaurant ? 'Solicitudes especiales' : 'Notas adicionales'}
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-600 bg-[#1a2f38] px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder={isRestaurant ? 
                  'Ej: Alergia a frutos secos, mesa junto a ventana...' :
                  'Ej: Primera vez, cliente VIP, ocasión especial...'}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-600 bg-transparent text-white hover:bg-[#1a2f38]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creando...' : 'Crear ' + terminology.booking}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};