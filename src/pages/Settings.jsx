import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import {
  Building2,
  Users,
  Clock,
  Shield,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Scissors,
  X,
  AlertCircle,
  Bot,
  CheckCircle2,
  Loader2,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

// export function Settings() {
//   const { user } = useAuthStore();
//   const [activeTab, setActiveTab] = useState('general');

//   const tabs = [
//     { id: 'general', label: 'General', icon: Building2 },
//     { id: 'services', label: 'Servicios', icon: Scissors },
//     { id: 'agent', label: 'Agente IA', icon: Bot },
//     { id: 'users', label: 'Usuarios', icon: Users },
//     { id: 'hours', label: 'Horarios', icon: Clock },
//     { id: 'security', label: 'Seguridad', icon: Shield },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-white">Configuración</h1>
//         <p className="mt-1 text-sm text-gray-400">
//           Gestiona la configuración de {user?.business?.name || 'tu negocio'}
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-700">
//         <nav className="-mb-px flex space-x-8 overflow-x-auto">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
//                   ? 'border-blue-500 text-blue-400'
//                   : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
//                   }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'general' && <GeneralSettings user={user} />}
//       {activeTab === 'services' && <ServicesSettings user={user} />}
//       {activeTab === 'agent' && <AgentSettings user={user} />}
//       {activeTab === 'users' && <UsersSettings user={user} />}
//       {activeTab === 'hours' && <HoursSettings user={user} />}
//       {activeTab === 'security' && <SecuritySettings user={user} />}
//     </div>
//   );
// }

// function GeneralSettings({ user }) {
//   const { updateBusinessName } = useAuthStore();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     website: '',
//     maxCapacity: '',
//     assistantName: '',
//     businessHours: '',
//     config: {},
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const defaultConfig = {
//     terminology: {
//       booking: "Cita",
//       service: "Servicio",
//       bookings: "Citas",
//       customer: "Cliente",
//       services: "Servicios",
//       customers: "Clientes"
//     },
//     max_party_size: 12,
//     min_party_size: 1,
//     assistant_config: {
//       name: "Asistente",
//       tone: "amigable y profesional",
//       personality_traits: ["servicial", "eficiente"]
//     },
//     auto_unblock_hours: 4,
//     require_confirmation: true,
//     booking_buffer_minutes: 15,
//     business_hours_detailed: {
//       friday: { open: "09:00", close: "20:00", closed: false },
//       monday: { open: "09:00", close: "20:00", closed: false },
//       sunday: { open: null, close: null, closed: true },
//       tuesday: { open: "09:00", close: "20:00", closed: false },
//       saturday: { open: "10:00", close: "18:00", closed: false },
//       thursday: { open: "09:00", close: "20:00", closed: false },
//       wednesday: { open: "09:00", close: "20:00", closed: false }
//     },
//     max_appointments_per_slot: 1, // Default 1
//     allow_same_day_reservations: true,
//     email_required_for_reservations: false
//   };

//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const loadSettings = async () => {
//     try {
//       setLoading(true);
//       const data = await api.getSettings();

//       const loadedConfig = data.settings.config || {};

//       const mergedConfig = {
//         ...defaultConfig, 
//         ...loadedConfig,  

//         terminology: {
//           ...defaultConfig.terminology,
//           ...(loadedConfig.terminology || {}),
//         },
//         assistant_config: {
//           ...defaultConfig.assistant_config,
//           ...(loadedConfig.assistant_config || {}),
//         },
//         business_hours_detailed: {
//           ...defaultConfig.business_hours_detailed,
//           ...(loadedConfig.business_hours_detailed || {}),
//         },
//       };

//       setFormData({
//         name: data.settings.name || '',
//         email: data.settings.email || '',
//         phone: data.settings.phone || '',
//         address: data.settings.address || '',
//         city: data.settings.city || '',
//         website: data.settings.website || '',
//         maxCapacity: data.settings.maxCapacity || '',
//         assistantName: data.settings.assistantName || '',
//         businessHours: data.settings.businessHours || '',
//         config: mergedConfig,
//       });
//     } catch (error) {
//       console.error('Error cargando configuración:', error);
//       setError('Error al cargar la configuración');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setSaving(true);

//     try {
//       console.log('1. Guardando settings...');
//       await api.updateSettings(formData);

//       console.log('2. Recargando usuario...');
//       // await refreshUser();
//       await updateBusinessName();

//       console.log('3. Usuario actualizado en store');
//       console.log('3. Usuario actualizado:', user);

//       setSuccess('Configuración actualizada correctamente');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (error) {
//       console.error('Error actualizando configuración:', error);
//       setError(error.message || 'Error al actualizar configuración');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   // ... (código de saving)
//   //   try {
//   //     console.log('1. Guardando settings en BD...'); // (Mensaje actualizado)
//   //     await api.updateSettings(formData);

//   //     // --- 💡 INICIO DE LA CORRECCIÓN ---
//   //     console.log('2. Actualizando nombre en el store local...'); // (Mensaje actualizado)
//   //     updateBusinessName(formData.name); // <-- CAMBIO: Se usa la función correcta del store

//   //     console.log('3. Store actualizado con:', formData.name); // (Mensaje actualizado)
//   //     // --- FIN DE LA CORRECCIÓN ---

//   //     setSuccess('Configuración actualizada correctamente');
//   //        setTimeout(() => setSuccess(''), 3000);
//   //   } catch (error) {
//   //     console.error('Error actualizando configuración:', error);
//   //     setError(error.message || 'Error al actualizar configuración');
//   //   } finally {
//   //     setSaving(false);
//   //   }
//   // };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-white">Cargando configuración...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Información del negocio</CardTitle>
//           <CardDescription className="text-gray-400">
//             Datos básicos de tu negocio
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
//                 <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {success && (
//               <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
//                 {success}
//               </div>
//             )}

//             <div>
//               <label className="text-sm font-medium text-gray-300">
//                 Nombre del negocio *
//               </label>
//               <Input
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="Ej: Bella Estética"
//                 required
//               />
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Email de contacto
//                 </label>
//                 <Input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   placeholder="contacto@negocio.com"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Teléfono
//                 </label>
//                 <Input
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   placeholder="+34 600 123 456"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Dirección
//                 </label>
//                 <Input
//                   value={formData.address}
//                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   placeholder="Calle Principal 123"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Ciudad
//                 </label>
//                 <Input
//                   value={formData.city}
//                   onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                   placeholder="Madrid"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium text-gray-300">
//                 Sitio web
//               </label>
//               <Input
//                 type="url"
//                 value={formData.website}
//                 onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//                 placeholder="https://www.minegocio.com"
//               />
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Capacidad máxima
//                 </label>
//                 <Input
//                   type="number"
//                   value={formData.maxCapacity}
//                   onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
//                   placeholder="50"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-gray-300">
//                   Nombre del asistente IA
//                 </label>
//                 <Input
//                   value={formData.assistantName}
//                   onChange={(e) => setFormData({ ...formData, assistantName: e.target.value })}
//                   placeholder="Sofía"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-300">
//                 Citas simultáneas (Nº de empleados)
//               </label>
//               <Input
//                 type="number"
//                 min="1"
//                 value={formData.config?.max_appointments_per_slot || 1}
//                 onChange={(e) => setFormData({ 
//                   ...formData, 
//                   config: {
//                     ...formData.config,
//                     max_appointments_per_slot: parseInt(e.target.value, 10) || 1
//                   }
//                 })}
//                 placeholder="1"
//               />
//               <p className="text-xs text-gray-400 mt-1">
//                 Define cuántas citas se pueden agendar en la misma franja horaria.
//               </p>
//             </div>

//             <div>
//               <label className="text-sm font-medium text-gray-300">
//                 Horario de atención
//               </label>
//               <Input
//                 value={formData.businessHours}
//                 onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
//                 placeholder="Lunes a Domingo 09:00-22:00"
//               />
//             </div>

//             <div className="flex justify-end">
//               <Button type="submit" disabled={saving}>
//                 <Save className="mr-2 h-4 w-4" />
//                 {saving ? 'Guardando...' : 'Guardar cambios'}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Información de la plataforma</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="flex justify-between py-2 border-b border-gray-700">
//             <span className="text-sm text-gray-400">Tipo de negocio</span>
//             <span className="text-sm font-medium text-white">
//               {user?.business?.config?.name || 'N/A'}
//             </span>
//           </div>
//           <div className="flex justify-between py-2 border-b border-gray-700">
//             <span className="text-sm text-gray-400">URL de acceso</span>
//             <span className="text-sm font-medium text-blue-400">
//               {window.location.origin}/{user?.business?.slug || 'slug'}
//             </span>
//           </div>
//           <div className="flex justify-between py-2 border-b border-gray-700">
//             <span className="text-sm text-gray-400">Plan actual</span>
//             <span className="text-sm font-medium text-white">Básico</span>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

function RestaurantShiftSettings({ config, onChange }) {
  const shifts = config.shifts || {
    breakfast: { label: 'Desayuno', enabled: false, start: '08:00', end: '11:00', duration: 60 },
    lunch: { label: 'Almuerzo', enabled: true, start: '13:00', end: '16:00', duration: 90 },
    dinner: { label: 'Cena', enabled: true, start: '20:00', end: '23:00', duration: 90 },
    all_day: { label: 'Horario Continuo', enabled: false, start: '12:00', end: '23:00', duration: 90 }
  };

  const handleShiftChange = (key, field, value) => {
    const newShifts = {
      ...shifts,
      [key]: {
        ...shifts[key],
        [field]: value
      }
    };
    onChange({ ...config, shifts: newShifts });
  };

  return (
    <div className="space-y-6 border-t border-gray-700 pt-6 mt-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Configuración de Turnos y Horarios
        </h3>
        <p className="text-sm text-gray-400">
          Activa los turnos y define la duración de las reservas para cada uno.
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(shifts).map(([key, shift]) => (
          <div 
            key={key} 
            // Usamos la misma estética que HoursSettings: bg-[#1a2f38] para items, border-gray-700
            className={`p-4 rounded-lg border transition-colors ${
              shift.enabled 
                ? 'bg-[#1a2f38] border-gray-700' 
                : 'bg-transparent border-gray-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={shift.enabled}
                  onChange={(e) => handleShiftChange(key, 'enabled', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-600 bg-transparent text-blue-600 cursor-pointer"
                />
                <span className="font-medium text-white text-base uppercase">{shift.label}</span>
              </div>
            </div>

            {shift.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2 md:pl-8">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Inicio</label>
                  <Input
                    type="time"
                    value={shift.start}
                    onChange={(e) => handleShiftChange(key, 'start', e.target.value)}
                    // Sin bg color forzado, solo estilos base
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fin (Cierre Cocina)</label>
                  <Input
                    type="time"
                    value={shift.end}
                    onChange={(e) => handleShiftChange(key, 'end', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Duración (min)</label>
                  <Input
                    type="number"
                    value={shift.duration}
                    onChange={(e) => handleShiftChange(key, 'duration', parseInt(e.target.value))}
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneralSettings({ user }) {
  const [loading, setLoading] = useState(true);
  const [isRestaurant, setIsRestaurant] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    timezone: 'Europe/Madrid',
    assistantName: '',
    config: {} 
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const response = await api.getSettings();
      const data = response.settings || response.data?.settings || response; 
      
      // Detectar tipo de negocio
      const type = data.businessType || user?.business?.businessType || '';
      setIsRestaurant(type === 'restaurant');

      // Parsear config
      let parsedConfig = {};
      if (typeof data.config === 'string') {
        try { parsedConfig = JSON.parse(data.config); } catch(e) {}
      } else {
        parsedConfig = data.config || {};
      }

      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        website: data.website || '',
        description: data.description || '',
        timezone: data.timezone || 'Europe/Madrid',
        assistantName: data.assistantName || '',
        config: parsedConfig
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        config: formData.config
      };
      await api.updateSettings(payload);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>
            {isRestaurant 
              ? "Configura los detalles y turnos de tu restaurante" 
              : "Datos básicos de tu negocio"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Campos Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Nombre del negocio</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Bella Estética"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email de contacto</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@negocio.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Teléfono</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+34 600 123 456"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Dirección</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle Principal 123"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Sitio web</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.minegocio.com"
              />
            </div>

            {/* ZONA HORARIA CORREGIDA */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Zona Horaria</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-700 bg-[#1a2f38] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <optgroup label="Europa">
                  <option value="Europe/Madrid">Madrid (España)</option>
                  <option value="Europe/Lisbon">Lisboa (Portugal)</option>
                  <option value="Europe/Paris">París (Francia)</option>
                  <option value="Europe/Rome">Roma (Italia)</option>
                  <option value="UTC">UTC (Universal)</option>
                </optgroup>
                
                <optgroup label="América Latina">
                  <option value="America/Mexico_City">Ciudad de México (México)</option>
                  <option value="America/Bogota">Bogotá (Colombia)</option>
                  <option value="America/Lima">Lima (Perú)</option>
                  <option value="America/Caracas">Caracas (Venezuela)</option>
                  <option value="America/Santiago">Santiago (Chile)</option>
                  <option value="America/Argentina/Buenos_Aires">Buenos Aires (Argentina)</option>
                </optgroup>

                <optgroup label="Estados Unidos">
                  <option value="America/New_York">New York (EST)</option>
                  <option value="America/Los_Angeles">Los Angeles (PST)</option>
                </optgroup>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Nombre Asistente IA</label>
              <Input
                value={formData.assistantName}
                onChange={(e) => setFormData({ ...formData, assistantName: e.target.value })}
                placeholder="Ej: Sofía"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Descripción</label>
             <textarea 
               className="flex min-h-[80px] w-full rounded-md border border-gray-700 bg-[#1a2f38] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               rows={3}
               placeholder="Describe tu negocio..."
             />
          </div>

          {/* SECCIONES ESPECÍFICAS POR TIPO DE NEGOCIO */}
          
          {isRestaurant ? (
            <RestaurantShiftSettings
              config={formData.config}
              onChange={(newConfig) => setFormData({ ...formData, config: newConfig })}
            />
          ) : (
            <div className="space-y-4 border-t border-gray-700 pt-6 mt-6">
               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Scissors className="w-5 h-5 text-pink-400" />
                 Configuración de Citas
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Citas simultáneas (Personal disponible)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.config?.max_appointments_per_slot || 1}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      config: {
                        ...formData.config,
                        max_appointments_per_slot: parseInt(e.target.value) || 1
                      }
                    })}
                  />
                  <p className="text-xs text-gray-400">
                    Número máximo de clientes que pueden ser atendidos al mismo tiempo.
                  </p>
                 </div>
               </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'services', label: 'Servicios' },
    { id: 'agent', label: 'Agente IA' },
    { id: 'users', label: 'Usuarios' },
    { id: 'hours', label: 'Horarios' },
    { id: 'security', label: 'Seguridad' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="mt-1 text-sm text-gray-400">
          Gestiona la configuración de {user?.business?.name || 'tu negocio'}
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-700/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-400 bg-[#1a2f38]/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a2f38]/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'general' && <GeneralSettings user={user} />}
        {activeTab === 'services' && <ServicesSettings user={user} />} 
        {activeTab === 'agent' && <AgentSettings user={user} />}
        {activeTab === 'users' && <UsersSettings user={user} />}
        {activeTab === 'hours' && <HoursSettings user={user} />}
        {activeTab === 'security' && <SecuritySettings user={user} />}
      </div>
    </div>
  );
}

function ServicesSettings({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      await api.deleteService(serviceId);
      await loadServices();
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await api.updateService(service.id, { isActive: !service.is_active });
      await loadServices();
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      alert('Error al actualizar el servicio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Servicios del negocio</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona los servicios que ofreces a tus clientes
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-white">No hay servicios registrados</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                Crear primer servicio
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4 transition-colors',
                    service.is_active
                      ? 'border-gray-700 bg-[#1a2f38]'
                      : 'border-gray-700 bg-gray-800/50 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {service.emoji && (
                      <div className="text-3xl">{service.emoji}</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{service.name}</h4>
                        {!service.is_active && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {service.price && (
                          <span className="text-green-400 font-medium">
                            €{service.price}
                          </span>
                        )}
                        {service.duration_minutes && (
                          <span className="text-gray-400">
                            {service.duration_minutes} min
                          </span>
                        )}
                        {service.category && (
                          <span className="text-gray-400">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingService) && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowCreateModal(false);
            setEditingService(null);
          }}
          onSuccess={() => {
            loadServices();
            setShowCreateModal(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    durationMinutes: service?.duration_minutes || 60,
    category: service?.category || '',
    emoji: service?.emoji || '',
    displayOrder: service?.display_order || 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.description) {
      setError('Nombre y descripción son requeridos');
      setLoading(false);
      return;
    }

    try {
      if (service) {
        await api.updateService(service.id, formData);
      } else {
        await api.createService(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error guardando servicio:', error);
      setError(error.message || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {service ? 'Editar servicio' : 'Nuevo servicio'}
          </h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre del servicio *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Corte de cabello"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descripción *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el servicio..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Precio (€)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="35.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Duración (min)
              </label>
              <Input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Categoría
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ej: Cabello, Uñas, Facial"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Emoji (opcional)
            </label>
            <Input
              value={formData.emoji}
              onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              placeholder="💇‍♀️"
              maxLength={2}
            />
            <p className="text-xs text-gray-400 mt-1">
              Agrega un emoji para hacer más visual el servicio
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersSettings({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getBusinessUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await api.deleteBusinessUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert(error.message || 'Error al eliminar el usuario');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.updateBusinessUser(userId, { isActive: !currentStatus });
      await loadUsers();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del sistema</CardTitle>
              <CardDescription className="text-gray-400">
                Gestiona quién tiene acceso al panel
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-4',
                  u.is_active
                    ? 'border-gray-700 bg-[#1a2f38]'
                    : 'border-gray-700 bg-gray-800/50 opacity-60'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                    <span className="font-semibold text-white">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{u.name}</p>
                      {!u.is_active && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {u.role}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                  >
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                  {u.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
            <div className="rounded-lg border border-gray-700 bg-[#1a2f38] p-4">
              <h4 className="font-semibold text-white">ADMIN</h4>
              <p className="mt-1 text-sm text-gray-400">
                Acceso completo a todas las funciones del sistema
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#1a2f38] p-4">
              <h4 className="font-semibold text-white">MANAGER</h4>
              <p className="mt-1 text-sm text-gray-400">
                Gestión de reservas, clientes y reportes
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-[#1a2f38] p-4">
              <h4 className="font-semibold text-white">STAFF</h4>
              <p className="mt-1 text-sm text-gray-400">
                Ver y gestionar reservas del día
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadUsers();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function HoursSettings({ user }) {
  const [hours, setHours] = useState({
    1: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Lunes
    2: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Martes
    3: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Miércoles
    4: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Jueves
    5: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Viernes
    6: { openTime: '10:00', closeTime: '20:00', isActive: true }, // Sábado
    0: { openTime: '10:00', closeTime: '20:00', isActive: false }, // Domingo
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 0 },
  ];

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      setLoading(true);
      const data = await api.getBusinessHours();
      if (data.hours && Object.keys(data.hours).length > 0) {
        setHours(data.hours);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const hoursArray = Object.entries(hours).map(([dayOfWeek, data]) => ({
        dayOfWeek: parseInt(dayOfWeek),
        openTime: data.openTime,
        closeTime: data.closeTime,
        isActive: data.isActive,
      }));

      await api.updateBusinessHours(hoursArray);
      setSuccess('Horarios actualizados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error guardando horarios:', error);
      setError('Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (dayValue, field, value) => {
    setHours(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horario de atención</CardTitle>
          <CardDescription className="text-gray-400">
            Define los horarios en los que tu negocio está abierto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}

          <div className="space-y-3">
            {days.map((day) => (
              <div key={day.value} className="flex flex-col md:grid md:grid-cols-[120px_1fr_20px_1fr_auto_auto] items-start md:items-center gap-3 rounded-lg border border-gray-700 bg-[#1a2f38] p-3">
                <span className="font-medium text-white">{day.label}</span>

                <div className="flex items-center gap-3 w-full md:contents">
                  <Input
                    type="time"
                    className="flex-1 md:w-32"
                    value={hours[day.value]?.openTime || '10:00'}
                    onChange={(e) => updateHour(day.value, 'openTime', e.target.value)}
                    disabled={!hours[day.value]?.isActive}
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="time"
                    className="flex-1 md:w-32"
                    value={hours[day.value]?.closeTime || '20:00'}
                    onChange={(e) => updateHour(day.value, 'closeTime', e.target.value)}
                    disabled={!hours[day.value]?.isActive}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours[day.value]?.isActive || false}
                    onChange={(e) => updateHour(day.value, 'isActive', e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm text-gray-400">Activo</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar horarios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STAFF',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Nombre, email y contraseña son requeridos');
      setLoading(false);
      return;
    }

    try {
      await api.createBusinessUser(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creando usuario:', error);
      setError(error.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a2f38] rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nuevo usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre completo *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña *
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+34 600 123 456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rol *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-600 bg-[#102027] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="STAFF">STAFF - Ver y gestionar citas</option>
              <option value="MANAGER">MANAGER - Gestión completa</option>
              <option value="ADMIN">ADMIN - Acceso total</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </div>
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
    alert('Cambio de contraseña (por implementar)');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription className="text-gray-400">
            Actualiza tu contraseña regularmente para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">
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
              <label className="text-sm font-medium text-gray-300">
                Nueva contraseña
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">
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
            <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-[#1a2f38] p-4">
              <div>
                <p className="font-medium text-white">Esta sesión</p>
                <p className="text-sm text-gray-400">
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
}

function AgentSettings({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const checkStatus = async () => {
    try {
      setError('');
      const data = await api.getWhatsAppStatus();
      setStatus(data);
      if (data.isConnected) {
        setQrCode(null);
      }
      return data;
    } catch (err) {
      console.error('Error cargando estado:', err);
      setError(err.message || 'Error al cargar el estado de WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Polling para actualizar el estado cuando se escanea el QR
  useEffect(() => {
    let intervalId = null;

    // Polling solo si estamos esperando una conexión (QR visible o estado 'connecting')
    const needsPolling = (qrCode || status?.state === 'connecting') && !status?.isConnected;

    if (needsPolling) {
      intervalId = setInterval(async () => {
        console.log('Polling WhatsApp status...');
        try {
          const data = await api.getWhatsAppStatus();
          setStatus(data); // El estado 'status' ahora contendrá { isConnected, instanceName, phoneNumber }

          if (data.isConnected) {
            setQrCode(null); // Limpiar QR
            setError('');
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 5000); // Poll cada 5 segundos
    }

    // Limpiar intervalo
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [qrCode, status]);

  // Handler para Iniciar Conexión / Pedir QR
  const handleInitialize = async () => {
    setIsInitializing(true);
    setError('');
    setQrCode(null);
    try {
      const data = await api.initializeWhatsApp();

      if (data.isConnected) {
        setStatus({ isConnected: true, state: 'open' });
        checkStatus(); // Llamar a checkStatus para obtener los detalles (nombre y número)
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
      } else if (data.isConnecting) {
        setStatus({ isConnected: false, state: 'connecting' });
      }

    } catch (err) {
      console.error('Error inicializando:', err);
      setError(err.message || 'Error al inicializar WhatsApp');
    } finally {
      setIsInitializing(false);
    }
  };

  // Handler para Refrescar QR (si el anterior expiró)
  const handleRefreshQR = async () => {
    setIsInitializing(true);
    setError('');
    try {
      const data = await api.refreshWhatsAppQR();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (err) {
      console.error('Error refrescando QR:', err);
      setError(err.message || 'Error al refrescar el QR');
    } finally {
      setIsInitializing(false);
    }
  };

  // Handler para Desconectar
  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que quieres desconectar el Agente IA? Dejará de responder por WhatsApp.')) {
      return;
    }

    setIsDisconnecting(true);
    setError('');
    try {
      await api.disconnectWhatsApp();
      await checkStatus(); // Refrescar el estado (debería ser 'close')
      setQrCode(null);
    } catch (err) {
      console.error('Error desconectando:', err);
      setError(err.message || 'Error al desconectar WhatsApp');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Renderizado del loader principal
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-white">Cargando estado del Agente IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conexión del Agente IA (WhatsApp)</CardTitle>
          <CardDescription className="text-gray-400">
            Conecta tu número de WhatsApp Business para que el agente IA pueda gestionar tus citas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* --- ESTADO: CONECTADO --- */}
          {status?.isConnected ? (
            <div className="p-6 rounded-lg border border-green-700 bg-green-900/50 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Agente Conectado</h3>
              <p className="text-green-300 mt-2">
                Tu Agente IA está activo y respondiendo en WhatsApp.
              </p>

              {/* --- 💡 INICIO DE ACTUALIZACIÓN --- */}
              {/* Esta es la parte que añadí */}
              <div className="text-left max-w-sm mx-auto mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Instancia:</span>
                  <span className="font-medium text-white">{status.instanceName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Número:</span>
                  <span className="font-medium text-white">{status.phoneNumber || 'Verificando...'}</span>
                </div>
              </div>
              {/* --- 💡 FIN DE ACTUALIZACIÓN --- */}

              <Button
                variant="destructive"
                className="mt-8" // <-- Margen actualizado
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </Button>
            </div>
          ) : (

            /* --- ESTADO: DESCONECTADO (Mostrando QR o Botón) --- */
            <div className="p-6 rounded-lg border border-gray-700 bg-[#1a2f38] text-center">

              {/* --- Sub-estado: Mostrando QR --- */}
              {qrCode ? (
                <>
                  <h3 className="text-xl font-semibold text-white">Escanea para Conectar</h3>
                  <p className="text-gray-400 mt-2 mb-4">
                    Abre WhatsApp en tu teléfono y escanea el código.
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block max-w-xs w-full">
                    <img src={qrCode} alt="Código QR de WhatsApp" className="w-full h-full" />
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Este código expira. Si no funciona, refréscalo.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleRefreshQR}
                    disabled={isInitializing}
                  >
                    {isInitializing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isInitializing ? 'Refrescando...' : 'Refrescar QR'}
                  </Button>
                </>
              ) :

                /* --- Sub-estado: Cargando QR o Conectando --- */
                (isInitializing || status?.state === 'connecting') ? (
                  <>
                    <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                    <h3 className="text-xl font-semibold text-white mt-4">
                      {status?.state === 'connecting' ? 'Conectando...' : 'Generando Código QR...'}
                    </h3>
                    <p className="text-gray-400 mt-2">
                      {status?.state === 'connecting'
                        ? 'Conexión en progreso. Esto puede tardar un momento.'
                        : 'Solicitando un nuevo código QR a WhatsApp.'}
                    </p>
                  </>
                ) :

                  /* --- Sub-estado: Inicial (Desconectado) --- */
                  (
                    <>
                      <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white">Agente Desconectado</h3>
                      <p className="text-gray-400 mt-2">
                        Presiona el botón para generar el código QR y vincular tu teléfono.
                      </p>
                      <Button
                        className="mt-6"
                        onClick={handleInitialize}
                        disabled={isInitializing}
                      >
                        {isInitializing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Bot className="mr-2 h-4 w-4" />
                        )}
                        {isInitializing ? 'Iniciando...' : 'Conectar Agente IA'}
                      </Button>
                    </>
                  )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};