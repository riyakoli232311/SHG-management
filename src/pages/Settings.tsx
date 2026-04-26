// src/pages/Settings.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, PageHeader, DBtn } from "@/components/ui/dark";
import { Globe, Landmark, Lock, Save, CheckCircle2, Building2, MapPin, Calendar, CreditCard, Hash } from "lucide-react";
import { shgApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SECTIONS = [
  { id: "shg",      label: "SHG Information",  icon: Globe    },
  { id: "bank",     label: "Bank Details",      icon: Landmark },
  { id: "password", label: "Change Password",   icon: Lock     },
];

function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{children}</p>;
}

function DarkInput({ value, onChange, type = "text", placeholder = "", disabled = false, icon: Icon }: {
  label?: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; icon?: any;
}) {
  return (
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon className="w-3.5 h-3.5 text-white/20" /></div>}
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={`w-full rounded-xl py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all disabled:opacity-40 ${Icon ? "pl-9 pr-3" : "px-3"}`}
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & Parameters<typeof DarkInput>[0]) {
  return <div className="space-y-1"><DLabel>{label}</DLabel><DarkInput {...rest} /></div>;
}

export default function SettingsPage() {
  const { user, shg: authShg, refreshAuth } = useAuth();
  const [shgForm, setShgForm] = useState({ name: "", registration_number: "", village: "", block: "", district: "", state: "", formation_date: "", bank_name: "", bank_account: "", ifsc: "" });
  const [shgSaving, setShgSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("shg");

  useEffect(() => {
    shgApi.get().then(res => {
      const d = res.data;
      setShgForm({ name: d.name||"", registration_number: d.registration_number||"", village: d.village||"", block: d.block||"", district: d.district||"", state: d.state||"", formation_date: d.formation_date?d.formation_date.split("T")[0]:"", bank_name: d.bank_name||"", bank_account: d.bank_account||"", ifsc: d.ifsc||"" });
    }).catch(() => {});
  }, []);

  async function handleShgSave(e: React.FormEvent) {
    e.preventDefault();
    if (!shgForm.name.trim()) { toast.error("SHG name is required"); return; }
    setShgSaving(true);
    try { await shgApi.update(shgForm); await refreshAuth?.(); toast.success("SHG information updated!"); }
    catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setShgSaving(false); }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.current) { toast.error("Enter your current password"); return; }
    if (pwForm.next.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    setPwSaving(true);
    try { await authApi.changePassword?.({ current: pwForm.current, newPassword: pwForm.next }); toast.success("Password changed!"); setPwForm({ current:"", next:"", confirm:"" }); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setPwSaving(false); }
  }

  const sf = (k: keyof typeof shgForm) => (v: string) => setShgForm(f => ({ ...f, [k]: v }));
  const pf = (k: keyof typeof pwForm) => (v: string) => setPwForm(f => ({ ...f, [k]: v }));

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your SHG profile and account preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0 space-y-4">
          <DCard className="p-2">
            <nav className="space-y-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: activeSection === id ? "rgba(194,24,91,0.12)" : "transparent", color: activeSection === id ? "#C2185B" : "rgba(255,255,255,0.4)" }}>
                  <Icon className="w-4 h-4 shrink-0" />{label}
                </button>
              ))}
            </nav>
          </DCard>

          {/* Account info */}
          <DCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/35 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-white/40">
              <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> SHG Leader</p>
              {authShg?.name && <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-[#C2185B]" /><span className="truncate">{authShg.name}</span></p>}
            </div>
          </DCard>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* SHG Information */}
          {activeSection === "shg" && (
            <DCard>
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-base font-black text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(194,24,91,0.12)" }}><Globe className="w-4 h-4 text-[#C2185B]" /></div> SHG Information</h2>
                <p className="text-sm text-white/35 mt-1">Update your group's name, location and registration details</p>
              </div>
              <form onSubmit={handleShgSave} className="p-6 space-y-6">
                <div>
                  <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Basic Info</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="SHG Name *" value={shgForm.name} onChange={sf("name")} placeholder="e.g. Shakti Mahila Mandal" icon={Building2} />
                    <Field label="Registration Number" value={shgForm.registration_number} onChange={sf("registration_number")} placeholder="e.g. SHG/2021/001" icon={Hash} />
                    <Field label="Formation Date" value={shgForm.formation_date} onChange={sf("formation_date")} type="date" icon={Calendar} />
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                  <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Location</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Village" value={shgForm.village} onChange={sf("village")} placeholder="e.g. Rampur" icon={MapPin} />
                    <Field label="Block" value={shgForm.block} onChange={sf("block")} placeholder="e.g. Karjat" />
                    <Field label="District" value={shgForm.district} onChange={sf("district")} placeholder="e.g. Ahmednagar" />
                    <Field label="State" value={shgForm.state} onChange={sf("state")} placeholder="e.g. Maharashtra" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <DBtn variant="primary" type="submit" disabled={shgSaving}><Save className="w-4 h-4" />{shgSaving ? "Saving…" : "Save Changes"}</DBtn>
                </div>
              </form>
            </DCard>
          )}

          {/* Bank Details */}
          {activeSection === "bank" && (
            <DCard>
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-base font-black text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.12)" }}><Landmark className="w-4 h-4 text-[#7C3AED]" /></div> Bank Details</h2>
                <p className="text-sm text-white/35 mt-1">SHG's linked bank account for loan disbursements and savings</p>
              </div>
              <form onSubmit={handleShgSave} className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Bank Name" value={shgForm.bank_name} onChange={sf("bank_name")} placeholder="e.g. State Bank of India" icon={Landmark} />
                  <Field label="Account Number" value={shgForm.bank_account} onChange={sf("bank_account")} placeholder="e.g. 30209876543210" icon={CreditCard} />
                  <Field label="IFSC Code" value={shgForm.ifsc} onChange={v => sf("ifsc")(v.toUpperCase())} placeholder="e.g. SBIN0031204" />
                </div>
                {shgForm.bank_account && (
                  <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(2,136,209,0.08)", border: "1px solid rgba(2,136,209,0.18)" }}>
                    <p className="font-bold text-white/70 mb-1">Current linked account</p>
                    <p className="text-xs text-white/40">{shgForm.bank_name||"Bank"} · ****{shgForm.bank_account.slice(-4)} · {shgForm.ifsc||"—"}</p>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <DBtn variant="primary" type="submit" disabled={shgSaving}><Save className="w-4 h-4" />{shgSaving ? "Saving…" : "Save Bank Details"}</DBtn>
                </div>
              </form>
            </DCard>
          )}

          {/* Change Password */}
          {activeSection === "password" && (
            <DCard>
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-base font-black text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}><Lock className="w-4 h-4 text-white/50" /></div> Change Password</h2>
                <p className="text-sm text-white/35 mt-1">Update your login password. Minimum 6 characters.</p>
              </div>
              <form onSubmit={handlePasswordSave} className="p-6 space-y-4 max-w-sm">
                <Field label="Current Password" value={pwForm.current} onChange={pf("current")} type="password" placeholder="Enter current password" icon={Lock} />
                <Field label="New Password" value={pwForm.next} onChange={pf("next")} type="password" placeholder="Min. 6 characters" icon={Lock} />
                <Field label="Confirm New Password" value={pwForm.confirm} onChange={pf("confirm")} type="password" placeholder="Repeat new password" icon={Lock} />
                {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                  <p className="text-xs text-red-400">Passwords don't match</p>
                )}
                <div className="flex justify-end pt-2">
                  <DBtn variant="primary" type="submit" disabled={pwSaving}><Lock className="w-4 h-4" />{pwSaving ? "Changing…" : "Change Password"}</DBtn>
                </div>
              </form>
            </DCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}