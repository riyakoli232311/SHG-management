// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  /** If true, also requires SHG to be set up (onboarded) */
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const { user, onboarded, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireOnboarding && !onboarded) return <Navigate to="/setup" replace />;

  return <>{children}</>;
}