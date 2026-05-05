import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Check, X, Zap, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Para empezar a recomendar',
        icon: Zap,
        color: 'text-muted-foreground',
        borderColor: 'border-border/50',
        features: [
            { text: '3 BagLists', included: true },
            { text: '7 productos por BagList', included: true },
            { text: 'URLs permanentes SEO', included: true },
            { text: 'Enlaces de afiliado', included: true },
            { text: 'Códigos de descuento', included: true },
            { text: 'Campos personalizados', included: true },
            { text: 'Analytics de 1 BagList', included: true },
            { text: 'Analytics completos', included: false },
            { text: 'Duplicar productos', included: false },
            { text: 'Captura de emails de seguidores', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 4,
        description: 'Para creadores activos',
        icon: Star,
        color: 'text-primary',
        borderColor: 'border-primary/50',
        highlight: true,
        features: [
            { text: '10 BagLists', included: true },
            { text: '12 productos por BagList', included: true },
            { text: 'URLs permanentes SEO', included: true },
            { text: 'Enlaces de afiliado', included: true },
            { text: 'Códigos de descuento', included: true },
            { text: 'Campos personalizados', included: true },
            { text: 'Analytics completos', included: true },
            { text: 'Duplicar productos', included: true },
            { text: 'Captura de emails de seguidores', included: false },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 15,
        description: 'Para creadores profesionales',
        icon: Sparkles,
        color: 'text-yellow-500',
        borderColor: 'border-yellow-500/30',
        features: [
            { text: '25 BagLists', included: true },
            { text: '20 productos por BagList', included: true },
            { text: 'URLs permanentes SEO', included: true },
            { text: 'Enlaces de afiliado', included: true },
            { text: 'Códigos de descuento', included: true },
            { text: 'Campos personalizados', included: true },
            { text: 'Analytics completos', included: true },
            { text: 'Duplicar productos', included: true },
            { text: 'Captura de emails de seguidores', included: true },
        ],
    },
];

export default function PricingPage() {
    const { user } = useAuth();
    const [requested, setRequested] = useState({});
    const [dialogPlan, setDialogPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        ['pro', 'premium'].forEach(async (plan) => {
            try {
                const res = await api.get(`/plans/request-status/${plan}`);
                if (res.data.requested) {
                    setRequested(prev => ({ ...prev, [plan]: true }));
                }
            } catch { }
        });
    }, [user]);

    const handleRequest = async () => {
        if (!dialogPlan) return;
        setLoading(true);
        try {
            await api.post('/plans/request', { plan: dialogPlan });
            setRequested(prev => ({ ...prev, [dialogPlan]: true }));
            toast.success('Solicitud enviada. Te contactaremos pronto.');
            setDialogPlan(null);
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('Ya has solicitado este plan anteriormente.');
                setRequested(prev => ({ ...prev, [dialogPlan]: true }));
            } else {
                toast.error('Error al enviar la solicitud. Inténtalo de nuevo.');
            }
            setDialogPlan(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Planes y precios — Liser</title>
                <meta name="description" content="Elige el plan de Liser que mejor se adapta a ti. Desde gratis hasta premium, para cada tipo de creador." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6">
                        <Sparkles className="w-3 h-3" />
                        Próximamente
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold font-['Outfit'] text-foreground mb-4">
                        Planes para cada creador
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Empieza gratis y escala cuando lo necesites. Sin contratos, sin sorpresas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border ${plan.borderColor} bg-card p-6 flex flex-col gap-6 ${plan.highlight ? 'ring-1 ring-primary/30' : ''}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                                            Más popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                                        <Icon className={`w-5 h-5 ${plan.color}`} />
                                    </div>
                                    <h2 className="text-xl font-bold font-['Outfit'] text-foreground">{plan.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                                </div>

                                <div className="flex items-end gap-1 justify-center">
                                    {plan.price === 0 ? (
                                        <span className="text-4xl font-bold font-['Outfit'] text-foreground">Gratis</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold font-['Outfit'] text-foreground">{plan.price}€</span>
                                            <span className="text-muted-foreground text-sm mb-1">/mes</span>
                                        </>
                                    )}
                                </div>

                                <ul className="space-y-2.5 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm">
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-primary shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.price === 0 ? (
                                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/auth'}>
                                        Empezar gratis
                                    </Button>
                                ) : user ? (
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                                        variant={plan.highlight ? 'default' : 'outline'}
                                        disabled={requested[plan.id]}
                                        onClick={() => !requested[plan.id] && setDialogPlan(plan.id)}
                                    >
                                        {requested[plan.id] ? '✓ Solicitud enviada' : 'Solicitar'}
                                    </Button>
                                ) : (
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                                        variant={plan.highlight ? 'default' : 'outline'}
                                        onClick={() => window.location.href = '/auth'}
                                    >
                                        Iniciar sesión para solicitar
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-10">
                    Los planes de pago están en desarrollo. Si quieres acceso anticipado, escríbenos a{' '}
                    <a href="mailto:hello@liser.es" className="text-primary hover:underline">hello@liser.es</a>
                </p>
            </div>

            <Dialog open={!!dialogPlan} onOpenChange={(open) => !open && setDialogPlan(null)}>
                <DialogContent className="bg-card border-border max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-['Outfit']">Solicitar plan {dialogPlan}</DialogTitle>
                        <DialogDescription>
                            Te contactaremos en tu email registrado para activar el plan. Solo puedes solicitar cada plan una vez.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setDialogPlan(null)}>
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleRequest} disabled={loading}>
                            {loading ? 'Enviando...' : 'Confirmar solicitud'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}