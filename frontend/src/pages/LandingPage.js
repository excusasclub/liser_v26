import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, BarChart3, Lock, Zap, Users, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function LandingPage() {
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    api.get('/baglists?limit=1')
      .then(res => setFeaturedCount(res.data.total || 1000))
      .catch(() => setFeaturedCount(1000));
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-secondary/3 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-sm border-primary/20 text-primary">
              <Sparkles className="w-3.5 h-3.5" /> La plataforma de los creadores
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-['Outfit'] leading-tight">
              Organiza tus productos favoritos.<br />
              <span className="text-primary">Comparte sin límites.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Crea listas curadas de productos, comparte con tu audiencia y gana comisiones por cada venta. Diseñado para creadores e influencers.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-8 gap-2 font-semibold">
                  Comenzar Gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="lg" className="text-base px-8 font-semibold border-border/50 hover:border-primary/50">
                  Explorar Listas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-border/30 bg-card/30 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">1000+</div>
              <p className="text-sm text-muted-foreground">Baglists creadas</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">10M+</div>
              <p className="text-sm text-muted-foreground">Clics totales</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">500+</div>
              <p className="text-sm text-muted-foreground">Creadores activos</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="border-b border-border/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
              3 pasos, sin complicación
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Desde tu primer BagList hasta tu primera comisión en minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Crea tu perfil</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Regístrate gratis y personaliza tu espacio. Sin tarjeta de crédito.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Crea BagLists</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Organiza productos en listas bonitas. Añade fotos, descripciones y enlaces.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Comparte y gana</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Comparte tus listas. Gana comisiones por cada clic y venta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section className="border-b border-border/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Herramientas potentes para creadores de contenido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group p-8 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-['Outfit']">Listas visuales</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Crea BagLists hermosas con imágenes, descripciones y categorías. Totalmente personalizable.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-['Outfit']">Analytics real-time</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Monitorea clics, favoritos y earnings. Datos detallados para optimizar.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-['Outfit']">Privacidad y control</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Listas públicas o privadas. Tú controlas quién ve tu contenido.
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-['Outfit']">Rápido y simple</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sin complicaciones. Crea tu primer BagList en menos de 2 minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section className="border-b border-border/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
              Planes para todos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comienza gratis. Paga solo cuando quieras más.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-xl border border-border/50 bg-card/30">
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Free</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfecto para empezar</p>
              <div className="text-3xl font-bold text-foreground mb-6">Gratis</div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 3 BagLists
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 7 productos por lista
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Analytics básico
                </li>
              </ul>
              <Link to="/auth" className="w-full">
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Comenzar
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-xl border-2 border-primary bg-card/40 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white">Popular</Badge>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Pro</h3>
              <p className="text-muted-foreground text-sm mb-6">Para creadores activos</p>
              <div className="text-3xl font-bold text-foreground mb-1">$9<span className="text-lg text-muted-foreground">/mes</span></div>
              <p className="text-xs text-muted-foreground mb-6">Facturación anual</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 10 BagLists
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 12 productos por lista
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Analytics avanzado
                </li>
              </ul>
              <Link to="/auth" className="w-full">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold">
                  Upgrade Pro
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-xl border border-border/50 bg-card/30">
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Premium</h3>
              <p className="text-muted-foreground text-sm mb-6">Sin límites</p>
              <div className="text-3xl font-bold text-foreground mb-1">$19<span className="text-lg text-muted-foreground">/mes</span></div>
              <p className="text-xs text-muted-foreground mb-6">Facturación anual</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 25 BagLists
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 20 productos por lista
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Acceso a blog exclusivo
                </li>
              </ul>
              <Link to="/auth" className="w-full">
                <Button variant="outline" size="lg" className="w-full font-semibold">
                  Upgrade Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-['Outfit']">
            Empieza hoy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Gratis, sin tarjeta de crédito. En menos de 2 minutos tendrás tu primer BagList.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-10 gap-2 font-semibold">
              Crear Cuenta Gratis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30 py-8 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Liser 2026. Todos los derechos reservados.</span>
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold font-['Outfit']">L</span>
          </div>
        </div>
      </footer>
    </div>
  );
}