import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, Heart, Filter, TrendingUp, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Layers, title: 'BagLists Visuales', desc: 'Crea BagLists con productos organizados de forma atractiva y profesional.' },
    { icon: Filter, title: 'Filtros Inteligentes', desc: 'Descubre BagLists por categoria, popularidad o busqueda avanzada.' },
    { icon: Heart, title: 'Interaccion Social', desc: 'Dale favorito y guarda las BagLists que mas te gusten.' },
    { icon: TrendingUp, title: 'Listo para Crecer', desc: 'Plataforma escalable con base para afiliacion y analytics.' },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/30 text-primary animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Plataforma de Curado de Productos
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-fade-in-up stagger-1 font-['Outfit']">
              Organiza, comparte y<br />
              <span className="text-primary">descubre productos</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-in-up stagger-2">
              Liser permite a creadores de contenido e influencers crear listas de productos llamadas BagLists, compartirlas con su audiencia y monetizar sus recomendaciones.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up stagger-3">
              <Link to="/auth" data-testid="hero-cta">
                <Button size="lg" className="bg-primary hover:bg-primary/90 neon-glow text-base px-8 gap-2">
                  Comenzar Gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/explore" data-testid="hero-explore">
                <Button variant="outline" size="lg" className="text-base px-8 border-border/50 hover:border-primary/50">
                  Explorar Listas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit']">
              Todo lo que necesitas
            </h2>
            <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-lg">
              Herramientas potentes para curar y compartir productos de forma profesional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground font-['Outfit'] mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit'] mb-4">
            Empieza a crear tus BagLists
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-8">
            Registrate gratis y comienza a organizar tus productos favoritos hoy.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 neon-glow text-base px-10 gap-2">
              Crear Cuenta <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Liser 2026. Todos los derechos reservados.</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold font-['Outfit']">L</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
