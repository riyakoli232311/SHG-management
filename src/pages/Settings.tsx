// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Globe, Landmark, Lock, Save, CheckCircle2,
  Building2, MapPin, Calendar, CreditCard, Hash,
} from "lucide-react";
import { shgApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SECTIONS = [
  { id: "shg",      label: "SHG Information",  icon: Globe     },
  { id: "bank",     label: "Bank Details",      icon: Landmark  },
  { id: "password", label: "Change Password",   icon: Lock      },
];

export default function SettingsPage() {
  const { user, shg: authShg, refreshAuth } = useAuth();

  // SHG form
  const [shgForm, setShgForm] = useState({
    name: "", registration_number: "", village: "",
    block: "", district: "", state: "", formation_date: "",
    bank_name: "", bank_account: "", ifsc: "",
  });
  const [shgSaving, setShgSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm]   = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const [activeSection, setActiveSection] = useState("shg");

  useEffect(() => {
    async function load() {
      try {
        const res = await shgApi.get();
        const d = res.data;
        setShgForm({
          name:                d.name                || "",
          registration_number: d.registration_number || "",
          village:             d.village             || "",
          block:               d.block               || "",
          district:            d.district            || "",
          state:               d.state               || "",
          formation_date:      d.formation_date ? d.formation_date.split("T")[0] : "",
          bank_name:           d.bank_name           || "",
          bank_account:        d.bank_account        || "",
          ifsc:                d.ifsc                || "",
        });
      } catch { /* shg not set up yet */ }
    }
    load();
  }, []);

  async function handleShgSave(e: React.FormEvent) {
    e.preventDefault();
    if (!shgForm.name.trim()) { toast.error("SHG name is required"); return; }
    setShgSaving(true);
    try {
      await shgApi.update(shgForm);
      await refreshAuth?.();
      toast.success("SHG information updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setShgSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.current) { toast.error("Enter your current password"); return; }
    if (pwForm.next.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword?.({ current: pwForm.current, newPassword: pwForm.next });
      toast.success("Password changed successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  }

  // ── Reusable field ────────────────────────────────────────
  function Field({
    label, value, onChange, type = "text", placeholder = "", disabled = false, icon: Icon,
  }: {
    label: string; value: string; onChange?: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean; icon?: any;
  }) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
          <Input
            type={type}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${Icon ? "pl-9" : ""} border-gray-200 focus:border-[#C2185B] focus:ring-[#C2185B]/10 disabled:bg-gray-50 text-sm`}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your SHG profile and account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar nav ───────────────────────────────────── */}
        <div className="lg:w-56 shrink-0">
          <Card className="border-border/50 shadow-sm p-2">
            <nav className="space-y-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === id
                      ? "bg-gradient-to-r from-[#C2185B]/10 to-[#6A1B9A]/5 text-[#C2185B]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </Card>

          {/* Account info card */}
          <Card className="border-border/50 shadow-sm mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-bold shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> SHG Leader
                </p>
                {authShg?.name && (
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-[#C2185B]" />
                    <span className="truncate">{authShg.name}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main content ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* SHG Information */}
          {activeSection === "shg" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#C2185B]" />
                  </div>
                  SHG Information
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your group's name, location and registration details
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleShgSave} className="space-y-5">
                  {/* Basic info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Info</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="SHG Name *" value={shgForm.name}
                        onChange={v => setShgForm(f => ({ ...f, name: v }))}
                        placeholder="e.g. Shakti Mahila Mandal" icon={Building2} />
                      <Field label="Registration Number" value={shgForm.registration_number}
                        onChange={v => setShgForm(f => ({ ...f, registration_number: v }))}
                        placeholder="e.g. SHG/2021/001" icon={Hash} />
                      <Field label="Formation Date" value={shgForm.formation_date}
                        onChange={v => setShgForm(f => ({ ...f, formation_date: v }))}
                        type="date" icon={Calendar} />
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Village" value={shgForm.village}
                        onChange={v => setShgForm(f => ({ ...f, village: v }))}
                        placeholder="e.g. Rampur" icon={MapPin} />
                      <Field label="Block" value={shgForm.block}
                        onChange={v => setShgForm(f => ({ ...f, block: v }))}
                        placeholder="e.g. Karjat" />
                      <Field label="District" value={shgForm.district}
                        onChange={v => setShgForm(f => ({ ...f, district: v }))}
                        placeholder="e.g. Ahmednagar" />
                      <Field label="State" value={shgForm.state}
                        onChange={v => setShgForm(f => ({ ...f, state: v }))}
                        placeholder="e.g. Maharashtra" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={shgSaving}
                      className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2">
                      <Save className="w-4 h-4" />
                      {shgSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {activeSection === "bank" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-[#6A1B9A]" />
                  </div>
                  Bank Details
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SHG's linked bank account for loan disbursements and savings
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleShgSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Bank Name" value={shgForm.bank_name}
                      onChange={v => setShgForm(f => ({ ...f, bank_name: v }))}
                      placeholder="e.g. State Bank of India" icon={Landmark} />
                    <Field label="Account Number" value={shgForm.bank_account}
                      onChange={v => setShgForm(f => ({ ...f, bank_account: v }))}
                      placeholder="e.g. 30209876543210" icon={CreditCard} />
                    <Field label="IFSC Code" value={shgForm.ifsc}
                      onChange={v => setShgForm(f => ({ ...f, ifsc: v.toUpperCase() }))}
                      placeholder="e.g. SBIN0031204" />
                  </div>

                  {/* Read-only info box */}
                  {shgForm.bank_account && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 mt-2">
                      <p className="font-medium mb-1">Current linked account</p>
                      <p className="text-xs text-blue-600">
                        {shgForm.bank_name || "Bank"} · ****{shgForm.bank_account.slice(-4)} · {shgForm.ifsc || "—"}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={shgSaving}
                      className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2">
                      <Save className="w-4 h-4" />
                      {shgSaving ? "Saving..." : "Save Bank Details"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          {activeSection === "password" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </div>
                  Change Password
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your login password. Minimum 6 characters.
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-sm">
                  <Field label="Current Password" value={pwForm.current} type="password"
                    onChange={v => setPwForm(f => ({ ...f, current: v }))}
                    placeholder="Enter current password" icon={Lock} />
                  <Field label="New Password" value={pwForm.next} type="password"
                    onChange={v => setPwForm(f => ({ ...f, next: v }))}
                    placeholder="Min. 6 characters" icon={Lock} />
                  <Field label="Confirm New Password" value={pwForm.confirm} type="password"
                    onChange={v => setPwForm(f => ({ ...f, confirm: v }))}
                    placeholder="Repeat new password" icon={Lock} />

                  {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                    <p className="text-xs text-red-500">Passwords don't match</p>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={pwSaving}
                      className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-2">
                      <Lock className="w-4 h-4" />
                      {pwSaving ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}