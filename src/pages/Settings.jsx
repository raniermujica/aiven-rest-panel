import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2,
  Clock,
  Users,
  MessageSquare,
  Bell,
  Shield,
  Palette,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  UtensilsCrossed,
  Smartphone,
  Mail
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [aiPaused, setAiPaused] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'hours', label: 'Horarios', icon: Clock },
    { id: 'capacity', label: 'Capacidad', icon: Users },
    { id: 'ai', label: 'Agente IA', icon: MessageSquare },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'users', label: 'Usuarios', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona la configuración del restaurante y del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#4d195c] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'hours' && <HoursSettings />}
      {activeTab === 'capacity' && <CapacitySettings />}
      {activeTab === 'ai' && <AISettings aiPaused={aiPaused} setAiPaused={setAiPaused} />}
      {activeTab === 'notifications' && (
        <NotificationsSettings
          emailNotifications={emailNotifications}
          setEmailNotifications={setEmailNotifications}
          whatsappNotifications={whatsappNotifications}
          setWhatsappNotifications={setWhatsappNotifications}
        />
      )}
      {activeTab === 'users' && <UsersSettings />}
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del restaurante</CardTitle>
          <CardDescription>Datos básicos y de contacto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre del restaurante
              </label>
              <Input defaultValue="Restaurante Demo" className="mt-1" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <Input defaultValue="+34 900 123 456" className="mt-1" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Dirección
              </label>
              <Input defaultValue="Calle Principal 123, Madrid" className="mt-1" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input defaultValue="contacto@restaurant.com" type="email" className="mt-1" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Sitio web
              </label>
              <Input defaultValue="www.restaurant.com" className="mt-1" />
            </div>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function HoursSettings() {
  const days = [
    { id: 'monday', label: 'Lunes', open: '12:00', close: '23:00', enabled: true },
    { id: 'tuesday', label: 'Martes', open: '12:00', close: '23:00', enabled: true },
    { id: 'wednesday', label: 'Miércoles', open: '12:00', close: '23:00', enabled: true },
    { id: 'thursday', label: 'Jueves', open: '12:00', close: '23:00', enabled: true },
    { id: 'friday', label: 'Viernes', open: '12:00', close: '01:00', enabled: true },
    { id: 'saturday', label: 'Sábado', open: '12:00', close: '01:00', enabled: true },
    { id: 'sunday', label: 'Domingo', open: '12:00', close: '23:00', enabled: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horario de operación</CardTitle>
          <CardDescription>Define los horarios de apertura del restaurante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div key={day.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={day.enabled}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="w-24 font-medium">{day.label}</span>
              </div>
              
              <div className="flex flex-1 items-center gap-2">
                <Input type="time" defaultValue={day.open} className="flex-1" disabled={!day.enabled} />
                <span className="text-gray-500">a</span>
                <Input type="time" defaultValue={day.close} className="flex-1" disabled={!day.enabled} />
              </div>
            </div>
          ))}

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar horarios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turnos de servicio</CardTitle>
          <CardDescription>Configura almuerzo y cena</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Almuerzo - Inicio</label>
              <Input type="time" defaultValue="12:00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Almuerzo - Fin</label>
              <Input type="time" defaultValue="16:00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cena - Inicio</label>
              <Input type="time" defaultValue="20:00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cena - Fin</label>
              <Input type="time" defaultValue="23:00" />
            </div>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar turnos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CapacitySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capacidad del restaurante</CardTitle>
          <CardDescription>Define límites de comensales y reservas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Capacidad máxima total
              </label>
              <Input type="number" defaultValue="50" min="1" className="mt-1" />
              <p className="mt-1 text-xs text-gray-500">Número máximo de comensales simultáneos</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tiempo promedio por mesa
              </label>
              <Input type="number" defaultValue="90" min="30" className="mt-1" />
              <p className="mt-1 text-xs text-gray-500">En minutos</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tamaño mínimo de grupo
              </label>
              <Input type="number" defaultValue="1" min="1" className="mt-1" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tamaño máximo de grupo
              </label>
              <Input type="number" defaultValue="12" min="1" className="mt-1" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Intervalo entre reservas
              </label>
              <Input type="number" defaultValue="15" min="15" step="15" className="mt-1" />
              <p className="mt-1 text-xs text-gray-500">En minutos (15, 30, 45, 60)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label className="text-sm text-blue-900">
              Permitir reservas para el mismo día
            </label>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AISettings({ aiPaused, setAiPaused }) {
  return (
    <div className="space-y-6">
      <Card className={aiPaused ? 'border-red-200' : 'border-green-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {aiPaused ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            Estado del agente IA
          </CardTitle>
          <CardDescription>
            {aiPaused 
              ? 'El agente está pausado. Las conversaciones no se responderán automáticamente.'
              : 'El agente está activo y respondiendo conversaciones automáticamente.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex-1">
              <p className="font-medium">
                {aiPaused ? 'Agente pausado' : 'Agente activo'}
              </p>
              <p className="text-sm text-gray-500">
                {aiPaused 
                  ? 'Activa para que responda automáticamente'
                  : 'Pausa para responder manualmente'}
              </p>
            </div>
            
            <button
              onClick={() => setAiPaused(!aiPaused)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiPaused ? 'bg-gray-300' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiPaused ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del agente</CardTitle>
          <CardDescription>Personaliza el comportamiento del agente IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tono de conversación
            </label>
            <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
              <option>Profesional y amable</option>
              <option>Casual y cercano</option>
              <option>Formal</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Tiempo máximo de respuesta
            </label>
            <Input type="number" defaultValue="30" min="10" className="mt-1" />
            <p className="mt-1 text-xs text-gray-500">En segundos</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Funciones habilitadas
            </label>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label className="text-sm">Crear reservas automáticamente</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label className="text-sm">Responder preguntas sobre el menú</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label className="text-sm">Enviar confirmaciones automáticas</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label className="text-sm">Gestionar lista de espera</label>
            </div>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsSettings({ emailNotifications, setEmailNotifications, whatsappNotifications, setWhatsappNotifications }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Notificaciones por email</h3>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Activar notificaciones por email</p>
                  <p className="text-sm text-gray-500">Recibe alertas en tu correo</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {emailNotifications && (
              <div className="ml-8 space-y-2 border-l-2 border-blue-200 pl-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                  <label className="text-sm">Nueva reserva</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                  <label className="text-sm">Cancelación de reserva</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                  <label className="text-sm">Resumen diario</label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Notificaciones por WhatsApp</h3>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Activar notificaciones por WhatsApp</p>
                  <p className="text-sm text-gray-500">Recibe alertas instantáneas</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappNotifications(!whatsappNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    whatsappNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Guardar preferencias
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSettings() {
  const users = [
    { id: 1, name: 'Ranier Mujica', email: 'ranier@restaurant.com', role: 'ADMIN' },
    { id: 2, name: 'Ana García', email: 'ana@restaurant.com', role: 'MANAGER' },
    { id: 3, name: 'Carlos López', email: 'carlos@restaurant.com', role: 'STAFF' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del sistema</CardTitle>
              <CardDescription>Gestiona quién tiene acceso al panel</CardDescription>
            </div>
            <Button size="sm">
              <Users className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                    <span className="text-sm font-bold text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                  
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por rol</CardTitle>
          <CardDescription>Define qué puede hacer cada rol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">ADMIN</h4>
              <p className="mt-1 text-sm text-gray-500">
                Acceso completo al sistema, puede gestionar usuarios y configuración
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">MANAGER</h4>
              <p className="mt-1 text-sm text-gray-500">
                Puede gestionar reservas, clientes, ver estadísticas y pausar IA
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">STAFF</h4>
              <p className="mt-1 text-sm text-gray-500">
                Solo puede ver reservas del día y marcar llegadas de clientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};