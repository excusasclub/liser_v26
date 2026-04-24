import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Si el email existe, recibirás un enlace');
        } catch {
            toast.error('Error al enviar el email');
        } finally { setLoading(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
        if (password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success('Contraseña actualizada');
            navigate('/auth');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Token inválido o expirado');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-border/50 bg-card">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center neon-glow mx-auto mb-3">
                        <span className="text-white font-bold text-lg font-['Outfit']">L</span>
                    </div>
                    <CardTitle className="text-2xl font-['Outfit']">
                        {token ? 'Nueva contraseña' : 'Recuperar contraseña'}
                    </CardTitle>
                    <CardDescription>
                        {token ? 'Introduce tu nueva contraseña' : 'Te enviaremos un enlace a tu email'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {token ? (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nueva contraseña</Label>
                                <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirmar contraseña</Label>
                                <Input type="password" placeholder="Repite la contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 neon-glow">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cambiar contraseña'}
                            </Button>
                        </form>
                    ) : sent ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            Si existe una cuenta con ese email, recibirás un enlace en breve. Revisa también tu carpeta de spam.
                        </div>
                    ) : (
                        <form onSubmit={handleForgot} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 neon-glow">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar enlace'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}