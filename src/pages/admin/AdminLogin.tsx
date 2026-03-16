// src/pages/admin/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE4EC] to-[#EDE7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-8 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">System Admin</h1>
          <p className="text-white/80 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-700">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            New Admin? <Link to="/admin/signup" className="text-[#C2185B] hover:underline font-medium">Register here</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Return to <Link to="/" className="text-gray-500 hover:text-gray-700 hover:underline">Public Portal</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
