import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Layers, Heart, Bookmark, Package, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [baglists, setBaglists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMyBaglists = async () => {
    try {
      const res = await api.get('/baglists/my');
      setBaglists(res.data);
    } catch { toast.error('Error al cargar listas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyBaglists(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/baglists/${deleteId}`);
      setBaglists(prev => prev.filter(b => b.id !== deleteId));
      toast.success('Lista eliminada');
    } catch { toast.error('Error al eliminar'); }
    setDeleteId(null);
  };

  const toggleVisibility = async (baglist) => {
    try {
      const res = await api.put(`/baglists/${baglist.id}`, { is_public: !baglist.is_public });
      setBaglists(prev => prev.map(b => b.id === baglist.id ? res.data : b));
      toast.success(res.data.is_public ? 'Lista publica' : 'Lista privada');
    } catch { toast.error('Error'); }
  };

  const totalProducts = baglists.reduce((acc, b) => acc + (b.products?.length || 0), 0);
  const totalFavorites = baglists.reduce((acc, b) => acc + (b.favorites_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-foreground">Mis BagLists</h1>
          <p className="text-muted-foreground mt-1">Administra y organiza tus BagLists</p>
        </div>
        <Link to="/create" data-testid="dashboard-create-btn">
          <Button className="bg-primary hover:bg-primary/90 neon-glow gap-2">
            <Plus className="w-4 h-4" /> Nueva BagList
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Layers, label: 'Listas', value: baglists.length, color: 'text-primary' },
          { icon: Package, label: 'Productos', value: totalProducts, color: 'text-secondary' },
          { icon: Heart, label: 'Favoritos', value: totalFavorites, color: 'text-accent' },
          { icon: Bookmark, label: 'Públicas', value: baglists.filter(b => b.is_public).length, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-['Outfit']">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </div>
        ))}
      </div>

      <Separator className="mb-8" />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : baglists.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground font-['Outfit'] mb-2">Sin BagLists aún</h3>
          <p className="text-muted-foreground mb-6">Crea tu primera BagList para empezar a organizar productos.</p>
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary/90 neon-glow gap-2">
              <Plus className="w-4 h-4" /> Crear BagList
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {baglists.map(b => (
            <div key={b.id} className="relative group">
              <Link to={`/edit/${b.id}`} className="block">
                <BagListCard baglist={b} onUpdate={(updated) => setBaglists(prev => prev.map(x => x.id === updated.id ? updated : x))} />
              </Link>
              <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Link to={`/edit/${b.id}`}>
                  <Button variant="ghost" size="icon" data-testid={`edit-btn-${b.id}`}
                    className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" data-testid={`visibility-btn-${b.id}`}
                  onClick={(e) => { e.preventDefault(); toggleVisibility(b); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80">
                  {b.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" data-testid={`delete-btn-${b.id}`}
                  onClick={(e) => { e.preventDefault(); setDeleteId(b.id); }}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-red-400 hover:bg-red-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Eliminar BagList</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer. Se eliminarán todos los productos de esta BagList.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} data-testid="cancel-delete-btn">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} data-testid="confirm-delete-btn">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
