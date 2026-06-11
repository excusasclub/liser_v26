import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft } from 'lucide-react';
import api from '../lib/api';
import { BagListCard } from '@/components/BagListCard';
import { toast } from 'sonner';

export default function CategoryPage() {
    const { slug } = useParams();

    const [baglists, setBaglists] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    decodeURIComponent(slug).charAt(0).toUpperCase() +
        decodeURIComponent(slug).slice(1);

    useEffect(() => {
        fetchBaglists();
    }, [slug]);

    const fetchBaglists = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                category,
                limit: '50',
            });

            const res = await api.get(`/baglists?${params}`);

            setBaglists(res.data.baglists);
        } catch {
            toast.error('Error al cargar las listas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/explore')}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Explorar
                </button>
                <h1 className="text-3xl font-bold font-['Outfit'] capitalize mb-2">
                    {category}
                </h1>

                <p className="text-muted-foreground">
                    BagLists de la categoría {category}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {baglists.filter(b => b).map(b => (
                        <BagListCard
                            key={b.id}
                            baglist={b}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}