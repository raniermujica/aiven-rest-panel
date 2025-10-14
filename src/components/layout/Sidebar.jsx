import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Settings,
  UtensilsCrossed,
  Clock,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';

const navigation = [
  { name: 'Panel de Control', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reservas de hoy', href: '/reservations/today', icon: Calendar },
  { name: 'Todas las reservas', href: '/reservations', icon: UtensilsCrossed },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Lista de espera', href: '/waitlist', icon: Clock },
  { name: 'Estadísticas', href: '/analytics', icon: BarChart3 },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Overlay en móvil cuando sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#102027] text-white transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo / Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#102027] px-4">
          <div className="flex items-center">
            <img src="./paul-logo.png" alt="Agent Paul Logo" className="h-11 w-11" />
            <span className="ml-2 text-xl font-bold">Agent Paul</span>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            onClick={closeSidebar}
            className="lg:hidden rounded p-1 hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#4d195c] text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4d195c]">
              <span className="text-sm font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-400">{user?.role || 'Staff'}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="rounded p-2 hover:bg-gray-800"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      </>
    );
};