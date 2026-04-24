import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        if (token) {
            loginWithToken(token);
            navigate('/dashboard');
        } else {
            navigate('/auth?error=' + (error || 'google_failed'));
        }
    }, []);

    return null;
}