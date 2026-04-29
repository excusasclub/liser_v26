import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Bookmark, ExternalLink, Package, ArrowLeft, Edit, Share2, Loader2, Copy, Check } from 'lucide-react';
import { SiInstagram, SiYoutube, SiTiktok, SiX, SiPinterest, SiTwitch } from '@icons-pack/react-simple-icons';
import api from '../lib/api';
import FollowerCaptureModal from '@/components/FollowerCaptureModal';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const cloudinaryAuto = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};
export default function BagListDetailPage() {
  const { username, slug } = useParams();
  const { user } = useAuth();
  const [baglist, setBaglist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const handleCopyCode = async (code, baglistId, productId) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    const clicks = getLiserClicks();
    const key = `discount_${productId}`;
    const lastClick = clicks[key];
    const now = Date.now();
    if (!lastClick || (now - lastClick) >= 24 * 60 * 60 * 1000) {
      try {
        await api.post(`/baglists/${baglistId}/products/${productId}/discount-click`);
      } catch { /* silencioso */ }
      clicks[key] = now;
      setLiserClicks(clicks);
    }
  };

  const getLiserClicks = () => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('liser_clicks='));
    if (!cookie) return {};
    try { return JSON.parse(decodeURIComponent(cookie.split('=')[1])); } catch { return {}; }
  };

  const setLiserClicks = (data) => {
    document.cookie = `liser_clicks=${encodeURIComponent(JSON.stringify(data))}; max-age=31536000; path=/`;
  };

  const handleProductClick = async (baglistId, productId) => {
    if (user?.id === baglist.user_id) return;
    const clicks = getLiserClicks();
    const lastClick = clicks[productId];
    const now = Date.now();
    const alreadyClicked = lastClick && (now - lastClick) < 24 * 60 * 60 * 1000;
    if (!alreadyClicked) {
      try {
        await api.post(`/baglists/${baglistId}/products/${productId}/click`);
      } catch { /* silencioso */ }
      clicks[productId] = now;
      setLiserClicks(clicks);
    }
    if (!user) {
      const shown = document.cookie.split(';').some(c => c.trim() === 'liser_capture=1');
      if (!shown) {
        document.cookie = 'liser_capture=1; max-age=31536000; path=/';
        setShowCaptureModal(true);
      }
    }
  };
  useEffect(() => {
    const fetchBaglist = async () => {
      try {
        const res = await api.get(`/baglists/by-slug/${username}/${slug}`);
        setBaglist(res.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Error al cargar la lista');
      } finally { setLoading(false); }
    };
    fetchBaglist();
  }, [username, slug, user]);

  const handleFavorite = async () => {
    if (!user) { toast.error('Inicia sesión'); return; }
    if (isOwner) { toast.error('No puedes dar me gusta a tu propia lista'); return; }
    try {
      const res = await api.post(`/baglists/${baglist.id}/favorite`);
      setBaglist(prev => ({ ...prev, is_favorited: res.data.favorited, favorites_count: prev.favorites_count + (res.data.favorited ? 1 : -1) }));
    } catch { toast.error('Error'); }
  };

  const handleSave = async () => {
    if (!user) { toast.error('Inicia sesión'); return; }
    if (isOwner) { toast.error('No puedes guardar tu propia lista'); return; }
    try {
      const res = await api.post(`/baglists/${baglist.id}/save`);
      setBaglist(prev => ({ ...prev, is_saved: res.data.saved, saves_count: prev.saves_count + (res.data.saved ? 1 : -1) }));
    } catch { toast.error('Error'); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado');
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!baglist) return <div className="text-center py-32 text-muted-foreground">Lista no encontrada</div>;

  const isOwner = user && user.id === baglist.user_id;

  const SOCIAL_CONFIG = {
    instagram: { label: 'Instagram', color: '#E1306C', icon: SiInstagram },
    youtube: { label: 'YouTube', color: '#FF0000', icon: SiYoutube },
    tiktok: { label: 'TikTok', color: '#000000', icon: SiTiktok },
    twitter: { label: 'Twitter/X', color: '#000000', icon: SiX },
    pinterest: { label: 'Pinterest', color: '#E60023', icon: SiPinterest },
    twitch: { label: 'Twitch', color: '#9146FF', icon: SiTwitch },
  };

  const SocialIcon = ({ network, url }) => {
    const config = SOCIAL_CONFIG[network] || { label: network, color: '#888', icon: null };
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
        title={config.label}
        style={{ color: config.color }}
        className="flex items-center justify-center w-7 h-7 rounded-full border border-current hover:opacity-80 transition-opacity text-xs font-bold"
      >
        {config.icon ? <config.icon className="w-3.5 h-3.5" /> : config.label.charAt(0)}
      </a>
    );
  };

  return (
    <>
      <FollowerCaptureModal
        open={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        baglistId={baglist?.id}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="baglist-detail-page">
        <Helmet>
          <title>{baglist.title} — Liser</title>
          <meta name="description" content={baglist.description || `Lista de productos de ${baglist.display_name} en Liser`} />
          <meta name="keywords" content={[baglist.category, ...(baglist.tags || []), 'productos recomendados', 'lista de productos', baglist.display_name].filter(Boolean).join(', ')} />
          <meta name="author" content={baglist.display_name} />
          <link rel="canonical" href={`https://liser.es/${baglist.username}/${baglist.slug}`} />
          <meta property="og:title" content={`${baglist.title} — Liser`} />
          <meta property="og:description" content={baglist.description || `Lista de productos de ${baglist.display_name} en Liser`} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://liser.es/${baglist.username}/${baglist.slug}`} />
          {baglist.cover_image_url && <meta property="og:image" content={cloudinaryAuto(baglist.cover_image_url)} />}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${baglist.title} — Liser`} />
          <meta name="twitter:description" content={baglist.description || `Lista de productos de ${baglist.display_name} en Liser`} />
          {baglist.cover_image_url && <meta name="twitter:image" content={baglist.cover_image_url} />}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": baglist.title,
            "description": baglist.description || `Lista de productos de ${baglist.display_name}`,
            "url": `https://liser.es/${baglist.username}/${baglist.slug}`,
            "author": { "@type": "Person", "name": baglist.display_name },
            "numberOfItems": baglist.products?.length || 0,
            "itemListElement": (baglist.products || []).map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": p.name,
              "description": p.description || undefined,
              "url": p.link || undefined,
              "image": p.image_url || undefined,
              ...(p.price ? { "offers": { "@type": "Offer", "price": p.price, "priceCurrency": p.currency || "EUR" } } : {})
            }))
          })}</script>
        </Helmet>
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {baglist.category && baglist.category !== 'Other' && (
                <Badge className="bg-primary/20 text-primary border-0">{baglist.category}</Badge>
              )}
              {baglist.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs border-border/50">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-foreground mb-3" data-testid="baglist-title">{baglist.title}</h1>
            {baglist.description && (
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">{baglist.description}</p>
            )}
            <Link to={`/user/${baglist.username}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Avatar className="w-6 h-6">
                <AvatarImage src={baglist.avatar_url} alt={baglist.display_name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{baglist.display_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{baglist.display_name}</span>
              <span className="text-muted-foreground/50">@{baglist.username}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isOwner && (
              <Button variant="outline" size="sm" data-testid="detail-favorite-btn"
                onClick={handleFavorite}
                className={`gap-2 ${baglist.is_favorited ? 'border-red-500/30 text-red-400' : 'border-border/50'}`}>
                <Heart className={`w-4 h-4 ${baglist.is_favorited ? 'fill-current' : ''}`} /> {baglist.favorites_count || 0}
              </Button>
            )}
            {!isOwner && (
              <Button variant="outline" size="sm" data-testid="detail-save-btn"
                onClick={handleSave}
                className={`gap-2 ${baglist.is_saved ? 'border-primary/30 text-primary' : 'border-border/50'}`}>
                <Bookmark className={`w-4 h-4 ${baglist.is_saved ? 'fill-current' : ''}`} /> Guardar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleShare} data-testid="detail-share-btn" className="gap-2 border-border/50">
              <Share2 className="w-4 h-4" /> Compartir
            </Button>
            {isOwner && (
              <Link to={`/edit/${baglist.id}`}>
                <Button size="sm" data-testid="detail-edit-btn" className="gap-2 bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Products */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold font-['Outfit'] text-foreground">
            Productos <span className="text-muted-foreground font-normal text-base ml-2">({baglist.products?.length || 0})</span>
          </h2>
        </div>

        {(!baglist.products || baglist.products.length === 0) ? (
          <div className="text-center py-16 border border-dashed border-border/50 rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Esta lista aún no tiene productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baglist.products.map((product) => (
              <Card key={product.id} data-testid={`product-card-${product.id}`}
                className="group border-border/50 bg-card hover:border-primary/20 transition-all duration-300 overflow-hidden">
                <CardContent className="p-0 flex">
                  {product.link ? (
                    <a href={product.link} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); handleProductClick(baglist.id, product.id); }}
                      className="w-32 h-32 shrink-0 overflow-hidden bg-muted block">
                      {product.image_url ? (
                        <img src={cloudinaryAuto(product.image_url)} alt={product.name} width="800" height="800" className="w-full h-full object-contain bg-muted" loading="lazy" />
                      ) : (
                        <div className="w-full h-full product-image-placeholder flex items-center justify-center min-h-[8rem]">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </a>
                  ) : (
                    <div className="w-32 h-32 shrink-0 overflow-hidden bg-muted block">
                      {product.image_url ? (
                        <img src={cloudinaryAuto(product.image_url)} alt={product.name} width="800" height="800" className="w-full h-full object-contain bg-muted" loading="lazy" />
                      ) : (
                        <div className="w-full h-full product-image-placeholder flex items-center justify-center min-h-[8rem]">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                    {/* Nombre */}
                    {product.link ? (
                      <a href={product.link} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); handleProductClick(baglist.id, product.id); }}>
                        <h3 className="font-semibold text-foreground text-sm font-['Outfit'] hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
                      </a>
                    ) : (
                      <h3 className="font-semibold text-foreground text-sm font-['Outfit']">{product.name}</h3>
                    )}

                    {/* Descripción completa */}
                    {product.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
                    )}

                    {/* Redes sociales */}
                    {product.social_links && product.social_links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {product.social_links.map((link, idx) => (
                          <SocialIcon key={idx} network={link.network} url={link.url} />
                        ))}
                      </div>
                    )}

                    {/* Campos personalizados */}
                    {product.custom_fields && product.custom_fields.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.custom_fields.map((field, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                            <span className="font-medium text-foreground">{field.key}:</span> {field.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Precio, código descuento y enlace */}
                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                      {product.price != null && product.price > 0 && (
                        <span className="text-sm font-semibold text-secondary">{product.currency} {product.price.toFixed(2)}</span>
                      )}
                      {product.discount_code && (
                        <button
                          onClick={() => handleCopyCode(product.discount_code, baglist.id, product.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors text-xs font-mono"
                          title="Clic para copiar"
                        >
                          {copiedCode === product.discount_code ? (
                            <><Check className="w-3 h-3" /> ¡Copiado!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> {product.discount_code}</>
                          )}
                        </button>
                      )}
                      {product.link && (
                        <a href={product.link} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); handleProductClick(baglist.id, product.id); }}>
                          <Button size="sm" className="gap-1.5 text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <ExternalLink className="w-3 h-3" /> Ver producto
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}