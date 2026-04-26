// src/pages/Signup.tsx — Dark Theme · Split Layout with FeatureDeck
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartHandshake, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
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

function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{children}</p>;
}

export default function Signup() {
  const { signup, memberSignup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"leader" | "member">("leader");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [district, setDistrict] = useState("");
  const [shgId, setShgId] = useState("");
  const [shgList, setShgList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (role === "member" && district.length > 2) {
      const timer = setTimeout(() => {
        authApi.getShgList(district).then(res => setShgList(res.shgs)).catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    } else { setShgList([]); setShgId(""); }
  }, [role, district]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      if (role === "leader") { await signup(name, email, password); navigate("/setup"); }
      else {
        if (!shgId) { toast.error("Please select an SHG"); setLoading(false); return; }
        await memberSignup(name, phone, aadhar, shgId, password);
        navigate("/member/loans");
      }
    } catch (err: any) { toast.error(err.message || "Signup failed"); }
    finally { setLoading(false); }
  }

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
          Join 1,200+ Women's Self Help Groups across India
        </p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch my-8"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* ── RIGHT PANEL: Signup Form ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-y-auto">
        {/* Mobile-only orbs */}
        <div className="lg:hidden fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "#6A1B9A", filter: "blur(120px)", opacity: 0.12 }} />
        <div className="lg:hidden fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "#C2185B", filter: "blur(100px)", opacity: 0.1 }} />

        <div className="w-full max-w-sm relative z-10 py-6">
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
                <HeartHandshake className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">Create Account</h1>
              <p className="text-white/70 text-sm mt-0.5">Join thousands of empowered women</p>
            </div>

            <div className="p-7 space-y-4">
              {/* Role tabs */}
              <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                {(["leader", "member"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: role === r ? "linear-gradient(135deg,#C2185B,#6A1B9A)" : "transparent",
                      color: role === r ? "#fff" : "rgba(255,255,255,0.35)",
                      boxShadow: role === r ? "0 0 16px rgba(194,24,91,0.3)" : "none",
                    }}
                  >
                    {r === "leader" ? "SHG Leader" : "SHG Member"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div><DLabel>Full Name</DLabel><DarkInput placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} required /></div>

                {role === "leader" ? (
                  <div><DLabel>Email</DLabel><DarkInput type="email" placeholder="priya@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                ) : (
                  <>
                    <div><DLabel>Phone Number</DLabel><DarkInput type="tel" placeholder="e.g. 9876543210" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
                    <div><DLabel>Aadhaar Number</DLabel><DarkInput placeholder="Your 12-digit Aadhaar" value={aadhar} onChange={e => setAadhar(e.target.value)} required /></div>
                    <div><DLabel>District</DLabel><DarkInput placeholder="e.g. Pune" value={district} onChange={e => setDistrict(e.target.value)} required /></div>
                    <div>
                      <DLabel>Select Self Help Group (SHG)</DLabel>
                      <Select value={shgId} onValueChange={setShgId} disabled={shgList.length === 0}>
                        <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-11">
                          <SelectValue placeholder={district.length < 3 ? "Type at least 3 letters of district" : shgList.length === 0 ? "No SHGs found" : "Choose your SHG"} />
                        </SelectTrigger>
                        <SelectContent>{shgList.map(shg => <SelectItem key={shg.id} value={shg.id}>{shg.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <DLabel>Password</DLabel>
                  <div className="relative">
                    <DarkInput type={showPw ? "text" : "password"} placeholder="min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-2"
                  style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 20px rgba(194,24,91,0.3)" }}
                >
                  {loading ? "Registering…" : "Complete Registration"}
                </button>

                <p className="text-center text-sm text-white/35">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold hover:underline" style={{ color: "#C2185B" }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}