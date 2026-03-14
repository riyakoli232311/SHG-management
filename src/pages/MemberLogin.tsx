import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberLogin() {
  const { memberLogin } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await memberLogin(phone, aadhar);
      navigate('/member/loans'); // Redirecting directly to the member loan dashboard
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE4EC] to-[#EDE7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-8 text-white text-center">
          <HeartHandshake className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">SakhiSahyog</h1>
          <p className="text-white/80 text-sm mt-1">Member Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-xl font-semibold text-center text-gray-800">Member Login</h2>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="aadhar">Aadhaar Number</Label>
            <Input
              id="aadhar"
              type="text"
              placeholder="Your 12-digit Aadhaar"
              value={aadhar}
              onChange={e => setAadhar(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white"
            disabled={loading}
          >
            {loading ? 'Accessing...' : 'Log In as Member'}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Are you an SHG Leader?{' '}
            <Link to="/login" className="text-[#C2185B] font-medium hover:underline">
              Leader Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
