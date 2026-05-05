import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ContactPage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        email: user?.email || '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.message.trim().length < 10) {
            toast.error('El mensaje es demasiado corto');
            return;
        }
        setLoading(true);
        try {
            await api.post('/contact', form);
            setSent(true);
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error('Has enviado demasiados mensajes. Inténtalo mañana.');
            } else {
                toast.error(err.response?.data?.detail || 'Error al enviar. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contacto — Liser</title>
                <meta name="description" content="Contacta con el equipo de Liser. Estamos aquí para ayudarte." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-['Outfit'] text-foreground mb-3">
                        Contacto
                    </h1>
                    <p className="text-muted-foreground">
                        ¿Tienes alguna duda o sugerencia? Escríbenos y te respondemos.
                    </p>
                </div>

                {sent ? (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center flex flex-col items-center gap-4">
                        <CheckCircle className="w-12 h-12 text-primary" />
                        <h2 className="text-xl font-bold font-['Outfit'] text-foreground">Mensaje enviado</h2>
                        <p className="text-muted-foreground text-sm">Te responderemos en tu email lo antes posible.</p>
                        <Button variant="outline" onClick={() => { setSent(false); setForm({ email: user?.email || '', subject: '', message: '' }); }}>
                            Enviar otro mensaje
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="tu@email.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Asunto <span className="text-muted-foreground text-xs">({form.subject.length}/100)</span>
                            </Label>
                            <Input
                                id="subject"
                                placeholder="¿De qué se trata?"
                                maxLength={100}
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">
                                Mensaje * <span className="text-muted-foreground text-xs">({form.message.length}/1000)</span>
                            </Label>
                            <Textarea
                                id="message"
                                required
                                placeholder="Cuéntanos..."
                                rows={5}
                                maxLength={1000}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 gap-2"
                        >
                            {loading ? 'Enviando...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Enviar mensaje
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            También puedes escribirnos directamente a{' '}
                            <a href="mailto:hello@liser.es" className="text-primary hover:underline">hello@liser.es</a>
                        </p>
                    </form>
                )}
            </div>
        </>
    );
}