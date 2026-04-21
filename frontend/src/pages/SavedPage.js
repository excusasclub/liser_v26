import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Heart, Loader2, Package } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function SavedPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savedRes, favsRes] = await Promise.all([
          api.get('/users/me/saved'),
          api.get('/users/me/favorites')
        ]);
        setSaved(savedRes.data);
        setFavorites(favsRes.data);
      } catch { toast.error('Error al cargar'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const updateSaved = (updated) => setSaved(prev => prev.map(b => b.id === updated.id ? updated : b));
  const updateFavorites = (updated) => setFavorites(prev => prev.map(b => b.id === updated.id ? updated : b));

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const EmptyState = ({ icon: Icon, text }) => (
    <div className="text-center py-20">
      <Icon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="saved-page">
      <h1 className="text-3xl font-bold font-['Outfit'] text-foreground mb-8">Guardados y Favoritos</h1>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="saved" data-testid="tab-saved" className="gap-2">
            <Bookmark className="w-4 h-4" /> Guardados ({saved.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" data-testid="tab-favorites" className="gap-2">
            <Heart className="w-4 h-4" /> Favoritos ({favorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          {saved.length === 0 ? (
            <EmptyState icon={Package} text="No has guardado ninguna BagList aun. Explora y guarda las que te gusten." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {saved.map(b => <BagListCard key={b.id} baglist={b} onUpdate={updateSaved} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <EmptyState icon={Package} text="No has marcado ninguna BagList como favorita aun." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map(b => <BagListCard key={b.id} baglist={b} onUpdate={updateFavorites} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
