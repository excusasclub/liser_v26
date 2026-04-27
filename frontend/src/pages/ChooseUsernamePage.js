import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ChooseUsernamePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const token = searchParams.get('token');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.length < 3) { toast.error('Mínimo 3 caracteres'); return; }
        setLoading(true);
        try {
            loginWithToken(token);
            await api.post('/auth/choose-username', { username });
            navigate('/dashboard');
            toast.success('¡Bienvenido a Liser!');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Username no disponible');
        } finally { setLoading(false); }
    };

    if (!token) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-border/50 bg-card">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center neon-glow mx-auto mb-3">
                        <span className="text-white font-bold text-lg font-['Outfit']">L</span>
                    </div>
                    <CardTitle className="text-2xl font-['Outfit']">Elige tu nombre de usuario</CardTitle>
                    <CardDescription>Este será permanente y formará parte de tus URLs públicas. Elige bien.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre de usuario</Label>
                            <Input
                                placeholder="mi_usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones bajos.</p>
                            {username && <p className="text-xs text-primary">Tu perfil: liser.es/user/{username}</p>}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 neon-glow">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar y entrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}