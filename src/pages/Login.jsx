import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

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

    // Simulación de login (después conectaremos con el backend)
    setTimeout(() => {
      // Login exitoso simulado
      login({
        id: '1',
        name: 'Ranier Mujica',
        email: email,
        role: 'ADMIN',
        restaurantId: '123',
        restaurantName: 'Restaurante Demo',
      });
      
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d9d9d9] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#bfdce2]">
            <img src="./paul-logo.png" alt="Agent Paul Logo" className="h-12 w-12" />
          </div>
          
          <CardTitle className="text-2xl font-bold">Agent Paul</CardTitle>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>
              
              <button
                type="button"
                className="text-[#102027] hover:text-blue-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
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

            {/* Demo Credentials */}
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              <p className="font-semibold mb-1">Demo (cualquier email/password):</p>
              <p>Email: demo@restaurant.com</p>
              <p>Password: demo123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};