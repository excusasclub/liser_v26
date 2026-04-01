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
import axios from 'axios';
import { toast } from 'sonner';

export default function EditProfilePage() {
    const { user, getAuthHeaders, API, setUser } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        display_name: user?.display_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || '',
    });

    const handleSave = async () => {
        if (!form.display_name.trim()) { toast.error('El nombre es obligatorio'); return; }
        setSaving(true);
        try {
            const res = await axios.put(`${API}/auth/me`, form, { headers: getAuthHeaders() });
            setUser(res.data);
            toast.success('Perfil actualizado');
            navigate(`/user/${user.username}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al guardar');
        } finally { setSaving(false); }
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
                        <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar.</p>
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
                        />
                        <p className="text-xs text-muted-foreground">También puedes pegar una URL directamente:</p>
                        <Input value={form.avatar_url} placeholder="https://..."
                            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}