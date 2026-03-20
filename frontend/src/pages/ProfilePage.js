import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Calendar, Layers, Heart, Settings } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ProfilePage() {
  const { username } = useParams();
  const { user, getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [baglists, setBaglists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('listas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = user ? getAuthHeaders() : {};
        const res = await axios.get(`${API}/users/${username}`, { headers });
        setProfile(res.data.user);
        setBaglists(res.data.baglists);
        setFavorites(res.data.favorites || []);
        setIsOwnProfile(res.data.is_own_profile || false);
      } catch { toast.error('Usuario no encontrado'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [username, user, getAuthHeaders]);

  const updateBaglist = (updated) => setBaglists(prev => prev.map(b => b.id === updated.id ? updated : b));

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center py-32 text-muted-foreground">Usuario no encontrado</div>;

  const joinDate = new Date(profile.created_at).toLocaleDateString('es', { year: 'numeric', month: 'long' });

  const tabs = [
    { id: 'listas', label: 'Listas', count: baglists.length },
    { id: 'favoritos', label: 'Favoritos', count: favorites.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="profile-page">
      <Helmet>
        <title>{profile.display_name} (@{profile.username}) — Liser</title>
        <meta name="description" content={profile.bio || `Listas de productos de ${profile.display_name} en Liser`} />
        <meta property="og:title" content={`${profile.display_name} (@${profile.username}) — Liser`} />
        <meta property="og:description" content={profile.bio || `Listas de productos de ${profile.display_name} en Liser`} />
        <meta property="og:type" content="profile" />
        {profile.avatar_url && <meta property="og:image" content={profile.avatar_url} />}
      </Helmet>

      {/* Profile Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-6">
          <Avatar className="w-20 h-20 shrink-0">
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold font-['Outfit']">
              {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-['Outfit'] text-foreground">{profile.display_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="text-foreground/80 mt-2 max-w-lg">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {baglists.length} listas</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {favorites.length} favoritos</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {joinDate}</span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => navigate('/settings/profile')}>
            <Settings className="w-4 h-4" /> Editar perfil
          </Button>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
            <span className="ml-2 text-xs text-muted-foreground">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'listas' && (
        baglists.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Aún no tienes listas. ¡Crea una!' : 'Este usuario no tiene listas públicas aún'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {baglists.map(b => <BagListCard key={b.id} baglist={b} onUpdate={updateBaglist} />)}
          </div>
        )
      )}

      {activeTab === 'favoritos' && (
        favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Aún no tienes favoritos' : 'Este usuario no tiene favoritos públicos'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(b => <BagListCard key={b.id} baglist={b} onUpdate={(updated) => setFavorites(prev => prev.map(f => f.id === updated.id ? updated : f))} />)}
          </div>
        )
      )}
    </div>
  );
}