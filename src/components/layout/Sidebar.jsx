import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Clock,
  BarChart3,
  Settings,
  X,
  Scissors,
  UtensilsCrossed,
  Sparkles,
  Activity,
  LogOut // ← NUEVO
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const terminology = user?.business?.terminology || {
    booking: 'Cita',
    bookings: 'Citas',
    customer: 'Cliente',
    customers: 'Clientes',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener color según tipo de negocio
  const getBusinessColor = () => {
    const colors = {
      restaurant: 'bg-gray-900',
      beauty_salon: 'bg-pink-900',
      aesthetic_clinic: 'bg-purple-900',
      dental_clinic: 'bg-teal-900',
      barbershop: 'bg-amber-900',
    };
    return colors[user?.business?.type] || 'bg-gray-900';
  };

  // Obtener icono según tipo de negocio
  const getBusinessIcon = () => {
    const icons = {
      restaurant: UtensilsCrossed,
      beauty_salon: Scissors,
      aesthetic_clinic: Sparkles,
      dental_clinic: Activity,
      barbershop: Scissors,
    };
    const Icon = icons[user?.business?.type] || UtensilsCrossed;
    return <Icon className="h-8 w-8" />;
  };

  const navigation = [
    { name: 'Panel de Control', href: '/dashboard', icon: LayoutDashboard },
    { name: `${terminology.bookings} de hoy`, href: '/reservations/today', icon: Calendar },
    { name: `Todas las ${terminology.bookings.toLowerCase()}`, href: '/reservations', icon: UtensilsCrossed },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Lista de espera', href: '/waitlist', icon: Clock },
    { name: 'Estadísticas', href: '/analytics', icon: BarChart3 },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col text-white transition-transform duration-300 lg:translate-x-0',
          getBusinessColor(),
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            {getBusinessIcon()}
            <div>
              <h1 className="text-lg font-bold">{user?.business?.name || 'Panel'}</h1>
              <p className="text-xs text-white/60">Gestión</p>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            className="lg:hidden rounded p-1 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <span className="font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/60 uppercase">{user?.role}</p>
            </div>
          </div>

          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};