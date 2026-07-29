import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, Heart, Filter, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Users, Zap, Target } from 'lucide-react';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    api.get('/baglists?featured=true&limit=3')
      .then(res => setFeatured(res.data.baglists))
      .catch(() => { })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const features = [
    { icon: Layers, title: 'BagLists Visuales', desc: 'Crea listas de productos organizadas de forma atractiva y profesional.' },
    { icon: Filter, title: 'Descubrimiento Fácil', desc: 'Encuentra BagLists por categoría, popularidad o búsqueda avanzada.' },
    { icon: Heart, title: 'Interacción Social', desc: 'Dale favorito, guarda y comparte las BagLists que más te gusten.' },
    { icon: TrendingUp, title: 'Analytics Integrado', desc: 'Monitorea clics, engagement y monetiza tus recomendaciones.' },
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Para Influencers',
      desc: 'Comparte tus productos favoritos y gana comisiones por cada venta.',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: Zap,
      title: 'Para Afiliados',
      desc: 'Crea listados de nicho y monetiza a través de enlaces de afiliación.',
      color: 'bg-amber-500/10 text-amber-600'
    },
    {
      icon: Target,
      title: 'Para Marcas',
      desc: 'Colabora con creadores y amplifica tu alcance de forma autenticada.',
      color: 'bg-emerald-500/10 text-emerald-600'
    },
  ];

  const steps = [
    { num: '1', title: 'Crea tu perfil', desc: 'Regístrate gratis y personaliza tu espacio de creador.' },
    { num: '2', title: 'Organiza productos', desc: 'Crea BagLists categorizadas con imágenes y descripciones.' },
    { num: '3', title: 'Comparte y gana', desc: 'Comparte tus listas y monetiza con enlaces de afiliación.' },
    { num: '4', title: 'Monitorea el éxito', desc: 'Sigue tus clics, favoritos y earnings en tiempo real.' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featured.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featured.length) % featured.length);
  };

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-3xl mb-12">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Plataforma de Curado de Productos
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-['Outfit'] leading-tight mb-6">
              Organiza, comparte y<br />
              <span className="text-primary">monetiza tus productos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              La plataforma todo-en-uno para creadores e influencers. Crea listas de productos hermosas, comparte con tu audiencia y gana comisiones por cada venta.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" data-testid="hero-cta">
                <Button size="lg" className="bg-primary hover:bg-primary/90 neon-glow text-base px-8 gap-2 font-semibold">
                  Comenzar Gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/explore" data-testid="hero-explore">
                <Button variant="outline" size="lg" className="text-base px-8 border-border/50 hover:border-primary/50 font-semibold">
                  Explorar Ejemplos
                </Button>
              </Link>
            </div>
          </div>

          {/* ── CAROUSEL DE DESTACADAS ── */}
          {!loadingFeatured && featured.length > 0 && (
            <div className="mt-16">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Lo que están creando</h3>
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border/30">
                <div className="relative h-80 bg-muted/20">
                  {featured.map((baglist, idx) => (
                    <div
                      key={baglist.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      <img
                        src={baglist.cover_image_url || 'https://via.placeholder.com/800x400'}
                        alt={baglist.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-xl font-bold text-white font-['Outfit'] mb-2 line-clamp-2">{baglist.title}</h4>
                        <p className="text-sm text-gray-200 mb-4">Por @{baglist.username}</p>
                        <Link to={`/${baglist.username}/${baglist.slug}`}>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1">
                            Ver BagList <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {featured.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit']">
              Para todos los creadores
            </h2>
            <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-lg">
              Ya seas influencer, afiliado o marca, Liser tiene lo que necesitas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="group p-8 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-lg ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <useCase.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground font-['Outfit'] mb-3">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit']">
              Empieza en 4 pasos
            </h2>
            <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-lg">
              Desde cero a tu primera BagList monetizada en minutos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-bold text-primary font-['Outfit']">{step.num}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-semibold text-foreground font-['Outfit'] mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit']">
              Herramientas potentes
            </h2>
            <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-lg">
              Todo lo que necesitas para curar y monetizar tus productos.
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

      {/* ── CTA FINAL ── */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-['Outfit'] mb-4">
            Empieza hoy, gratis
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-10">
            Crea tu primera BagList en minutos. Sin tarjeta de crédito. Sin compromisos.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90 neon-glow text-base px-10 gap-2 font-semibold">
              Crear Cuenta Gratis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
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