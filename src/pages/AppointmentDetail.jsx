import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function AppointmentDetail() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [appointment, setAppointment] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountPaid, setAmountPaid] = useState('0.00');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const terminology = user?.business?.terminology || {
    customer: 'Cliente',
    booking: 'Cita',
  };

  useEffect(() => {
    loadAppointmentDetail();
  }, [appointmentId]);

  const loadAppointmentDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointmentById(appointmentId);
      setAppointment(data.appointment);
      setCustomer(data.customer);
      setCustomerHistory(data.customerHistory || []);
      setAmountPaid(parseFloat(data.appointment.amount_paid || 0).toFixed(2));
      setNotes(data.appointment.notes || '');
    } catch (error) {
      console.error('Error cargando detalle:', error);
      alert('Error al cargar la cita');
      navigate('/appointments/today');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      await loadAppointmentDetail();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleSaveAmount = async () => {
    try {
      await api.updateAppointment(appointmentId, {
        amount_paid: parseFloat(amountPaid)
      });
      setIsEditingAmount(false);
      await loadAppointmentDetail();
    } catch (error) {
      console.error('Error guardando monto:', error);
      alert('Error al guardar el monto');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.updateAppointment(appointmentId, {
        notes: notes
      });
      setIsEditingNotes(false);
      await loadAppointmentDetail();
    } catch (error) {
      console.error('Error guardando notas:', error);
      alert('Error al guardar las notas');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.deleteAppointment(appointmentId);
      navigate('/appointments/today');
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Cita no encontrada</p>
        <Button 
        variant="outline"
        onClick={() => navigate('/dashboard')} 
        className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.appointment_time);
  const dateStr = appointmentDate.toLocaleDateString('es-ES', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const timeStr = appointmentDate.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            className="gap-2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {appointment.service_name}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{timeStr}</span>
                  {appointment.duration_minutes && (
                    <span className="text-sm">({appointment.duration_minutes} min)</span>
                  )}
                </div>
              </div>
            </div>

            <StatusBadge status={appointment.status} />
          </div>

          {/* Status Actions */}
          <div className="flex gap-2 mb-6">
            {appointment.status === 'pendiente' && (
              <Button
                size="sm"
                onClick={() => handleUpdateStatus('confirmado')}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar
              </Button>
            )}
            {(appointment.status === 'confirmado' || appointment.status === 'pendiente') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus('completada')}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Marcar Completada
              </Button>
            )}
            {appointment.status !== 'cancelada' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleUpdateStatus('cancelada')}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>

          {/* Amount Paid */}
          <div className="bg-[#0a1820] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-gray-400">Monto pagado:</span>
              </div>
              
              {!isEditingAmount ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">
                    €{parseFloat(appointment.amount_paid || 0).toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingAmount(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-32"
                  />
                  <Button size="sm" onClick={handleSaveAmount}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingAmount(false);
                      setAmountPaid(parseFloat(appointment.amount_paid || 0).toFixed(2));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Notes - Editable */}
          <div className="mt-4 bg-[#0a1820] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Notas de la Cita</h3>
              {!isEditingNotes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingNotes(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!isEditingNotes ? (
              <p className="text-gray-300 whitespace-pre-wrap">
                {notes || 'Sin notas adicionales. Haz click en editar para agregar.'}
              </p>
            ) : (
              <div className="space-y-3">
                <textarea
                  className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre la cita: servicios adicionales, observaciones, etc."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes}>
                    <Save className="h-4 w-4 mr-1" />
                    Guardar Notas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(appointment.notes || '');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      {customer && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del {terminology.customer}
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                Ver Perfil Completo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-semibold',
                  customer.is_vip ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                )}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{customer.name}</span>
                    {customer.is_vip && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#0a1820] p-4 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Total de visitas</p>
                <p className="text-2xl font-bold text-white">{customer.total_visits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer History */}
      {customerHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <History className="h-5 w-5" />
              Historial del Cliente
            </h2>
            <div className="space-y-2">
              {customerHistory.map((apt) => (
                <HistoryItem key={apt.id} appointment={apt} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pendiente: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800',
      icon: AlertCircle,
    },
    confirmado: {
      label: 'Confirmada',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
    },
    completada: {
      label: 'Completada',
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircle,
    },
    cancelada: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800',
      icon: X,
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;
  const Icon = config.icon;

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1', config.color)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function HistoryItem({ appointment }) {
  const date = new Date(appointment.appointment_time);
  const dateStr = date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="flex items-center justify-between p-3 bg-[#0a1820] rounded-lg border border-gray-700">
      <div>
        <p className="font-medium text-white">{appointment.service_name}</p>
        <p className="text-sm text-gray-400">{dateStr}</p>
      </div>
      <div className="text-right">
        {appointment.amount_paid > 0 && (
          <p className="text-green-500 font-semibold">
            €{parseFloat(appointment.amount_paid).toFixed(2)}
          </p>
        )}
        <StatusBadge status={appointment.status} />
      </div>
    </div>
  );
};