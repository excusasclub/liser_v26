import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import BagListDetailPage from "@/pages/BagListDetailPage";
import CreateBagListPage from "@/pages/CreateBagListPage";
import ExplorePage from "@/pages/ExplorePage";
import CategoryPage from './pages/CategoryPage';
import SavedPage from "@/pages/SavedPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import EditProfilePage from '@/pages/EditProfilePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AdminPage from '@/pages/AdminPage';
import LegalPage from '@/pages/LegalPage';
import PricingPage from '@/pages/PricingPage';
import ContactPage from '@/pages/ContactPage';
import { Footer } from '@/components/Footer';
import api from '@/lib/api';
import { toast } from 'sonner';
import GoogleCallbackPage from '@/pages/GoogleCallbackPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ChooseUsernamePage from '@/pages/ChooseUsernamePage';
import ScrollToTop from '@/components/ScrollToTop';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" />;
}

const PLAN_HIERARCHY = ['free', 'pro', 'premium'];

function PlanRoute({ minPlan, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  const userLevel = PLAN_HIERARCHY.indexOf(user.plan || 'free');
  const requiredLevel = PLAN_HIERARCHY.indexOf(minPlan);
  if (userLevel < requiredLevel) return <Navigate to="/dashboard" />;
  return children;
}

function AppContent() {
  const { user, loading, theme } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      {user && !user.email_verified && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center text-sm text-yellow-600 dark:text-yellow-400">
          Verifica tu email para poder crear BagLists. Revisa tu bandeja de entrada.{' '}
          <button
            className="underline font-medium hover:text-yellow-700 dark:hover:text-yellow-300"
            onClick={async () => {
              try {
                await api.post('/auth/resend-verification');
                toast.success('Email de verificación reenviado');
              } catch {
                toast.error('Error al reenviar. Inténtalo más tarde.');
              }
            }}
          >
            Reenviar email
          </button>
        </div>
      )}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:slug" element={<CategoryPage />} />
        <Route path="/:username/:slug" element={<BagListDetailPage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateBagListPage /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><CreateBagListPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<EditProfilePage />} />
        <Route path="/analytics" element={<PlanRoute minPlan="free"><AnalyticsPage /></PlanRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/auth/google" element={<GoogleCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/choose-username" element={<ChooseUsernamePage />} />
        <Route path="/legal/:page" element={<LegalPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <Toaster theme={theme === 'light' ? 'light' : 'dark'} position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;