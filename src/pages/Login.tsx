// src/pages/Login.tsx — Dark Theme · Split Layout with FeatureDeck
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeartHandshake, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import FeatureDeck from "@/components/FeatureDeck";

// ── Outside component to prevent re-mount on every keystroke ──
function DarkInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-white/25 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
    />
  );
}

export default function Login() {
  const { login, memberLogin } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"leader" | "member" | "admin">("leader");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === "leader") { await login(email, password); navigate("/dashboard"); }
      else if (role === "member") { await memberLogin(name, password); navigate("/member/overview"); }
    } catch (err: any) { toast.error(err.message || "Login failed"); }
    finally { setLoading(false); }
  }

  const TABS = [
    { key: "leader" as const,  label: "SHG Leader" },
    { key: "member" as const,  label: "SHG Member" },
    { key: "admin"  as const,  label: "Admin"       },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg,#07070f 0%,#0a0a12 50%,#0f0520 100%)" }}
    >
      {/* ── LEFT PANEL: Feature Deck ────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col px-12 py-10 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "#6A1B9A", filter: "blur(130px)", opacity: 0.13 }} />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "#C2185B", filter: "blur(110px)", opacity: 0.09 }} />

        {/* Brand mark */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 20px rgba(194,24,91,0.35)" }}>
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-white leading-none">SakhiSahyog</p>
            <p className="text-[10px] text-white/30 font-medium">Empowering Women · Enabling Growth</p>
          </div>
        </div>

        {/* Deck */}
        <div className="flex-1 flex items-center justify-center relative z-10 py-8">
          <div className="w-full max-w-[360px]">
            <FeatureDeck />
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-white/20 font-medium relative z-10">
          Trusted by 1,200+ SHGs across India
        </p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch my-8"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ── RIGHT PANEL: Login Form ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Mobile-only orbs */}
        <div className="lg:hidden fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "#6A1B9A", filter: "blur(120px)", opacity: 0.12 }} />
        <div className="lg:hidden fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "#C2185B", filter: "blur(100px)", opacity: 0.1 }} />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">SakhiSahyog</span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>

            {/* Card header */}
            <div className="p-7 text-center"
              style={{ background: "linear-gradient(135deg,#C2185B,#AD1457 50%,#6A1B9A)" }}>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 shadow-lg">
                {role === "admin"
                  ? <ShieldCheck className="w-6 h-6 text-white" />
                  : <HeartHandshake className="w-6 h-6 text-white" />}
              </div>
              <h1 className="text-xl font-black text-white">Welcome Back</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {role === "admin" ? "Admin Portal Access" : "Sign in to your account"}
              </p>
            </div>

            <div className="p-7 space-y-5">
              {/* Role tabs */}
              <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setRole(t.key)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: role === t.key
                        ? "linear-gradient(135deg,#C2185B,#6A1B9A)"
                        : "transparent",
                      color: role === t.key ? "#fff" : "rgba(255,255,255,0.35)",
                      boxShadow: role === t.key ? "0 0 16px rgba(194,24,91,0.3)" : "none",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Admin redirect panel */}
              {role === "admin" ? (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(194,24,91,0.1)", border: "1px solid rgba(194,24,91,0.25)" }}>
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2" style={{ color: "#C2185B" }} />
                    <p className="text-sm font-bold text-white mb-1">Admin Portal</p>
                    <p className="text-xs text-white/40">
                      Admin login is handled on a separate secure page for authorised district officers.
                    </p>
                  </div>
                  <Link
                    to="/admin/login"
                    className="block w-full py-3 rounded-xl text-white font-black text-sm text-center transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 20px rgba(194,24,91,0.3)" }}
                  >
                    Go to Admin Login →
                  </Link>
                  <Link
                    to="/admin/login"
                    className="block w-full py-2.5 rounded-xl font-bold text-sm text-center transition-all hover:opacity-80"
                    style={{ background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.2)", color: "#e57fa8" }}
                  >
                    Register as Admin
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                      {role === "leader" ? "Email" : "Full Name"}
                    </p>
                    {role === "leader"
                      ? <DarkInput type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                      : <DarkInput type="text" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)} required />}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Password</p>
                    <div className="relative">
                      <DarkInput
                        type={showPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 20px rgba(194,24,91,0.3)" }}
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </button>

                  <p className="text-center text-sm text-white/35">
                    New to SakhiSahyog?{" "}
                    <Link to="/signup" className="font-bold hover:underline" style={{ color: "#C2185B" }}>
                      Create account
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}