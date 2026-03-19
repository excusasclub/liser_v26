import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Plus, X, Package, GripVertical, Trash2, Save, ArrowLeft, Loader2, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function CreateBagListPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', cover_image_url: '', tags: [], is_public: true
  });
  const [tagInput, setTagInput] = useState('');
  const [products, setProducts] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', image_url: '', price: '', currency: 'EUR', link: '', description: '', discount_code: '', custom_fields: []
  });

  useEffect(() => {
    axios.get(`${API}/categories`).then(res => setCategories(res.data));
    if (isEditing) {
      setLoading(true);
      axios.get(`${API}/baglists/${id}`, { headers: getAuthHeaders() })
        .then(res => {
          const b = res.data;
          setForm({ title: b.title, description: b.description, category: b.category, cover_image_url: b.cover_image_url, tags: b.tags || [], is_public: b.is_public });
          setProducts(b.products || []);
        })
        .catch(() => toast.error('Error al cargar'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSaveBagList = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API}/baglists/${id}`, form, { headers: getAuthHeaders() });
        toast.success('Lista actualizada');
      } else {
        const res = await axios.post(`${API}/baglists`, form, { headers: getAuthHeaders() });
        toast.success('Lista creada');
        navigate(`/edit/${res.data.id}`);
        return;
      }
    } catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
    finally { setSaving(false); }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm({ ...form, tags: form.tags.filter(t => t !== tag) });

  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ name: product.name, image_url: product.image_url, price: String(product.price || ''), currency: product.currency || 'EUR', link: product.link, description: product.description, discount_code: product.discount_code || '', custom_fields: product.custom_fields || [] });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', image_url: '', price: '', currency: 'EUR', link: '', description: '', discount_code: '', custom_fields: [] });
    }
    setShowProductDialog(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!isEditing) { toast.error('Guarda la lista primero'); return; }
    try {
      const payload = { ...productForm, price: parseFloat(productForm.price) || 0 };
      if (editingProduct) {
        const res = await axios.put(`${API}/baglists/${id}/products/${editingProduct.id}`, payload, { headers: getAuthHeaders() });
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
        toast.success('Producto actualizado');
      } else {
        const res = await axios.post(`${API}/baglists/${id}/products`, payload, { headers: getAuthHeaders() });
        setProducts(prev => [...prev, res.data]);
        toast.success('Producto agregado');
      }
      setShowProductDialog(false);
    } catch { toast.error('Error al guardar producto'); }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API}/baglists/${id}/products/${productId}`, { headers: getAuthHeaders() });
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Producto eliminado');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="create-baglist-page">
      <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Volver
      </Button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] text-foreground">
          {isEditing ? 'Editar BagList' : 'Nueva BagList'}
        </h1>
        <Button onClick={handleSaveBagList} disabled={saving} data-testid="save-baglist-btn"
          className="bg-primary hover:bg-primary/90 neon-glow gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Lista'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="font-['Outfit']">Información General</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input data-testid="baglist-title-input" placeholder="Mis productos favoritos" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea data-testid="baglist-description-input" placeholder="Describe tu lista..." rows={3}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger data-testid="baglist-category-select"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibilidad</Label>
                  <Select value={form.is_public ? 'public' : 'private'} onValueChange={(v) => setForm({ ...form, is_public: v === 'public' })}>
                    <SelectTrigger data-testid="baglist-visibility-select"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="public">Publica</SelectItem>
                      <SelectItem value="private">Privada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          {isEditing && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-['Outfit']">Productos ({products.length})</CardTitle>
                <Button size="sm" onClick={() => openProductDialog()} data-testid="add-product-btn"
                  className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Agregar
                </Button>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-lg">
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Agrega productos a tu lista</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((p, i) => (
                      <div key={p.id} data-testid={`product-item-${p.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/20 transition-colors">
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/30" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          {p.price > 0 && <p className="text-xs text-secondary">{p.currency === 'EUR' ? `${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : `${p.currency} ${p.price.toFixed(2)}`}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openProductDialog(p)}>
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7" data-testid={`delete-product-${p.id}`}
                            onClick={() => deleteProduct(p.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="font-['Outfit'] text-base">Imagen de Portada</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input data-testid="cover-image-input" placeholder="https://ejemplo.com/imagen.jpg" value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
              {form.cover_image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader><CardTitle className="font-['Outfit'] text-base">Etiquetas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input data-testid="tag-input" placeholder="Agregar etiqueta" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button variant="outline" size="sm" onClick={addTag} data-testid="add-tag-btn">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Outfit']">{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
            <DialogDescription>Completa la información del producto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input data-testid="product-name-input" value={productForm.name} placeholder="Nombre del producto"
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>URL de Imagen</Label>
              <Input data-testid="product-image-input" value={productForm.image_url} placeholder="https://..."
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input data-testid="product-price-input" type="number" step="0.01" value={productForm.price} placeholder="0.00"
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select value={productForm.currency} onValueChange={(v) => setProductForm({ ...productForm, currency: v })}>
                  <SelectTrigger data-testid="product-currency-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="COP">COP</SelectItem>
                      <SelectItem value="ARS">ARS</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enlace del Producto</Label>
              <Input data-testid="product-link-input" value={productForm.link} placeholder="https://..."
                onChange={(e) => setProductForm({ ...productForm, link: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea data-testid="product-description-input" rows={2} value={productForm.description} placeholder="Descripción breve..."
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Código de descuento</Label>
              <Input data-testid="product-discount-input" value={productForm.discount_code} placeholder="Ej: VERANO20"
                onChange={(e) => setProductForm({ ...productForm, discount_code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-2">
              <Label>Campos personalizados</Label>
              {(productForm.custom_fields || []).map((field, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input placeholder="Nombre (ej: Peso)" value={field.key}
                    onChange={(e) => {
                      const updated = [...productForm.custom_fields];
                      updated[idx].key = e.target.value;
                      setProductForm({ ...productForm, custom_fields: updated });
                    }} />
                  <Input placeholder="Valor (ej: 1.2kg)" value={field.value}
                    onChange={(e) => {
                      const updated = [...productForm.custom_fields];
                      updated[idx].value = e.target.value;
                      setProductForm({ ...productForm, custom_fields: updated });
                    }} />
                  <Button variant="ghost" size="icon" onClick={() => {
                    setProductForm({ ...productForm, custom_fields: productForm.custom_fields.filter((_, i) => i !== idx) });
                  }}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" type="button" className="gap-2 w-full"
                onClick={() => setProductForm({ ...productForm, custom_fields: [...(productForm.custom_fields || []), { key: '', value: '' }] })}>
                <Plus className="w-4 h-4" /> Añadir campo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancelar</Button>
            <Button onClick={saveProduct} data-testid="save-product-btn" className="bg-primary hover:bg-primary/90">
              {editingProduct ? 'Guardar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
