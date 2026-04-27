// src/pages/admin/AdminLogin.tsx — Dark Theme · Inline Login + Register toggle
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ShieldCheck, Eye, EyeOff, HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';
import FeatureDeck from '@/components/FeatureDeck';

// ── Same DarkInput / DLabel as Signup.tsx ─────────────────────────────────
function DarkInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-white/25 outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(194,24,91,0.5)')}
      onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{children}</p>;
}

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  // ── Mode: 'login' | 'register' ───────────────────────────────────────────
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // ── Login state ───────────────────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw,   setShowLoginPw]   = useState(false);
  const [loginLoading,  setLoginLoading]  = useState(false);

  // ── Register state ────────────────────────────────────────────────────────
  const [reg, setReg] = useState({
    name: '', phone_number: '', email: '', password: '', state: '', district: '',
  });
  const [showRegPw,  setShowRegPw]  = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setReg(prev => ({ ...prev, [e.target.id]: e.target.value }));

  // ── Login submit ──────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Admin login failed');
    } finally { setLoginLoading(false); }
  }

  // ── Register submit ───────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (reg.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setRegLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reg),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Signup failed');
      toast.success('Admin account created! Please log in.');
      setMode('login');
      setLoginEmail(reg.email);
    } catch (err: any) {
      toast.error(err.message || 'Admin signup failed');
    } finally { setRegLoading(false); }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg,#07070f 0%,#0a0a12 50%,#0f0520 100%)' }}
    >
      {/* ── LEFT PANEL: Feature Deck ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col px-12 py-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: '#6A1B9A', filter: 'blur(130px)', opacity: 0.13 }} />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: '#C2185B', filter: 'blur(110px)', opacity: 0.09 }} />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#C2185B,#6A1B9A)', boxShadow: '0 0 20px rgba(194,24,91,0.35)' }}>
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-white leading-none">SakhiSahyog</p>
            <p className="text-[10px] text-white/30 font-medium">Empowering Women · Enabling Growth</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10 py-8">
          <div className="w-full max-w-[360px]"><FeatureDeck /></div>
        </div>

        <p className="text-xs text-white/20 font-medium relative z-10">Trusted by 1,200+ SHGs across India</p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch my-8"
        style={{ background: 'linear-gradient(to bottom,transparent,rgba(255,255,255,0.07),transparent)' }} />

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-y-auto">
        {/* Mobile orbs */}
        <div className="lg:hidden fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: '#6A1B9A', filter: 'blur(120px)', opacity: 0.12 }} />
        <div className="lg:hidden fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: '#C2185B', filter: 'blur(100px)', opacity: 0.1 }} />

        <div className="w-full max-w-sm relative z-10 py-6">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#C2185B,#6A1B9A)' }}>
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">SakhiSahyog</span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#0a041a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>

            {/* Card header */}
            <div className="p-7 text-center"
              style={{ background: 'linear-gradient(135deg,#C2185B,#AD1457 50%,#6A1B9A)' }}>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">Admin Portal</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {mode === 'login' ? 'Sign in to your admin account' : 'Create your admin account'}
              </p>
            </div>

            <div className="p-7 space-y-5">
              {/* Login / Register toggle tabs */}
              <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['login', 'register'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: mode === m ? 'linear-gradient(135deg,#C2185B,#6A1B9A)' : 'transparent',
                      color: mode === m ? '#fff' : 'rgba(255,255,255,0.35)',
                      boxShadow: mode === m ? '0 0 16px rgba(194,24,91,0.3)' : 'none',
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <DLabel>Admin Email</DLabel>
                    <DarkInput type="email" placeholder="admin@example.com"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div>
                    <DLabel>Password</DLabel>
                    <div className="relative">
                      <DarkInput type={showLoginPw ? 'text' : 'password'} placeholder="••••••••"
                        value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowLoginPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors focus:outline-none">
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="w-full py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#C2185B,#6A1B9A)', boxShadow: '0 0 20px rgba(194,24,91,0.3)' }}>
                    {loginLoading ? 'Authenticating…' : 'Secure Login'}
                  </button>
                  <p className="text-center text-sm text-white/35">
                    No account?{' '}
                    <button type="button" onClick={() => setMode('register')}
                      className="font-bold hover:underline" style={{ color: '#C2185B' }}>
                      Register here
                    </button>
                  </p>
                </form>
              )}

              {/* ── REGISTER FORM ── */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <DLabel>Full Name</DLabel>
                      <DarkInput id="name" placeholder="Riya Koli"
                        value={reg.name} onChange={handleRegChange} required />
                    </div>
                    <div>
                      <DLabel>Phone</DLabel>
                      <DarkInput id="phone_number" type="tel" placeholder="+91 9876543210"
                        value={reg.phone_number} onChange={handleRegChange} required />
                    </div>
                  </div>

                  <div>
                    <DLabel>Admin Email</DLabel>
                    <DarkInput id="email" type="email" placeholder="admin@example.com"
                      value={reg.email} onChange={handleRegChange} required />
                  </div>

                  <div>
                    <DLabel>Password</DLabel>
                    <div className="relative">
                      <DarkInput id="password" type={showRegPw ? 'text' : 'password'} placeholder="min. 6 characters"
                        value={reg.password} onChange={handleRegChange} required />
                      <button type="button" onClick={() => setShowRegPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors focus:outline-none">
                        {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <DLabel>State</DLabel>
                      <DarkInput id="state" placeholder="Maharashtra"
                        value={reg.state} onChange={handleRegChange} required />
                    </div>
                    <div>
                      <DLabel>District</DLabel>
                      <DarkInput id="district" placeholder="Pune"
                        value={reg.district} onChange={handleRegChange} required />
                    </div>
                  </div>

                  <button type="submit" disabled={regLoading}
                    className="w-full py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-1"
                    style={{ background: 'linear-gradient(135deg,#C2185B,#6A1B9A)', boxShadow: '0 0 20px rgba(194,24,91,0.3)' }}>
                    {regLoading ? 'Creating Account…' : 'Complete Registration'}
                  </button>

                  <p className="text-center text-sm text-white/35">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')}
                      className="font-bold hover:underline" style={{ color: '#C2185B' }}>
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-white/20 mt-5">
            Return to{' '}
            <Link to="/" className="hover:text-white/40 hover:underline transition-colors">
              Public Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
