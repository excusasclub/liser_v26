import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, MousePointerClick, Package, ChevronDown, ChevronUp, Heart, Bookmark, Bell, Copy } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MONTH_NAMES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function HeatmapYear({ staticData }) {
    const now = new Date();
    const year = now.getFullYear();
    const dayClicks = {};
    staticData?.forEach(c => { dayClicks[c.date] = c.clicks; });

    const startOfYear = new Date(year, 0, 1);
    const dayOfWeek = startOfYear.getDay();
    const adjustedStart = (dayOfWeek + 6) % 7;
    const endOfYear = new Date(year, 11, 31);
    const totalDays = Math.floor((endOfYear - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const totalCells = adjustedStart + totalDays;
    const weeks = Math.ceil(totalCells / 7);

    const maxClicks = Math.max(...Object.values(dayClicks), 1);
    const getColor = (clicks) => {
        if (!clicks) return 'bg-muted';
        const intensity = clicks / maxClicks;
        if (intensity < 0.25) return 'bg-primary/20';
        if (intensity < 0.5) return 'bg-primary/40';
        if (intensity < 0.75) return 'bg-primary/70';
        return 'bg-primary';
    };

    const cells = [];
    for (let i = 0; i < adjustedStart; i++) cells.push(null);
    for (let d = 0; d < totalDays; d++) {
        const date = new Date(year, 0, 1 + d);
        const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        cells.push({ date: dateStr, day: date.getDate(), month: date.getMonth() });
    }

    return (
        <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">Año {year}</p>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
                {cells.map((cell, i) => {
                    const clicks = cell ? (dayClicks[cell.date] || 0) : 0;
                    return (
                        <div key={i}
                            title={cell ? `${cell.date} — ${clicks} clics` : ''}
                            className={`w-2 h-2 rounded-xs ${cell ? getColor(clicks) : 'bg-transparent'}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
function HeatmapCalendar({ baglistId, staticData }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [dayClicks, setDayClicks] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (staticData) {
            const map = {};
            staticData.forEach(c => { map[c.date] = c.clicks; });
            setDayClicks(map);
            return;
        }
        if (!baglistId) return;
        setLoading(true);
        api.get(`/baglists/${baglistId}/analytics`)
            .then(res => {
                const clicks = res.data.daily_clicks || [];
                const map = {};
                clicks.forEach(c => { map[c.date] = c.clicks; });
                setDayClicks(map);
            })
            .finally(() => setLoading(false));
    }, [baglistId, year, month, staticData]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirst = (firstDay + 6) % 7;
    const maxClicks = Math.max(...Object.values(dayClicks), 1);

    const getColor = (clicks) => {
        if (!clicks) return 'bg-muted';
        const intensity = clicks / maxClicks;
        if (intensity < 0.25) return 'bg-primary/20';
        if (intensity < 0.5) return 'bg-primary/40';
        if (intensity < 0.75) return 'bg-primary/70';
        return 'bg-primary';
    };

    const cells = [];
    for (let i = 0; i < adjustedFirst; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="mt-2">
            <div className="flex items-center gap-2 mb-3">
                <select value={month} onChange={e => setMonth(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-card px-2 text-sm text-foreground">
                    {MONTH_NAMES_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-card px-2 text-sm text-foreground">
                    {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="grid grid-cols-7 gap-1 max-w-[220px]">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="text-xs text-muted-foreground text-center pb-1">{d}</div>
                ))}
                {cells.map((d, i) => {
                    const dateStr = d ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
                    const clicks = dateStr ? (dayClicks[dateStr] || 0) : 0;
                    return (
                        <div key={i}
                            title={d ? `${String(d).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year} — ${clicks} clics` : ''}
                            className={`w-full aspect-square rounded-sm ${d ? getColor(clicks) : 'bg-transparent'}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [baglistDetail, setBaglistDetail] = useState({});

    useEffect(() => {
        api.get('/users/me/analytics')
            .then(res => setData(res.data))
            .catch(() => toast.error('Error al cargar analíticas'))
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = async (baglistId) => {
        if (expanded === baglistId) { setExpanded(null); return; }
        setExpanded(baglistId);
        if (!baglistDetail[baglistId]) {
            try {
                const res = await api.get(`/baglists/${baglistId}/analytics`);
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
                    <HeatmapYear staticData={data?.daily_clicks} />
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
                                <HeatmapCalendar baglistId={b.id} />
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