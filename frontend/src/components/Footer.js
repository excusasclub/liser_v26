import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background mt-auto py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>© {new Date().getFullYear()} Liser. Todos los derechos reservados.</span>
                <div className="flex gap-4">
                    <Link to="/legal/aviso-legal" className="hover:text-foreground transition-colors">Aviso Legal</Link>
                    <Link to="/legal/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
                    <Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                    <Link to="/pricing" className="hover:text-foreground transition-colors">Planes</Link>
                    <Link to="/contact" className="hover:text-foreground transition-colors">Contacto</Link>
                </div>
            </div>
        </footer>
    );
}