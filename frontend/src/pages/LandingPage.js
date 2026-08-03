import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  BarChart3,
  Video,
  Tag,
  Sliders,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "¿Necesito un número mínimo de seguidores para empezar?",
      a: "No. Puedes crear tu cuenta y tu primera BagList desde el primer día, independientemente del tamaño de tu audiencia."
    },
    {
      q: "¿Cómo gano dinero con mis enlaces?",
      a: "Utilizas tus propios enlaces de afiliado (Amazon, AliExpress, marcas asociadas, etc.). Liser sirve como una vitrina visual atractiva; las compras y comisiones se gestionan directamente a través de tus programas de afiliación habituales."
    },
    {
      q: "¿Hay comisiones o retención de ingresos por parte de Liser?",
      a: "Ninguna. No hay movimiento ni gestión de dinero dentro de Liser. Todo lo que generes con tus enlaces es 100% tuyo."
    },
    {
      q: "¿Cómo funciona la detección de enlaces rotos?",
      a: "Nuestros planes de pago monitorean tus BagLists para avisarte si un producto ya no está disponible o la URL está caída, evitando que pierdas ventas y comisiones."
    },
    {
      q: "¿Puedo vincular mis videos de TikTok, Reels o YouTube?",
      a: "¡Sí! Puedes añadir el enlace de tu video o reseña directamente al producto para redirigir tráfico orgánico hacia tus redes sociales."
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
            <Sparkles className="w-4 h-4" /> La vitrina virtual definitiva para creadores
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-['Outfit'] max-w-4xl leading-[1.15]">
            Organiza tus recomendados y <br className="hidden sm:inline" />
            <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              potencia tus enlaces de afiliado
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Crea una vitrina elegante con tus productos favoritos en minutos. Usa tus propios links de afiliado, comparte un solo enlace en tu bio y no pierdas ni una comisión.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 h-12 gap-2 font-semibold shadow-lg shadow-primary/20">
                Crear Mi BagList Gratis <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Sin comisiones ocultas</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Tus propios enlaces</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Listo en 2 minutos</span>
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS Y REDES COMPATIBLES ── */}
      <section className="border-b border-border/30 bg-card/20 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">
            Compatible con tus redes sociales y programas de afiliación preferidos
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-foreground/70 font-bold text-base md:text-lg">
            <span>Amazon Afiliados</span>
            <span>AliExpress</span>
            <span>LTK / ShopMy</span>
            <span>TikTok</span>
            <span>Instagram Reels</span>
            <span>YouTube</span>
          </div>
        </div>
      </section>

      {/* ── DEMO / VISTA PREVIA ── */}
      <section className="border-b border-border/30 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-primary/20 text-primary">Diseño Impecable</Badge>
            <h2 className="text-3xl font-bold font-['Outfit']">Una vitrina limpia para tus seguidores</h2>
            <p className="text-muted-foreground mt-2">Mantén tus recomendaciones organizadas, atractivas y siempre accesibles.</p>
          </div>

          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-border/80 via-border/30 to-border/10 shadow-2xl overflow-hidden">
            <div className="bg-background rounded-xl overflow-hidden border border-border/50">
              <img
                src="https://res.cloudinary.com/de8fcizbx/image/upload/v1785741354/Captura_de_pantalla_2026-07-31_120100_mpv5me.jpg"
                alt="Ejemplo de BagList"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS CLAVE ── */}
      <section className="border-b border-border/30 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Outfit']">
              Todo lo que necesitas para gestionar tus recomendados
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Liser te da las herramientas visuales y analíticas para optimizar cada click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Detector de Enlaces Rotos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Evita perder ingresos. En los planes de pago, detectamos automáticamente enlaces caídos o productos agotados.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <Copy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Cupones y Descuentos en 1-Clic</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Añade códigos promocionales, referencias o etiquetas personalizadas que tus seguidores pueden copiar al instante.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Tráfico Cruzado con Redes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enlaza tus TikToks, Reels o videos de YouTube directamente a cada producto para conseguir reproducciones orgánicas extra.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Métricas Detalladas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualiza clics en enlaces, clics en códigos de descuento y guardados en favoritos en tiempo real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Campos 100% Personalizables</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Añade especificaciones, tallas, referencias o cualquier etiqueta que necesites adaptar a tu nicho.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-['Outfit']">Tus Propios Afiliados</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No hay intermediación financiera. Mantienes el control directo sobre tus plataformas y comisiones habituales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES DE PRECIOS ── */}
      <section className="border-b border-border/30 py-20 bg-card/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] mb-4">Planes diseñados para cada etapa</h2>
            <p className="text-muted-foreground text-lg">Comienza gratis y escala según crezca tu contenido.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* PLAN FREE */}
            <div className="p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold font-['Outfit'] mb-2">Free</h3>
                <p className="text-sm text-muted-foreground mb-4">Para empezar a recomendar</p>
                <div className="text-4xl font-extrabold mb-6">Gratis</div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 3 BagLists</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 7 productos por BagList</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> URLs permanentes SEO</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Enlaces de afiliado</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Códigos de descuento</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Campos personalizados</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Analytics de 1 BagList</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Duplicar productos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Captura de emails de seguidores</li>
                </ul>
              </div>
              <Link to="/auth">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Empezar gratis
                </Button>
              </Link>
            </div>

            {/* PLAN PRO */}
            <div className="p-8 rounded-2xl bg-card border-2 border-primary relative flex flex-col justify-between shadow-xl">
              <Badge className="absolute -top-3 right-6 bg-primary text-primary-foreground">Más popular</Badge>
              <div>
                <h3 className="text-2xl font-bold font-['Outfit'] mb-2">Pro</h3>
                <p className="text-sm text-muted-foreground mb-4">Para creadores activos</p>
                <div className="text-4xl font-extrabold mb-6">4€ <span className="text-base font-normal text-muted-foreground">/mes</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 10 BagLists</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 12 productos por BagList</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Detector de enlaces rotos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> URLs permanentes SEO</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Enlaces de afiliado</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Códigos de descuento</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Campos personalizados</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Analytics completos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Duplicar productos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Captura de emails de seguidores</li>
                </ul>
              </div>
              <Link to="/auth">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Iniciar sesión para solicitar
                </Button>
              </Link>
            </div>

            {/* PLAN PREMIUM */}
            <div className="p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold font-['Outfit'] mb-2">Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">Para creadores profesionales</p>
                <div className="text-4xl font-extrabold mb-6">15€ <span className="text-base font-normal text-muted-foreground">/mes</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 25 BagLists</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 20 productos por BagList</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Detector de enlaces rotos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> URLs permanentes SEO</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Enlaces de afiliado</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Códigos de descuento</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Campos personalizados</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Analytics completos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Duplicar productos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Captura de emails de seguidores</li>
                </ul>
              </div>
              <Link to="/auth">
                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Iniciar sesión para solicitar
                </Button>
              </Link>
            </div>

          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Los planes de pago están en desarrollo. Si quieres acceso anticipado, escríbenos a{' '}
            <a href="mailto:hello@liser.es" className="text-primary underline underline-offset-4">
              hello@liser.es
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQS ── */}
      <section className="border-b border-border/30 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Outfit'] mb-4">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">Todo lo que necesitas saber sobre Liser</p>
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
            ¿Listo para organizar tus recomendados?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Únete a los creadores que ya optimizan sus enlaces de afiliado y mejoran su estética con Liser.
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