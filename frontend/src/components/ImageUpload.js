import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export function ImageUpload({ value, onChange, placeholder = "Subir imagen", className = "" }) {
    const { getAuthHeaders, API } = useAuth();
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            toast.error('Formato no permitido. Usa JPG, PNG, WEBP o GIF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar 5MB');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${API}/upload/image`, formData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
            });
            onChange(res.data.url);
            toast.success('Imagen subida correctamente');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="gap-2"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Subiendo...' : placeholder}
                </Button>
                {value && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} className="gap-2 text-muted-foreground">
                        <X className="w-4 h-4" /> Quitar
                    </Button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {value && (
                <img src={value} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-border/50" />
            )}
        </div>
    );
}