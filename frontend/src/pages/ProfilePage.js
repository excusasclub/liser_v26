import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Calendar, Layers } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ProfilePage() {
  const { username } = useParams();
  const { user, getAuthHeaders, API } = useAuth();
  const [profile, setProfile] = useState(null);
  const [baglists, setBaglists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = user ? getAuthHeaders() : {};
        const res = await axios.get(`${API}/users/${username}`, { headers });
        setProfile(res.data.user);
        setBaglists(res.data.baglists);
      } catch { toast.error('Usuario no encontrado'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [username, user, getAuthHeaders]);

  const updateBaglist = (updated) => setBaglists(prev => prev.map(b => b.id === updated.id ? updated : b));

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center py-32 text-muted-foreground">Usuario no encontrado</div>;

  const joinDate = new Date(profile.created_at).toLocaleDateString('es', { year: 'numeric', month: 'long' });

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
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="w-20 h-20">
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
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {joinDate}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* BagLists */}
      <h2 className="text-xl font-semibold font-['Outfit'] text-foreground mb-6">BagLists publicas</h2>
      {baglists.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Este usuario no tiene listas publicas aun</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {baglists.map(b => <BagListCard key={b.id} baglist={b} onUpdate={updateBaglist} />)}
        </div>
      )}
    </div>
  );
}
