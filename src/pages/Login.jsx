import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  // Validaciones básicas
  if (!email || !password) {
    setError('Por favor completa todos los campos');
    setIsLoading(false);
    return;
  }

  if (!email.includes('@')) {
    setError('El email no es válido');
    setIsLoading(false);
    return;
  }

  try {
    // Obtener slug de la URL si existe
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const slug = pathSegments[0] !== 'login' ? pathSegments[0] : undefined;

    // Llamar a la API real
    const response = await api.login(email, password, slug);
    
    // Guardar en el store
    login(response.user, response.token);
    
    // Redirigir según el tipo de usuario
    if (response.user.isSuperAdmin) {
      console.log('✅ SuperAdmin detectado, redirigiendo a /admin');
      navigate('/admin');
    } else {
      console.log('✅ Usuario normal, redirigiendo a /dashboard');
      navigate('/dashboard');
    }
    
  } catch (err) {
    console.error('❌ Error en login:', err);
    setError(err.message || 'Error al iniciar sesión');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl font-bold">RestauPanel</CardTitle>
          <CardDescription>
            Inicia sesión para acceder al panel de gestión
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};