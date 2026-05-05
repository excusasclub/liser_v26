import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, Loader2, Package, X } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ExplorePage() {
  const { user } = useAuth();
  const [CATEGORIES, setCATEGORIES] = useState(["All"]);
  const [baglists, setBaglists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchBaglists();
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);
  useEffect(() => {
    api.get('/categories')
      .then(res => setCATEGORIES(["All", ...res.data]))
      .catch(() => { });
  }, []);

  const fetchBaglists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sort });
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res = await api.get(`/baglists?${params}`);
      setBaglists(res.data.baglists);
      setTotalPages(res.data.pages);
    } catch { toast.error('Error al cargar las listas'); }
    finally { setLoading(false); }
  }, [page, sort, category, search, user]);

  useEffect(() => {
    if (!search) fetchBaglists();
  }, [page, sort, category]);
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBaglists();
  };

  const updateBaglist = (updated) => {
    setBaglists(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="explore-page">
      <Helmet>
        <title>Explorar BagLists — Liser</title>
        <meta name="description" content="Descubre BagLists de productos curadas por la comunidad de Liser" />
        <meta property="og:title" content="Explorar BagLists — Liser" />
        <meta property="og:description" content="Descubre BagLists de productos curadas por la comunidad de Liser" />
      </Helmet>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-foreground mb-2">Explorar BagLists</h1>
        <p className="text-muted-foreground">Descubre BagLists de productos curadas por la comunidad</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input data-testid="explore-search" placeholder="Buscar listas, productos, etiquetas..."
              className="pl-10 pr-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setSearch(''); setPage(1); }}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </form>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger data-testid="explore-sort-filter" className="w-[130px] shrink-0"><SelectValue placeholder="Ordenar" /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest">Recientes</SelectItem>
              <SelectItem value="popular">Populares</SelectItem>
              <SelectItem value="oldest">Antiguos</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c}
              data-testid={`category-chip-${c}`}
              onClick={() => { setCategory(c); setPage(1); }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
            >
              {c === 'All' ? 'Todas' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Active search filter */}
      {search && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Buscando:</span>
          <Badge variant="secondary" className="gap-1 pr-1">
            "{search}" <button onClick={() => { setSearch(''); setPage(1); }}><X className="w-3 h-3" /></button>
          </Badge>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : baglists.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold font-['Outfit'] text-foreground mb-2">No se encontraron listas</h3>
          <p className="text-muted-foreground">Intenta con otros filtros o terminos de busqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {baglists.map(b => (
              <BagListCard key={b.id} baglist={b} onUpdate={updateBaglist} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-testid="prev-page-btn">
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-testid="next-page-btn">
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
