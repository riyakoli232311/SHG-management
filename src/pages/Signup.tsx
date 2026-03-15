// src/pages/Signup.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Signup() {
  const { signup, memberSignup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'leader' | 'member'>('leader');
  
  // Shared
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Leader Specific
  const [email, setEmail] = useState('');

  // Member Specific
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [district, setDistrict] = useState('');
  const [shgId, setShgId] = useState('');
  const [shgList, setShgList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (role === 'member' && district.length > 2) {
      // Small delay to avoid querying on every keystroke
      const timer = setTimeout(() => {
        authApi.getShgList(district)
          .then(res => setShgList(res.shgs))
          .catch(err => console.error("Failed to fetch SHGs", err));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShgList([]);
      setShgId(''); // reset selected SHG if list clears
    }
  }, [role, district]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      if (role === 'leader') {
        await signup(name, email, password);
        navigate('/setup'); // go to SHG setup
      } else {
        if (!shgId) {
          toast.error("Please select an SHG");
          setLoading(false);
          return;
        }
        await memberSignup(name, phone, aadhar, shgId, password);
        navigate('/member/loans');
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
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
          <p className="text-white/80 text-sm mt-1">Join thousands of empowered women</p>
        </div>

        <div className="p-8 pb-4">
          <Tabs value={role} onValueChange={(v) => setRole(v as 'leader' | 'member')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-pink-50">
              <TabsTrigger value="leader" className="data-[state=active]:bg-[#C2185B] data-[state=active]:text-white">SHG Leader</TabsTrigger>
              <TabsTrigger value="member" className="data-[state=active]:bg-[#C2185B] data-[state=active]:text-white">SHG Member</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <h2 className="text-xl font-semibold text-center text-gray-800">
            {role === 'leader' ? 'Leader Registration' : 'Member Registration'}
          </h2>

          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {role === 'leader' ? (
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="priya@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
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
              <div className="space-y-1">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  type="text"
                  placeholder="e.g. Pune"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Select Self Help Group (SHG)</Label>
                <Select value={shgId} onValueChange={setShgId} disabled={shgList.length === 0} required>
                  <SelectTrigger className="w-full">
                    <SelectValue 
                      placeholder={
                        district.length < 3 
                          ? "Type at least 3 letters of district" 
                          : shgList.length === 0 
                            ? "No SHGs found" 
                            : "Choose your SHG"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {shgList.map(shg => (
                      <SelectItem key={shg.id} value={shg.id}>
                        {shg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white mt-4"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C2185B] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}