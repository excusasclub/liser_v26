import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '../lib/api';
import { toast } from 'sonner';

export function BagListCard({ baglist, onUpdate, compact = false }) {
  const { user } = useAuth();

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Inicia sesion para dar favorito'); return; }
    try {
      const res = await api.post(`/baglists/${baglist.id}/favorite`);
      if (onUpdate) onUpdate({ ...baglist, is_favorited: res.data.favorited, favorites_count: baglist.favorites_count + (res.data.favorited ? 1 : -1) });
    } catch { toast.error('Error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Inicia sesion para guardar'); return; }
    try {
      const res = await api.post(`/baglists/${baglist.id}/save`);
      if (onUpdate) onUpdate({ ...baglist, is_saved: res.data.saved, saves_count: baglist.saves_count + (res.data.saved ? 1 : -1) });
    } catch { toast.error('Error'); }
  };

  const productCount = baglist.products?.length || 0;
  const coverImage = baglist.cover_image_url || baglist.products?.[0]?.image_url;

  return (
    <Link to={baglist.slug ? `/list/${baglist.username}/${baglist.slug}` : `/baglist/${baglist.id}`} data-testid={`baglist-card-${baglist.id}`}>
      <Card className="group overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {coverImage ? (
            <img src={coverImage} alt={baglist.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full product-image-placeholder flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <Button variant="ghost" size="icon" data-testid={`favorite-btn-${baglist.id}`}
              onClick={handleFavorite}
              className={`w-8 h-8 rounded-full backdrop-blur-md ${baglist.is_favorited ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white/70 hover:text-white'}`}>
              <Heart className={`w-4 h-4 ${baglist.is_favorited ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" data-testid={`save-btn-${baglist.id}`}
              onClick={handleSave}
              className={`w-8 h-8 rounded-full backdrop-blur-md ${baglist.is_saved ? 'bg-primary/20 text-primary' : 'bg-black/40 text-white/70 hover:text-white'}`}>
              <Bookmark className={`w-4 h-4 ${baglist.is_saved ? 'fill-current' : ''}`} />
            </Button>
          </div>
          {baglist.category && baglist.category !== 'Other' && (
            <Badge className="absolute bottom-3 left-3 bg-primary/80 backdrop-blur-sm text-xs border-0">
              {baglist.category}
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1 font-['Outfit'] text-base group-hover:text-primary transition-colors">{baglist.title}</h3>
          {baglist.description && !compact && (
            <p className="text-sm text-muted-foreground line-clamp-2">{baglist.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/user/${baglist.username}`; }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              @{baglist.username}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Package className="w-3 h-3" />{productCount}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{baglist.favorites_count || 0}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
