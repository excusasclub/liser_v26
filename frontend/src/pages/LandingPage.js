import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Layers,
  BarChart3,
  Lock,
  Zap,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "¿Necesito un número mínimo de seguidores para empezar?",
      a: "No. Puedes crear tu cuenta y tu primera BagList desde el primer día, independientemente del tamaño de tu audiencia."
    },
    {
      q: "¿Cómo y cuándo cobro mis comisiones?",
      a: "Monitoreamos las ventas generadas a través de tus enlaces y puedes retirar tus ingresos directamente a tu cuenta bancaria o PayPal."
    },
    {
      q: "¿Puedo usar mis propios enlaces de afiliados?",
      a: "¡Sí! Puedes integrar tus propios links de afiliado (Amazon, AliExpress, etc.) o utilizar los enlaces generados por la plataforma."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-sm border-primary/30 bg-primary/5 text-primary rounded-full">
            <Sparkles className="w-4 h-4" /> Diseñado para Creadores e Influencers
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-['Outfit'] max-w-4xl leading-[1.15]">
            Monetiza las recomendaciones <br className="hidden sm:inline" />
            <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              que ya le haces a tu audiencia
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Crea tu vitrina virtual de productos favoritos en menos de 2 minutos. Comparte un solo link en tu bio y gana comisiones por cada compra.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 h-12 gap-2 font-semibold shadow-lg shadow-primary/20">
                Crear Mi BagList Gratis <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Sin tarjeta de crédito</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Listo en 2 minutos</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> 100% Gratis</span>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / METRICS BAR ── */}
      <section className="border-b border-border/30 bg-card/20 py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-['Outfit']">+2,500</p>
            <p className="text-xs md:text-sm text-muted-foreground">Creadores activos</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-['Outfit']">+15,000</p>
            <p className="text-xs md:text-sm text-muted-foreground">BagLists Creadas</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary font-['Outfit']">98%</p>
            <p className="text-xs md:text-sm text-muted-foreground">Satisfacción de usuarios</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-['Outfit']">&lt; 2 min</p>
            <p className="text-xs md:text-sm text-muted-foreground">Tiempo de configuración</p>
          </div>
        </div>
      </section>

      {/* ── DEMO / BAGLIST EJEMPLO ── */}
      <section className="border-b border-border/30 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-primary/20 text-primary">Vista Previa</Badge>
            <h2 className="text-3xl font-bold font-['Outfit']">Así interactúan tus seguidores</h2>
          </div>

          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-border/80 via-border/30 to-border/10 shadow-2xl overflow-hidden">
            <div className="bg-background rounded-xl overflow-hidden border border-border/50">
              <img
                src="https://res.cloudinary.com/de8fcizbx/image/upload/v1785495315/Captura_de_pantalla_2026-07-31_120100_xvshij.jpg"
                alt="Ejemplo de BagList"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="border-b border-border/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
              De 0 a monetizar en 3 pasos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simplificamos el proceso para que te enboques solo en crear contenido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Crea tu espacio</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Regístrate sin costo y personaliza la apariencia de tu perfil con tu marca personal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Agrega tus productos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Organiza tus recomendados en listas visuales. Añade enlaces directos o de afiliación.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Comparte y Genera</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pon el enlace en la bio de tus redes. Recibe ingresos cada vez que compren tus recomendados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQS ── */}
      <section className="border-b border-border/30 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Outfit'] mb-4">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">Todo lo que necesitas saber antes de empezar</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="p-5 rounded-xl border border-border/50 bg-card/30 cursor-pointer transition-all hover:border-primary/30"
              >
                <div className="flex justify-between items-center font-semibold text-foreground">
                  <span>{faq.q}</span>
                  <span className="text-primary font-bold">{openFaq === idx ? '-' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 font-['Outfit']">
            ¿Listo para llevar tus recomendaciones al siguiente nivel?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Únete a miles de creadores que optimizan sus enlaces y monetizan su contenido con Liser.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 h-14 gap-2 font-bold shadow-xl shadow-primary/25">
              Crear Cuenta Gratis Ahora <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30 py-8 bg-card/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Liser 2026. Todos los derechos reservados.</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}