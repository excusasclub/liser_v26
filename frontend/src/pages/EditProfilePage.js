import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import api from '../lib/api';
import { toast } from 'sonner';

export default function EditProfilePage() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
    const [savingEmail, setSavingEmail] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [form, setForm] = useState({
        username: user?.username || '',
        display_name: user?.display_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || '',
    });

    const handleSave = async () => {
        if (!form.display_name.trim()) { toast.error('El nombre es obligatorio'); return; }
        setSaving(true);
        try {
            const res = await api.put('/auth/me', form);
            setUser(res.data);
            toast.success('Perfil actualizado');
            navigate(`/user/${user.username}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al guardar');
        } finally { setSaving(false); }
    };

    const handleEmailSave = async () => {
        if (!emailForm.email.includes('@')) { toast.error('Email no válido'); return; }
        setSavingEmail(true);
        try {
            await api.put('/auth/me/email', emailForm);
            toast.success('Te hemos enviado un email de confirmación al nuevo correo');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al actualizar email');
        } finally { setSavingEmail(false); }
    };

    const handlePasswordSave = async () => {
        if (!passwordForm.current_password || !passwordForm.new_password) { toast.error('Completa todos los campos'); return; }
        if (passwordForm.new_password.length < 8) { toast.error('Mínimo 8 caracteres'); return; }
        setSavingPassword(true);
        try {
            await api.put('/auth/me/password', passwordForm);
            toast.success('Contraseña actualizada');
            setPasswordForm({ current_password: '', new_password: '' });
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al actualizar contraseña');
        } finally { setSavingPassword(false); }
    };

    return (
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
            <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Volver
            </Button>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold font-['Outfit'] text-foreground">Editar perfil</h1>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </Button>
            </div>

            <Card className="border-border/50 bg-card">
                <CardHeader><CardTitle className="font-['Outfit']">Información del perfil</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre de usuario</Label>
                        <Input value={user?.username} disabled className="opacity-50 cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground">⚠️ El nombre de usuario forma parte de tus URLs públicas y no puede cambiarse.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Nombre visible *</Label>
                        <Input value={form.display_name} placeholder="Tu nombre"
                            onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Biografía</Label>
                        <Textarea rows={3} value={form.bio} placeholder="Cuéntanos algo sobre ti..."
                            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Avatar</Label>
                        <ImageUpload
                            value={form.avatar_url}
                            onChange={(url) => setForm({ ...form, avatar_url: url })}
                            placeholder="Subir avatar"
                            uploadType="avatar"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-card mt-6">
                <CardHeader><CardTitle className="font-['Outfit']">Cambiar email</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nuevo email</Label>
                        <Input type="email" value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} />
                    </div>
                    <Button onClick={handleEmailSave} disabled={savingEmail} className="bg-primary hover:bg-primary/90 gap-2">
                        {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar email
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card mt-6">
                <CardHeader><CardTitle className="font-['Outfit']">Cambiar contraseña</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Contraseña actual</Label>
                        <Input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Nueva contraseña</Label>
                        <Input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                    </div>
                    <Button onClick={handlePasswordSave} disabled={savingPassword} className="bg-primary hover:bg-primary/90 gap-2">
                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar contraseña
                    </Button>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-card mt-6 border-destructive/50">
                <CardHeader><CardTitle className="font-['Outfit'] text-destructive text-base">Zona de peligro</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Eliminar tu cuenta es permanente. Se borrarán todas tus BagLists, productos e imágenes.</p>
                    <Button variant="destructive" size="sm" onClick={async () => {
                        if (!window.confirm('¿Seguro? Esta acción no se puede deshacer.')) return;
                        try {
                            await api.delete('/auth/me');
                            logout();
                            navigate('/');
                            toast.success('Cuenta eliminada');
                        } catch { toast.error('Error al eliminar la cuenta'); }
                    }}>
                        Eliminar mi cuenta
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}