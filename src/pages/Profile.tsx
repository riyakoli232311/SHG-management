// src/pages/Profile.tsx
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, MapPin, Calendar, Save, Shield, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { user, shg, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);

  // Password change form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  // Profile save — placeholder (wire to API when you add a PUT /api/auth/profile endpoint)
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast.info("Profile update coming soon.");
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    toast.info("Password change coming soon.");
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" description="Your account and SHG details" />

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Identity card ─────────────────────────── */}
        <div className="space-y-4">
          {/* Avatar card */}
          <Card className="border-[#C2185B]/10 text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">SHG Leader</p>
              {shg?.name && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-xs font-medium">
                  {shg.name}
                </span>
              )}

              <Separator className="my-5" />

              <div className="space-y-2.5 text-sm text-left">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="w-4 h-4 text-[#C2185B] shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {shg?.village && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-[#C2185B] shrink-0" />
                    <span>{[shg.village, shg.district].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SHG info card */}
          {shg && (
            <Card className="border-[#C2185B]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#6A1B9A]" /> My SHG
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { label: "Name",     value: shg.name },
                  { label: "Village",  value: shg.village  || "—" },
                  { label: "Block",    value: shg.block    || "—" },
                  { label: "District", value: shg.district || "—" },
                  { label: "State",    value: shg.state    || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right">{value as string}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick actions */}
          <Card className="border-[#C2185B]/10">
            <CardContent className="pt-4 pb-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-red-200 hover:bg-red-50 text-red-500 text-sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Edit forms ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <Card className="border-[#C2185B]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#C2185B]" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="border-[#C2185B]/20 focus:border-[#C2185B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="border-[#C2185B]/20 focus:border-[#C2185B]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <Input value="SHG Leader" disabled className="bg-muted border-[#C2185B]/20" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card className="border-[#C2185B]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-[#6A1B9A]" />
                </div>
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={pwForm.current}
                    onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={pwForm.next}
                      onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                      className="border-[#C2185B]/20 focus:border-[#C2185B]"
                      placeholder="New password"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      className="border-[#C2185B]/20 focus:border-[#C2185B]"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" className="border-[#C2185B]/30 text-[#C2185B]" disabled={pwSaving}>
                    <Shield className="w-4 h-4 mr-2" />
                    {pwSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account info — read only */}
          <Card className="border-[#C2185B]/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                </div>
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Account ID",  value: user?.id ? `...${user.id.slice(-8)}` : "—" },
                { label: "Email",       value: user?.email || "—" },
                { label: "SHG",         value: shg?.name || "Not set up" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium font-mono text-xs text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}