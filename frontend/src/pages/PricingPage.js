import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check, X, Zap, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    const [requested, setRequested] = useState({});

    const handleRequest = (planId) => {
        if (requested[planId]) return;
        const subject = encodeURIComponent(`Solicitud plan ${planId} — Liser`);
        const body = encodeURIComponent(`Hola,\n\nMe gustaría solicitar acceso al plan ${planId} de Liser.\n\nMi username en Liser es: \n\nGracias.`);
        window.open(`mailto:hello@liser.es?subject=${subject}&body=${body}`, '_blank');
        setRequested(prev => ({ ...prev, [planId]: true }));
        toast.success('Abriendo tu cliente de email...');
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

                                <div>
                                    <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4`}>
                                        <Icon className={`w-5 h-5 ${plan.color}`} />
                                    </div>
                                    <h2 className="text-xl font-bold font-['Outfit'] text-foreground">{plan.name}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                                </div>

                                <div className="flex items-end gap-1">
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
                                ) : (
                                    <Button
                                        className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90' : ''}`}
                                        variant={plan.highlight ? 'default' : 'outline'}
                                        onClick={() => handleRequest(plan.id)}
                                    >
                                        {requested[plan.id] ? '✓ Solicitud enviada' : 'Solicitar'}
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
        </>
    );
}