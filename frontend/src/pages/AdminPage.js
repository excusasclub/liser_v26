import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, LayoutList, BarChart2, CreditCard, Settings, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';

const PLAN_COLORS = { free: 'secondary', pro: 'default', premium: 'destructive' };

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [section, setSection] = useState('analiticas');

    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);

    const [baglists, setBaglists] = useState([]);
    const [baglistSearch, setBaglistSearch] = useState('');
    const [baglistTotal, setBaglistTotal] = useState(0);
    const [baglistPage, setBaglistPage] = useState(1);

    const [analytics, setAnalytics] = useState(null);
    const [billing, setBilling] = useState(null);
    const [system, setSystem] = useState(null);

    const [emails, setEmails] = useState([]);
    const [emailTotal, setEmailTotal] = useState(0);
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastHtml, setBroadcastHtml] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    useEffect(() => {
        if (section === 'usuarios') loadUsers();
        if (section === 'baglists') loadBaglists();
        if (section === 'analiticas') loadAnalytics();
        if (section === 'facturacion') loadBilling();
        if (section === 'sistema') loadSystem();
        if (section === 'emails') loadEmails();
    }, [section]);

    async function loadUsers(search = userSearch, page = userPage) {
        const params = new URLSearchParams({ page, limit: 50 });
        if (search) params.set('search', search);
        const res = await api.get(`/admin/users?${params}`);
        setUsers(res.data.users);
        setUserTotal(res.data.total);
    }

    async function loadBaglists(search = baglistSearch, page = baglistPage) {
        const params = new URLSearchParams({ page, limit: 50 });
        if (search) params.set('search', search);
        const res = await api.get(`/admin/baglists?${params}`);
        setBaglists(res.data.baglists);
        setBaglistTotal(res.data.total);
    }

    async function loadAnalytics() {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
    }

    async function loadBilling() {
        const res = await api.get('/admin/billing');
        setBilling(res.data);
    }

    async function loadSystem() {
        const res = await api.get('/admin/system');
        setSystem(res.data);
    }

    async function loadEmails() {
        const res = await api.get('/admin/emails?limit=50');
        setEmails(res.data.emails);
        setEmailTotal(res.data.total);
    }

    async function resendWelcome(userId) {
        await api.post(`/admin/emails/resend-welcome/${userId}`);
        toast.success('Email de bienvenida enviado');
    }

    async function notifyFollowers(baglistId) {
        const res = await api.post(`/admin/emails/notify-followers/${baglistId}`);
        toast.success(`Enviado a ${res.data.sent} followers`);
    }

    async function sendBroadcast() {
        if (!broadcastSubject || !broadcastHtml) { toast.error('Completa subject y contenido'); return; }
        if (!window.confirm('¿Enviar a todos los usuarios?')) return;
        const res = await api.post('/admin/emails/broadcast', { subject: broadcastSubject, html: broadcastHtml });
        toast.success(`Enviado a ${res.data.sent} usuarios`);
        setBroadcastSubject('');
        setBroadcastHtml('');
    }

    async function setPlan(userId, plan) {
        await api.patch(`/admin/users/${userId}/plan`, { plan });
        loadUsers();
    }

    async function setSuspended(userId, suspended) {
        await api.patch(`/admin/users/${userId}/suspend`, { suspended });
        loadUsers();
    }

    async function setFeatured(baglistId, featured) {
        await api.patch(`/admin/baglists/${baglistId}/featured`, { featured });
        loadBaglists();
    }

    async function deleteBaglist(baglistId) {
        if (!window.confirm('¿Eliminar esta BagList?')) return;
        await api.delete(`/admin/baglists/${baglistId}`);
        loadBaglists();
    }

    async function exportCSV() {
        const res = await api.get('/admin/billing/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'facturacion.csv';
        a.click();
    }

    const navItems = [
        { key: 'analiticas', label: 'Analíticas', icon: BarChart2 },
        { key: 'usuarios', label: 'Usuarios', icon: Users },
        { key: 'baglists', label: 'BagLists', icon: LayoutList },
        { key: 'emails', label: 'Emails', icon: Mail },
        { key: 'facturacion', label: 'Facturación', icon: CreditCard },
        { key: 'sistema', label: 'Sistema', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold font-['Outfit']">Backoffice</h1>
                </div>

                <div className="flex gap-2 mb-8 flex-wrap">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <Button key={key} variant={section === key ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setSection(key)}>
                            <Icon className="w-4 h-4" /> {label}
                        </Button>
                    ))}
                </div>

                {/* ANALÍTICAS */}
                {section === 'analiticas' && analytics && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Usuarios totales', value: analytics.total_users },
                                { label: 'Nuevos hoy', value: analytics.new_users_today },
                                { label: 'Clics totales', value: analytics.total_clicks },
                                { label: 'Emails capturados', value: analytics.total_followers },
                                { label: 'BagLists públicas', value: analytics.public_baglists },
                                { label: 'BagLists totales', value: analytics.total_baglists },
                                { label: 'Listas inactivas +30d', value: analytics.inactive_baglists },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-lg border border-border bg-card p-4">
                                    <div className="text-2xl font-bold text-primary">{value}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold mb-3 text-sm">Usuarios nuevos — últimos 7 días</h3>
                            <div className="flex items-end gap-2 h-20">
                                {analytics.users_per_day.map(({ date, count }) => {
                                    const max = Math.max(...analytics.users_per_day.map(d => d.count), 1);
                                    return (
                                        <div key={date} className="flex flex-col items-center gap-1 flex-1">
                                            <div className="w-full bg-primary rounded-sm" style={{ height: `${(count / max) * 64}px`, minHeight: count > 0 ? '4px' : '0' }} />
                                            <span className="text-xs text-muted-foreground">{date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold mb-3 text-sm">Clics por categoría</h3>
                            <table className="w-full text-sm">
                                <thead><tr className="text-muted-foreground text-left"><th className="pb-2">Categoría</th><th className="pb-2">BagLists</th><th className="pb-2">Clics</th></tr></thead>
                                <tbody>
                                    {analytics.categories.map(c => (
                                        <tr key={c.category} className="border-t border-border/50">
                                            <td className="py-1.5">{c.category}</td>
                                            <td className="py-1.5 text-muted-foreground">{c.count}</td>
                                            <td className="py-1.5 font-medium">{c.clicks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* USUARIOS */}
                {section === 'usuarios' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Buscar por email o username..." value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers(userSearch, 1)} className="max-w-sm" />
                            <Button variant="outline" size="sm" onClick={() => loadUsers(userSearch, 1)}>Buscar</Button>
                        </div>
                        <div className="text-xs text-muted-foreground">{userTotal} usuarios</div>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-4 py-2">Usuario</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Plan</th>
                                        <th className="px-4 py-2">Estado</th>
                                        <th className="px-4 py-2">Registro</th>
                                        <th className="px-4 py-2">Último login</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-t border-border/50 hover:bg-muted/20">
                                            <td className="px-4 py-2 font-medium">{u.username}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-2"><Badge variant={PLAN_COLORS[u.plan] || 'secondary'}>{u.plan}</Badge></td>
                                            <td className="px-4 py-2">{u.suspended ? <Badge variant="destructive">Suspendido</Badge> : <Badge variant="outline">Activo</Badge>}</td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">{u.created_at?.slice(0, 10)}</td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">{u.last_login?.slice(0, 10) || '—'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-1 flex-wrap">
                                                    {['free', 'pro', 'premium'].filter(p => p !== u.plan).map(p => (
                                                        <Button key={p} size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setPlan(u.id, p)}>{p}</Button>
                                                    ))}
                                                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => resendWelcome(u.id)}>✉</Button>
                                                    <Button size="sm" variant={u.suspended ? 'default' : 'destructive'} className="h-6 text-xs px-2" onClick={() => setSuspended(u.id, !u.suspended)}>
                                                        {u.suspended ? 'Reactivar' : 'Suspender'}
                                                    </Button>
                                                    <Button size="sm" variant="destructive" className="h-6 text-xs px-2" onClick={async () => { if (!window.confirm(`¿Eliminar usuario ${u.username}?`)) return; await api.delete(`/admin/users/${u.id}`); loadUsers(); }}>Eliminar</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BAGLISTS */}
                {section === 'baglists' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Buscar por título..." value={baglistSearch} onChange={e => setBaglistSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadBaglists(baglistSearch, 1)} className="max-w-sm" />
                            <Button variant="outline" size="sm" onClick={() => loadBaglists(baglistSearch, 1)}>Buscar</Button>
                        </div>
                        <div className="text-xs text-muted-foreground">{baglistTotal} BagLists</div>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-4 py-2">Título</th>
                                        <th className="px-4 py-2">Usuario</th>
                                        <th className="px-4 py-2">Categoría</th>
                                        <th className="px-4 py-2">Clics</th>
                                        <th className="px-4 py-2">Pública</th>
                                        <th className="px-4 py-2">Destacada</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {baglists.map(b => (
                                        <tr key={b.id} className="border-t border-border/50 hover:bg-muted/20">
                                            <td className="px-4 py-2 font-medium max-w-xs truncate">{b.title}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{b.username}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{b.category}</td>
                                            <td className="px-4 py-2">{b.total_clicks || 0}</td>
                                            <td className="px-4 py-2">{b.is_public ? '✓' : '—'}</td>
                                            <td className="px-4 py-2">{b.featured ? '★' : '—'}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setFeatured(b.id, !b.featured)}>{b.featured ? 'Quitar destacada' : 'Destacar'}</Button>
                                                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => notifyFollowers(b.id)}>Notificar</Button>
                                                    <Button size="sm" variant="destructive" className="h-6 text-xs px-2" onClick={() => deleteBaglist(b.id)}>Eliminar</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* EMAILS */}
                {section === 'emails' && (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold mb-3 text-sm">Broadcast a todos los usuarios</h3>
                            <div className="space-y-3">
                                <Input placeholder="Asunto" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} />
                                <textarea
                                    placeholder="HTML del email..."
                                    value={broadcastHtml}
                                    onChange={e => setBroadcastHtml(e.target.value)}
                                    className="w-full h-32 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground resize-none"
                                />
                                <Button size="sm" onClick={sendBroadcast} className="gap-2"><Mail className="w-4 h-4" /> Enviar broadcast</Button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Log de emails ({emailTotal})</h3>
                                <Button size="sm" variant="outline" onClick={loadEmails}>Actualizar</Button>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-4 py-2">Destinatario</th>
                                        <th className="px-4 py-2">Tipo</th>
                                        <th className="px-4 py-2">Asunto</th>
                                        <th className="px-4 py-2">Estado</th>
                                        <th className="px-4 py-2">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emails.map(e => (
                                        <tr key={e.id} className="border-t border-border/50 hover:bg-muted/20">
                                            <td className="px-4 py-2 text-muted-foreground">{e.to}</td>
                                            <td className="px-4 py-2"><Badge variant="outline">{e.type}</Badge></td>
                                            <td className="px-4 py-2 max-w-xs truncate">{e.subject}</td>
                                            <td className="px-4 py-2">
                                                <Badge variant={e.status === 'sent' ? 'default' : e.status === 'failed' ? 'destructive' : 'secondary'}>{e.status}</Badge>
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">{e.created_at?.slice(0, 16).replace('T', ' ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FACTURACIÓN */}
                {section === 'facturacion' && billing && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">{billing.total} usuarios de pago</div>
                            <Button size="sm" variant="outline" className="gap-2" onClick={exportCSV}><Download className="w-4 h-4" /> Exportar CSV</Button>
                        </div>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="text-left text-muted-foreground">
                                        <th className="px-4 py-2">Usuario</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Plan</th>
                                        <th className="px-4 py-2">Registro</th>
                                        <th className="px-4 py-2">Último login</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billing.paid_users.map(u => (
                                        <tr key={u.id} className="border-t border-border/50 hover:bg-muted/20">
                                            <td className="px-4 py-2 font-medium">{u.username}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                                            <td className="px-4 py-2"><Badge variant="default">{u.plan}</Badge></td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">{u.created_at?.slice(0, 10)}</td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">{u.last_login?.slice(0, 10) || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SISTEMA */}
                {section === 'sistema' && system && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold mb-3 text-sm">Cloudinary</h3>
                            {system.cloudinary.error
                                ? <p className="text-destructive text-sm">{system.cloudinary.error}</p>
                                : <div className="flex gap-6 text-sm">
                                    <div><span className="text-muted-foreground">Usado: </span><span className="font-medium">{system.cloudinary.used_mb} MB</span></div>
                                    <div><span className="text-muted-foreground">Límite: </span><span className="font-medium">{system.cloudinary.limit_mb} MB</span></div>
                                </div>}
                        </div>
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold mb-3 text-sm">Colecciones MongoDB</h3>
                            <div className="flex gap-4 flex-wrap">
                                {Object.entries(system.collections).map(([col, count]) => (
                                    <div key={col} className="text-sm">
                                        <span className="text-muted-foreground">{col}: </span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}