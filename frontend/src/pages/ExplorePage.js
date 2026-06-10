import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BagListCard } from '@/components/BagListCard';
import { Loader2, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { Helmet } from 'react-helmet-async';

const CATEGORIES = [
  { name: 'Tech', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913221/tech_no_watermark_imv8mi.png' },
  { name: 'Fashion', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913223/fashion_no_watermark_uc86hn.png' },
  { name: 'Hogar', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/hogar_no_watermark_mc35sd.png' },
  { name: 'Belleza', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/belleza_no_watermark_bfiegs.png' },
  { name: 'Deportes', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/deportes_no_watermark_cnxcge.png' },
  { name: 'Cocina', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/cocina_no_watermark_bedgmw.png' },
  { name: 'Viajes', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913223/viaje_no_watermark_ijeked.png' },
  { name: 'Libros', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913219/libros_no_watermark_mfel44.png' },
  { name: 'Gaming', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/gaming_no_watermark_lgxpdm.png' },
  { name: 'Lifestyle', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/lifestyle_no_watermark_smarcs.png' },
  { name: 'Otros', image: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913221/otros_no_watermark_g4sxqs.png' },
];

export default function ExplorePage() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/baglists?featured=true&limit=6')
      .then(res => setFeatured(res.data.baglists))
      .catch(() => { })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const scroll = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Explorar — Liser</title>
        <meta name="description" content="Descubre BagLists de productos curadas por la comunidad de Liser" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, hsl(152 60% 40% / 0.4), transparent)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4 font-['Outfit']">
            Lo mejor, curado para ti
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-['Outfit'] text-foreground leading-tight mb-6">
            Descubre productos<br />
            <span className="text-primary">que ya funcionan</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            BagLists creadas por personas reales. Sin patrocinios ocultos, sin relleno.
          </p>
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Busca una BagList o categoría…"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-['Inter']"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity font-['Outfit']"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ── CATEGORÍAS SLIDER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-['Outfit'] text-foreground">Explorar por categoría</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/explore/${encodeURIComponent(cat.name.toLowerCase())}`}
              onClick={() => setActiveCategory(cat.name)}
              className="group relative flex-shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer"
              style={{ width: 200, height: 260 }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-white font-bold text-lg font-['Outfit'] leading-tight">
                  {cat.name}
                </span>
              </div>
              {/* borde verde al hover */}
              <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-primary transition-all duration-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── DESTACADAS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-['Outfit'] text-foreground">BagLists Destacadas</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Las más recomendadas en este momento</p>
          </div>
          <Link
            to="/explore/all"
            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:opacity-80 transition-opacity font-['Outfit']"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-['Outfit'] font-semibold mb-1">Pronto habrá destacadas aquí</p>
            <p className="text-sm">Mientras tanto, explora las categorías.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(baglist => (
              <BagListCard key={baglist.id} baglist={baglist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}