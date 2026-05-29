import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // User authenticated successfully
                navigate('/dashboard', { replace: true });
            } else {
                // Authentication failed, redirect to login
                navigate('/login', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-white mt-4">Completing authentication...</p>
            </div>
        </div>
    );
} 