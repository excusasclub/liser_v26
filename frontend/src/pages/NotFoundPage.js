import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-8xl font-bold font-['Outfit'] text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold font-['Outfit'] text-foreground mb-2">
                Página no encontrada
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                La página que buscas no existe o ha sido eliminada.
            </p>
            <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio
                </Button>
            </Link>
        </div>
    );
}