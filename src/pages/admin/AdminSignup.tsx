import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    state: '',
    district: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success('Admin account created successfully');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Admin signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE4EC] to-[#EDE7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 my-8">
        <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-8 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Registration</h1>
          <p className="text-white/80 text-sm mt-1">Create an account for your district</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <Input
                id="name"
                placeholder="Riya Koli"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone_number" className="text-gray-700">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-700">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="state" className="text-gray-700">State</Label>
              <Input
                id="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="district" className="text-gray-700">District Assigned</Label>
              <Input
                id="district"
                placeholder="Pune"
                value={formData.district}
                onChange={handleChange}
                required
                className="bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white shadow-md transition-all mt-4"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/admin/login" className="text-[#C2185B] hover:underline font-medium">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
