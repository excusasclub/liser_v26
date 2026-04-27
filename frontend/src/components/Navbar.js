import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Plus, Compass, Bookmark, LayoutDashboard, LogOut, User, Settings, Sun, Moon, BarChart2, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav data-testid="navbar" className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" data-testid="nav-logo" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center neon-glow">
                  <span className="text-white font-bold text-sm font-['Outfit']">L</span>
                </div>
                <img
                  src="/logo.svg"
                  alt="Liser"
                  className="h-6 w-auto"
                  style={{ filter: 'var(--logo-filter)' }}
                />
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link to="/explore" data-testid="nav-explore">
                  <Button variant={isActive('/explore') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                    <Compass className="w-4 h-4" /> Explorar
                  </Button>
                </Link>
                {user && (
                  <>
                    <Link to="/dashboard" data-testid="nav-dashboard">
                      <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Mis BagLists
                      </Button>
                    </Link>
                    <Link to="/saved" data-testid="nav-saved">
                      <Button variant={isActive('/saved') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <Bookmark className="w-4 h-4" /> Guardados
                      </Button>
                    </Link>
                    <Link to="/analytics" data-testid="nav-analytics">
                      <Button variant={isActive('/analytics') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                        <BarChart2 className="w-4 h-4" /> Analíticas
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin">
                        <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                          <ShieldAlert className="w-4 h-4" /> Admin
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} title="Cambiar tema">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  <Link to="/create" data-testid="nav-create">
                    <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 neon-glow">
                      <Plus className="w-4 h-4" /> Nueva BagList
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild data-testid="nav-user-menu">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url} alt={user.display_name} />
                          <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                            {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                      <DropdownMenuItem data-testid="menu-profile" onClick={() => navigate(`/user/${user.username}`)} className="cursor-pointer gap-2">
                        <User className="w-4 h-4" /> Mi Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings/profile')} className="cursor-pointer gap-2">
                        <Settings className="w-4 h-4" /> Editar Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer gap-2 md:hidden">
                        <LayoutDashboard className="w-4 h-4" /> Mis Listas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/saved')} className="cursor-pointer gap-2 md:hidden">
                        <Bookmark className="w-4 h-4" /> Guardados
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-testid="menu-logout" onClick={logout} className="cursor-pointer gap-2 text-destructive">
                        <LogOut className="w-4 h-4" /> Cerrar Sesion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/auth" data-testid="nav-login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 neon-glow">
                    Iniciar Sesion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Barra navegación móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/explore" className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/explore') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Compass className="w-5 h-5" />
            <span className="text-xs">Explorar</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-xs">Mis BagLists</span>
              </Link>
              <Link to="/create" className="flex flex-col items-center gap-1 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
              </Link>
              <Link to="/saved" className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/saved') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Bookmark className="w-5 h-5" />
                <span className="text-xs">Guardados</span>
              </Link>
              <Link to="/analytics" className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'}`}>
                <BarChart2 className="w-5 h-5" />
                <span className="text-xs">Analíticas</span>
              </Link>
              <Link to={`/user/${user.username}`} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive(`/user/${user.username}`) ? 'text-primary' : 'text-muted-foreground'}`}>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user.avatar_url} alt={user.display_name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">Perfil</span>
              </Link>
            </>
          ) : (
            <Link to="/auth" className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="text-xs">Entrar</span>
            </Link>
          )}
          <button onClick={toggleTheme} className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-xs">Tema</span>
          </button>
        </div>
      </div>
    </>
  );
}
