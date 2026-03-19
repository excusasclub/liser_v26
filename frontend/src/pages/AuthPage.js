import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', username: '', display_name: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('Sesión iniciada');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    if (registerData.username.length < 3) { toast.error('El nombre de usuario debe tener al menos 3 caracteres'); return; }
    setLoading(true);
    try {
      await register(registerData.email, registerData.password, registerData.username, registerData.display_name);
      toast.success('Cuenta creada');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" data-testid="auth-page">
      <Card className="w-full max-w-md border-border/50 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center neon-glow mx-auto mb-3">
            <span className="text-white font-bold text-lg font-['Outfit']">L</span>
          </div>
          <CardTitle className="text-2xl font-['Outfit']">Bienvenido a Liser</CardTitle>
          <CardDescription>Organiza y comparte tus productos favoritos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" data-testid="login-email" type="email" placeholder="tu@email.com" required
                    value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" data-testid="login-password" type="password" placeholder="Tu contraseña" required
                    value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                </div>
                <Button type="submit" data-testid="login-submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 neon-glow">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" data-testid="register-email" type="email" placeholder="tu@email.com" required
                    value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Nombre de usuario</Label>
                  <Input id="reg-username" data-testid="register-username" placeholder="mi_usuario" required
                    value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-display">Nombre para mostrar</Label>
                  <Input id="reg-display" data-testid="register-display-name" placeholder="Mi Nombre"
                    value={registerData.display_name} onChange={(e) => setRegisterData({ ...registerData, display_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input id="reg-password" data-testid="register-password" type="password" placeholder="Minimo 6 caracteres" required
                    value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                </div>
                <Button type="submit" data-testid="register-submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 neon-glow">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cuenta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
