import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BagListCard } from '@/components/BagListCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.filter(c => c !== 'All').map(category => (
            <Link
              key={category}
              to={`/explore/${encodeURIComponent(category.toLowerCase())}`}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <Folder className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold font-['Outfit']">
                  {category}
                </h3>
              </div>

              <p className="text-muted-foreground text-sm">
                Explorar listas de {category}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}