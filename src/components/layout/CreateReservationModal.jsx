import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, Users, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function CreateReservationModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    // Customer info
    customerId: null,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Reservation details
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '20:00',
    partySize: 2,
    
    // Optional
    specialOccasion: '',
    specialRequests: '',
  });

  const terminology = user?.business?.terminology || {
    booking: 'Reserva',
    customer: 'Cliente',
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setStep(1);
      setError('');
      setFormData({
        customerId: null,
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: '20:00',
        partySize: 2,
        specialOccasion: '',
        specialRequests: '',
      });
    }
  }, [isOpen]);

  const searchCustomers = async (term) => {
    if (term.length < 2) {
      setCustomers([]);
      return;
    }
    
    try {
      const response = await api.getCustomers({ search: term });
      setCustomers(response.customers || []);
    } catch (error) {
      console.error('Error buscando clientes:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchCustomers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const selectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
    });
    setSearchTerm(customer.name);
    setCustomers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!formData.customerName || !formData.customerPhone) {
      setError('Nombre y teléfono del cliente son requeridos');
      setLoading(false);
      return;
    }

    if (!formData.reservationDate || !formData.reservationTime || !formData.partySize) {
      setError('Fecha, hora y número de personas son requeridos');
      setLoading(false);
      return;
    }

    try {
      await api.createReservation({
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        partySize: parseInt(formData.partySize),
        specialOccasion: formData.specialOccasion,
        specialRequests: formData.specialRequests,
        source: 'manual',
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error creando la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nueva {terminology.booking}</CardTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className={`h-2 w-24 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`h-2 w-24 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>

            {/* Step 1: Customer Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  1. Información del {terminology.customer.toLowerCase()}
                </h3>

                {/* Search existing customer */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Buscar {terminology.customer.toLowerCase()} existente
                  </label>
                  <div className="relative">
                    <Input
                      placeholder={`Buscar por nombre o teléfono...`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!e.target.value) {
                          setFormData({
                            ...formData,
                            customerId: null,
                            customerName: '',
                            customerPhone: '',
                            customerEmail: '',
                          });
                        }
                      }}
                    />
                    {customers.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                        {customers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => selectCustomer(customer)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    O completa los datos manualmente abajo
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        <User className="inline h-4 w-4 mr-1" />
                        Nombre completo *
                      </label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Teléfono *
                      </label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="+34 600 123 456"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email (opcional)
                    </label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Reservation Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  2. Detalles de la {terminology.booking.toLowerCase()}
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Fecha *
                    </label>
                    <Input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Hora *
                    </label>
                    <Input
                      type="time"
                      value={formData.reservationTime}
                      onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    <Users className="inline h-4 w-4 mr-1" />
                    Número de personas *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ocasión especial
                  </label>
                  <select
                    value={formData.specialOccasion}
                    onChange={(e) => setFormData({ ...formData, specialOccasion: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Ninguna</option>
                    <option value="birthday">Cumpleaños</option>
                    <option value="anniversary">Aniversario</option>
                    <option value="business">Cena de negocios</option>
                    <option value="celebration">Celebración</option>
                    <option value="other">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Solicitudes especiales
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={3}
                    placeholder="Ej: Terraza, mesa junto a ventana, silla para bebé..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : `Crear ${terminology.booking.toLowerCase()}`}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};