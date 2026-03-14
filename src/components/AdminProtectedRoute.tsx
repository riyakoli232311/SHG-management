// src/components/AdminProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface Props {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: Props) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600/30 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Admin Context...</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
