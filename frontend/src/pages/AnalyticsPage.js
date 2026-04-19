import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, MousePointerClick, Package, ChevronDown, ChevronUp, Heart, Bookmark, Bell, Copy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MONTH_NAMES = { '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic' };

function MonthlyChart({ data }) {
    if (!data || data.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">Sin datos mensuales aún.</p>;
    const max = Math.max(...data.map(d => d.clicks), 1);
    return (
        <div className="flex items-end gap-2 h-24 mt-2">
            {data.map(d => {
                const [year, month] = d.month.split('-');
                return (
                    <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">{d.clicks}</span>
                        <div className="w-full bg-primary/20 rounded-t" style={{ height: `${Math.max((d.clicks / max) * 64, 4)}px` }}>
                            <div className="w-full h-full bg-primary rounded-t opacity-80" />
                        </div>
                        <span className="text-xs text-muted-foreground">{MONTH_NAMES[month]}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AnalyticsPage() {
    const { getAuthHeaders, API } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [baglistDetail, setBaglistDetail] = useState({});

    useEffect(() => {
        axios.get(`${API}/users/me/analytics`, { headers: getAuthHeaders() })
            .then(res => setData(res.data))
            .catch(() => toast.error('Error al cargar analíticas'))
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = async (baglistId) => {
        if (expanded === baglistId) { setExpanded(null); return; }
        setExpanded(baglistId);
        if (!baglistDetail[baglistId]) {
            try {
                const res = await axios.get(`${API}/baglists/${baglistId}/analytics`, { headers: getAuthHeaders() });
                setBaglistDetail(prev => ({ ...prev, [baglistId]: res.data }));
            } catch { toast.error('Error al cargar detalle'); }
        }
    };

    if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-['Outfit'] text-foreground flex items-center gap-3">
                    <BarChart2 className="w-7 h-7 text-primary" /> Analíticas
                </h1>
                <p className="text-muted-foreground mt-1">Rendimiento de tus BagLists</p>
            </div>

            <Card className="border-border/50 mb-4">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MousePointerClick className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-foreground">{data?.total_clicks || 0}</p>
                            <p className="text-sm text-muted-foreground">Clics totales en enlaces de afiliado</p>
                        </div>
                    </div>
                    <MonthlyChart data={data?.monthly_clicks} />
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
                {data?.baglists?.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-border/50 rounded-xl">
                        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Aún no hay datos de clics</p>
                    </div>
                )}
                {data?.baglists?.map(b => (
                    <Card key={b.id} className="border-border/50 overflow-hidden">
                        <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleExpand(b.id)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <CardTitle className="text-base font-['Outfit']">{b.title}</CardTitle>
                                    <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                        <MousePointerClick className="w-3 h-3 mr-1" />{b.clicks}
                                    </Badge>
                                </div>
                                {expanded === b.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {expanded === b.id && baglistDetail[b.id] && (
                            <CardContent className="px-5 pb-5 pt-0">
                                <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-border/50">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Heart className="w-4 h-4 text-red-400" /> {baglistDetail[b.id].favorites_count} favoritos
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Bookmark className="w-4 h-4 text-primary" /> {baglistDetail[b.id].saves_count} guardados
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Bell className="w-4 h-4 text-yellow-400" /> {baglistDetail[b.id].followers} seguidores
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Copy className="w-4 h-4 text-green-400" /> {baglistDetail[b.id].total_discount_clicks} copias de código
                                    </div>
                                </div>
                                <MonthlyChart data={baglistDetail[b.id].monthly_clicks} />
                                <div className="flex flex-col gap-2 mt-4">
                                    {baglistDetail[b.id].products.map((p, idx) => (
                                        <div key={p.id} className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                                            {p.image_url
                                                ? <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover rounded" />
                                                : <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><Package className="w-3.5 h-3.5 text-muted-foreground/30" /></div>
                                            }
                                            <span className="flex-1 text-sm text-foreground truncate">{p.name}</span>
                                            <div className="flex items-center gap-2">
                                                {p.discount_clicks > 0 && (
                                                    <Badge variant="outline" className="text-xs border-border/50 text-green-400">
                                                        <Copy className="w-3 h-3 mr-1" />{p.discount_clicks}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs border-border/50">
                                                    <MousePointerClick className="w-3 h-3 mr-1" />{p.clicks}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}