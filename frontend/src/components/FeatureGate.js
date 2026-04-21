import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const PLAN_HIERARCHY = ['free', 'pro', 'premium'];

function canAccess(userPlan, requiredPlan) {
    if (!requiredPlan) return true;
    return PLAN_HIERARCHY.indexOf(userPlan || 'free') >= PLAN_HIERARCHY.indexOf(requiredPlan);
}

const FEATURE_PLANS = {
    analytics: 'pro',
    custom_fields: 'pro',
    social_links: 'pro',
    private_lists: 'pro',
    unlimited_lists: 'premium',
};

export function FeatureGate({ feature, fallback = null, children }) {
    const { user } = useAuth();
    const userPlan = user?.plan || 'free';
    const requiredPlan = FEATURE_PLANS[feature];

    if (!canAccess(userPlan, requiredPlan)) {
        return fallback || (
            <div className="text-center py-6 px-4 border border-dashed border-primary/30 rounded-xl bg-primary/5">
                <Lock className="w-6 h-6 text-primary/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                    Esta función requiere el plan <strong className="text-foreground">{requiredPlan}</strong>.
                </p>
                <Button size="sm" className="bg-primary hover:bg-primary/90">Mejorar plan</Button>
            </div>
        );
    }

    return children;
}

export { canAccess, PLAN_HIERARCHY };