import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  Clock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'hours', label: 'Horarios', icon: Clock },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona la configuración de {user?.business?.name || 'tu negocio'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettings user={user} />}
      {activeTab === 'users' && <UsersSettings user={user} />}
      {activeTab === 'hours' && <HoursSettings user={user} />}
      {activeTab === 'notifications' && <NotificationsSettings user={user} />}
      {activeTab === 'security' && <SecuritySettings user={user} />}
    </div>
  );
}

function GeneralSettings({ user }) {
  const [formData, setFormData] = useState({
    name: user?.business?.name || '',
    email: '',
    phone: '',
    address: '',
    maxCapacity: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // TODO: Implementar actualización
    setTimeout(() => {
      setSaving(false);
      alert('Configuración guardada (simulado)');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>
            Datos básicos de tu {user?.business?.config?.name?.toLowerCase() || 'negocio'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre del negocio
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email de contacto
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@negocio.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 123 456"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Dirección
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal 123, Madrid"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Capacidad máxima (personas)
              </label>
              <Input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Tipo de negocio</span>
            <span className="text-sm font-medium">
              {user?.business?.config?.name || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">URL de acceso</span>
            <span className="text-sm font-medium text-blue-600">
              {window.location.origin}/{user?.business?.slug || 'slug'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Plan actual</span>
            <span className="text-sm font-medium">Básico</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSettings({ user }) {
  const [users, setUsers] = useState([
    { id: 1, name: user?.name || 'Usuario', email: user?.email || '', role: user?.role || 'ADMIN', isActive: true },
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del sistema</CardTitle>
              <CardDescription>
                Gestiona quién tiene acceso al panel
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="font-bold text-blue-600">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {u.role}
                  </span>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles y permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">ADMIN</h4>
              <p className="mt-1 text-sm text-gray-600">
                Acceso completo a todas las funciones del sistema
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">MANAGER</h4>
              <p className="mt-1 text-sm text-gray-600">
                Gestión de reservas, clientes y reportes
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">STAFF</h4>
              <p className="mt-1 text-sm text-gray-600">
                Ver y gestionar reservas del día
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HoursSettings({ user }) {
  const terminology = user?.business?.terminology || {};
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horario de atención</CardTitle>
          <CardDescription>
            Define los horarios en que aceptas {terminology.bookings?.toLowerCase() || 'reservas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="font-medium">{day}</span>
                </div>
                <Input type="time" className="w-32" defaultValue="12:00" />
                <span className="text-gray-500">-</span>
                <Input type="time" className="w-32" defaultValue="23:00" />
                <input type="checkbox" defaultChecked className="h-5 w-5" />
                <span className="text-sm text-gray-600">Activo</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar horarios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsSettings({ user }) {
  const [settings, setSettings] = useState({
    emailReservations: true,
    whatsappConfirmations: true,
    remindersBefore24h: true,
    dailySummary: true,
    vipAlerts: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de notificaciones</CardTitle>
          <CardDescription>
            Configura cómo y cuándo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Notificar nuevas reservas por email</p>
                <p className="text-sm text-gray-500">
                  Recibe un email cada vez que haya una nueva reserva
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailReservations}
                onChange={(e) => setSettings({ ...settings, emailReservations: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Confirmaciones por WhatsApp</p>
                <p className="text-sm text-gray-500">
                  Enviar confirmaciones automáticas a los clientes
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappConfirmations}
                onChange={(e) => setSettings({ ...settings, whatsappConfirmations: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Recordatorios 24h antes</p>
                <p className="text-sm text-gray-500">
                  Enviar recordatorio automático al cliente un día antes
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.remindersBefore24h}
                onChange={(e) => setSettings({ ...settings, remindersBefore24h: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Resumen diario</p>
                <p className="text-sm text-gray-500">
                  Recibe un resumen cada mañana de las reservas del día
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.dailySummary}
                onChange={(e) => setSettings({ ...settings, dailySummary: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Alertas de clientes VIP</p>
                <p className="text-sm text-gray-500">
                  Notificación especial cuando un cliente VIP hace reserva
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.vipAlerts}
                onChange={(e) => setSettings({ ...settings, vipAlerts: e.target.checked })}
                className="h-5 w-5"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar preferencias
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings({ user }) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = (e) => {
    e.preventDefault();
    alert('Cambio de contraseña (simulado)');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña regularmente para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Contraseña actual
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirmar nueva contraseña
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Shield className="mr-2 h-4 w-4" />
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Esta sesión</p>
                <p className="text-sm text-gray-500">
                  Madrid, España • Ahora
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Activa
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};