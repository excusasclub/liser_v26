import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BagListCard } from '@/components/BagListCard';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { Helmet } from 'react-helmet-async';

const CATEGORY_IMAGES = {
  Tech: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913221/tech_no_watermark_imv8mi.png',
  Fashion: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913223/fashion_no_watermark_uc86hn.png',
  Hogar: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/hogar_no_watermark_mc35sd.png',
  Belleza: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/belleza_no_watermark_bfiegs.png',
  Deportes: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/deportes_no_watermark_cnxcge.png',
  Cocina: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913218/cocina_no_watermark_bedgmw.png',
  Viajes: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913223/viaje_no_watermark_ijeked.png',
  Libros: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913219/libros_no_watermark_mfel44.png',
  Gaming: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/gaming_no_watermark_lgxpdm.png',
  Lifestyle: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913220/lifestyle_no_watermark_smarcs.png',
  Otros: 'https://res.cloudinary.com/de8fcizbx/image/upload/v1780913221/otros_no_watermark_g4sxqs.png',
};

export default function ExplorePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => { });

    api.get('/baglists?featured=true&limit=6')
      .then(res => setFeatured(res.data.baglists))
      .catch(() => { })
      .finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Explorar — Liser</title>
        <meta name="description" content="Descubre BagLists de productos curadas por la comunidad de Liser" />
      </Helmet>

      {/* Categorías */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-['Outfit'] text-foreground mb-6">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/explore/${encodeURIComponent(cat.toLowerCase())}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
            >
              {CATEGORY_IMAGES[cat] ? (
                <img
                  src={CATEGORY_IMAGES[cat]}
                  alt={cat}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-semibold text-base font-['Outfit'] drop-shadow">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Destacadas */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold font-['Outfit'] text-foreground">BagLists Destacadas</h2>
        </div>
        {loadingFeatured ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : featured.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8">No hay BagLists destacadas todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(baglist => (
              <BagListCard key={baglist.id} baglist={baglist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}