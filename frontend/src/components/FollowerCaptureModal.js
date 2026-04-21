import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function FollowerCaptureModal({ open, onClose, baglistId }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!email || !email.includes('@')) { toast.error('Introduce un email válido'); return; }
        setLoading(true);
        try {
            await api.post(`/baglists/${baglistId}/follow`, { email });
            setDone(true);
        } catch {
            toast.error('Error al suscribirse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-5 h-5 text-primary" />
                        <DialogTitle>¿Te ha gustado esta BagList?</DialogTitle>
                    </div>
                    <DialogDescription>
                        Déjanos tu email y te avisamos cuando se actualice con nuevos productos.
                    </DialogDescription>
                </DialogHeader>
                {done ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        ✅ ¡Listo! Te avisaremos cuando haya novedades.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pt-2">
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                                {loading ? 'Enviando...' : 'Avisarme'}
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                                Ahora no
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Sin spam. Solo actualizaciones de esta BagList.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}