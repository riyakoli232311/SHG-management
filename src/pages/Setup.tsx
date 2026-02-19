// src/pages/Setup.tsx
// Shown once after signup to collect SHG details.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shgApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';

export default function Setup() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    registration_number: '',
    village: '',
    block: '',
    district: '',
    state: 'Rajasthan',
    formation_date: '',
    bank_name: '',
    bank_account: '',
    ifsc: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error('SHG name is required');
    setLoading(true);
    try {
      await shgApi.setup(form);
      await refreshUser();
      toast.success('SHG profile created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE4EC] to-[#EDE7F6] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-6 text-white text-center">
          <HeartHandshake className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">Set Up Your SHG</h1>
          <p className="text-white/80 text-sm">Enter your group details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>SHG Name *</Label>
              <Input placeholder="e.g. Asha Mahila Mandal" value={form.name} onChange={set('name')} required />
            </div>
            <div className="space-y-1">
              <Label>Registration Number</Label>
              <Input placeholder="Reg. no." value={form.registration_number} onChange={set('registration_number')} />
            </div>
            <div className="space-y-1">
              <Label>Formation Date</Label>
              <Input type="date" value={form.formation_date} onChange={set('formation_date')} />
            </div>
            <div className="space-y-1">
              <Label>Village</Label>
              <Input placeholder="Village name" value={form.village} onChange={set('village')} />
            </div>
            <div className="space-y-1">
              <Label>Block</Label>
              <Input placeholder="Block" value={form.block} onChange={set('block')} />
            </div>
            <div className="space-y-1">
              <Label>District</Label>
              <Input placeholder="District" value={form.district} onChange={set('district')} />
            </div>
            <div className="space-y-1">
              <Label>State</Label>
              <Input value={form.state} onChange={set('state')} />
            </div>
            <div className="col-span-2 border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Bank Details (optional)</p>
            </div>
            <div className="space-y-1">
              <Label>Bank Name</Label>
              <Input placeholder="Bank name" value={form.bank_name} onChange={set('bank_name')} />
            </div>
            <div className="space-y-1">
              <Label>Account Number</Label>
              <Input placeholder="Account no." value={form.bank_account} onChange={set('bank_account')} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>IFSC Code</Label>
              <Input placeholder="IFSC" value={form.ifsc} onChange={set('ifsc')} />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C2185B] hover:bg-[#AD1457] text-white"
            disabled={loading}
          >
            {loading ? 'Creating SHG...' : 'Create SHG Profile →'}
          </Button>
        </form>
      </div>
    </div>
  );
}