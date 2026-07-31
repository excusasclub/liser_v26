import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, BarChart3, Lock, Zap, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function LandingPage() {
  const [featured, setFeatured] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/baglists/797345e2-b24e-4af9-b39a-e73cb963dc9c')
      .then(res => {
        console.log('Featured loaded:', res.data);
        setFeatured(res.data);
      })
      .catch(err => console.error('Error loading featured:', err))
      .finally(() => setLoadingFeatured(false));
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

      {/* ── FEATURED BAGLIST ── */}
      {!loadingFeatured && featured && (
        <section className="border-b border-border/30 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12 p-6 rounded-xl border-2 border-primary/30 bg-primary/5">
              <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">BagList Ejemplo</p>
              <p className="text-muted-foreground">Así se ve una BagList creada en Liser. Puedes crear la tuya en minutos.</p>
            </div>

            <Link to={`/${featured.username}/${featured.slug}`} onClick={(e) => { window.scrollTo(0, 0); }} className="block rounded-2xl overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:-translate-y-2 shadow-lg hover:shadow-2xl max-w-2xl mx-auto">
              <img src="https://res.cloudinary.com/de8fcizbx/image/upload/v1785492069/Captura_de_pantalla_2026-07-31_120100_g832yo.jpg" alt="Ejemplo de BagList" className="w-full h-auto" />
            </Link>
          </div>
        </section>
      )}

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
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Crea tu perfil</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Regístrate gratis y personaliza tu espacio. Sin tarjeta de crédito.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Crea BagLists</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Organiza productos en listas bonitas. Añade fotos, descripciones y enlaces.
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-['Outfit']">Comparte y monetiza</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Comparte tus listas. Gana comisiones por cada clic y venta.
              </p>
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
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
            Planes para todos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Comienza gratis. Paga solo cuando quieras más.
          </p>
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="font-semibold">
              Ver planes y precios
            </Button>
          </Link>
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