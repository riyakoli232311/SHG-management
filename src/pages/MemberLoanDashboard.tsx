import { useEffect, useState } from "react";
import { loanRequestsApi, membersApi, shgApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Landmark, ArrowRight, ShieldCheck, FilePlus, User,
  Phone, MapPin, Building2, Users,
  Heart, Calendar,
  CheckCircle2, Clock, XCircle,
} from "lucide-react";

const PURPOSES = [
  "Dairy Farming", "Vegetable Trading", "Tailoring", "Poultry",
  "Goat Rearing", "Pickle Making", "Small Business", "Medical Emergency",
  "Child Education", "Agriculture", "Other"
];

const EMPTY_FORM = {
  amount: "",
  purpose: "",
  duration: "12",
  aadhar_number: "",
  aadhar_image: null as File | null,
  passbook_image: null as File | null,
};

function statusMeta(status: string) {
  switch (status) {
    case "approved": return { icon: CheckCircle2, color: "text-green-700", bg: "bg-green-50", bar: "bg-green-500", label: "Approved" };
    case "rejected": return { icon: XCircle,      color: "text-red-600",   bg: "bg-red-50",   bar: "bg-red-500",   label: "Rejected" };
    default:         return { icon: Clock,         color: "text-amber-700", bg: "bg-amber-50", bar: "bg-amber-400", label: "Pending" };
  }
}

export default function MemberLoanDashboard() {
  const { user } = useAuth();
  const [member, setMember]     = useState<any>(null);
  const [shg, setShg]           = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user?.id) loadAll(); }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, lRes] = await Promise.all([
        membersApi.get(user!.id),
        loanRequestsApi.getMemberLoans(user!.id),
      ]);
      setMember(mRes.data);
      setRequests(lRes.data || []);
      try { const sRes = await shgApi.get(); setShg(sRes.data); } catch { /* optional */ }
    } catch (err: any) {
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.purpose || !form.aadhar_number) { toast.error("Fill all required fields"); return; }
    if (!form.aadhar_image || !form.passbook_image) { toast.error("Upload both documents"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (user?.id) fd.append("member_id", user.id);
      fd.append("amount", form.amount);
      fd.append("purpose", form.purpose);
      fd.append("duration", form.duration);
      fd.append("aadhar_number", form.aadhar_number);
      fd.append("aadhar_image", form.aadhar_image!);
      fd.append("passbook_image", form.passbook_image!);
      await loanRequestsApi.apply(fd);
      toast.success("Loan request submitted!");
      setShowApply(false);
      setForm({ ...EMPTY_FORM });
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  const approved = requests.filter(r => r.status === "approved").length;
  const pending  = requests.filter(r => r.status === "pending").length;
  const rejected = requests.filter(r => r.status === "rejected").length;
  const totalAmt = requests.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.amount), 0);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-7 bg-gradient-to-br from-[#C2185B] via-[#AD1457] to-[#6A1B9A] p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold shrink-0">
              {member?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "M"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-3.5 h-3.5 fill-[#FBC02D] text-[#FBC02D]" />
                <span className="text-white/70 text-xs">
                  {member?.role ? `${member.role.charAt(0).toUpperCase() + member.role.slice(1)} · ` : ""}
                  {shg?.name || "SHG Member"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{member?.name || user?.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/70 text-sm">
                {member?.village && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[member.village, member.block, member.district].filter(Boolean).join(", ")}
                  </span>
                )}
                {member?.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{member.phone}</span>
                )}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowApply(true)} className="bg-white text-[#C2185B] hover:bg-white/90 font-semibold shadow-md shrink-0 gap-2" size="sm">
            <FilePlus className="w-4 h-4" /> Apply for Loan
          </Button>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 flex flex-wrap gap-6 mt-6 pt-5 border-t border-white/15">
          {[
            { label: "Total Requests",  value: requests.length },
            { label: "Approved",        value: approved },
            { label: "Pending Review",  value: pending },
            { label: "Amount Approved", value: `₹${totalAmt.toLocaleString("en-IN")}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: FilePlus,     color: "#C2185B", label: "Total Requests", value: requests.length,  sub: "all time" },
          { icon: CheckCircle2, color: "#388E3C", label: "Approved",       value: approved,          sub: `₹${totalAmt.toLocaleString("en-IN")} total` },
          { icon: Clock,        color: "#F57C00", label: "Pending",        value: pending,           sub: "awaiting review" },
          { icon: XCircle,      color: "#D32F2F", label: "Rejected",       value: rejected,          sub: rejected > 0 ? "not approved" : "all good ✓" },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <Card key={label} className="border-border/50 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Profile + SHG Row ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5 mb-7">

        {/* Personal Info */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#C2185B]" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-0">
            {[
              { label: "Full Name",   value: member?.name },
              { label: "W/O",         value: member?.husband_name },
              { label: "Phone",       value: member?.phone },
              { label: "Age",         value: member?.age ? `${member.age} years` : null },
              { label: "Occupation",  value: member?.occupation },
              { label: "Income",      value: member?.income ? `₹${Number(member.income).toLocaleString("en-IN")}/mo` : null },
              { label: "Aadhaar",     value: member?.aadhar ? `XXXX XXXX ${member.aadhar.slice(-4)}` : null },
              { label: "Category",    value: member?.caste_category?.toUpperCase() },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="font-medium text-gray-800 text-xs text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
            {member?.bpl_status && (
              <div className="pt-2">
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-semibold">BPL Beneficiary</span>
              </div>
            )}
            <div className="pt-2">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${member?.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {member?.status === "active" ? "● Active Member" : "○ Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-[#6A1B9A]" />
              </div>
              Address & Bank
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-0">
            {[
              { label: "Village",     value: member?.village },
              { label: "Gram Panchayat", value: member?.gram_panchayat },
              { label: "Block",       value: member?.block },
              { label: "District",    value: member?.district },
              { label: "State",       value: member?.state },
              { label: "PIN Code",    value: member?.pin_code },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="font-medium text-gray-800 text-xs text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
            {/* Bank details */}
            {(member?.bank_account || member?.bank_ifsc) && (
              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-xs space-y-1">
                <p className="font-semibold text-blue-700 text-[10px] uppercase tracking-wide">Bank (PMJDY)</p>
                {member?.bank_account && <p className="font-mono text-gray-700">****{member.bank_account.slice(-4)}</p>}
                {member?.bank_ifsc && <p className="font-mono text-gray-700">{member.bank_ifsc}</p>}
              </div>
            )}
            {member?.joined_date && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Member since {new Date(member.joined_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SHG Info + CTA */}
        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-green-600" />
                </div>
                My SHG
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shg ? (
                <>
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#C2185B]/5 to-[#6A1B9A]/5 border border-[#C2185B]/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Group Name</p>
                    <p className="text-base font-bold text-gray-900 leading-tight">{shg.name}</p>
                  </div>
                  <div className="text-sm space-y-0">
                    {[
                      { label: "District", value: shg.district },
                      { label: "Block",    value: shg.block },
                      { label: "State",    value: shg.state },
                      { label: "Formed",   value: shg.formation_date ? new Date(shg.formation_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null },
                      { label: "Bank",     value: shg.bank_name },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className="font-medium text-gray-800 text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">SHG info unavailable</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply CTA */}
          <Card className="border-[#C2185B]/20 bg-gradient-to-br from-[#C2185B]/5 to-[#6A1B9A]/5 shadow-sm">
            <CardContent className="pt-5 pb-5 text-center">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center mx-auto mb-3 shadow-md">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Need a Loan?</p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Eligible for up to <strong className="text-[#C2185B]">3× your savings</strong>.
              </p>
              <Button onClick={() => setShowApply(true)} className="w-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white text-sm gap-2" size="sm">
                <FilePlus className="w-3.5 h-3.5" /> Apply Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Loan Requests ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#C2185B]" />
            My Loan Requests
          </h2>
          <Button onClick={() => setShowApply(true)} size="sm" className="bg-[#C2185B] hover:bg-[#AD1457] text-white gap-1.5">
            <FilePlus className="w-3.5 h-3.5" /> New Request
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/40 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground text-center">
              <Landmark className="w-12 h-12 opacity-20 mb-3" />
              <p className="font-medium text-gray-700 mb-1">No Loan Requests Yet</p>
              <p className="text-sm max-w-xs">Apply for a loan based on your savings. Your SHG leader will review and approve it.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => {
              const meta = statusMeta(req.status);
              const Icon = meta.icon;
              return (
                <Card key={req.loan_id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className={`h-1 w-full ${meta.bar}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </div>
                      <p className="text-xl font-bold text-gray-900">₹{Number(req.amount).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purpose</span>
                        <span className="font-medium text-gray-800">{req.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-gray-800">{req.duration} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applied</span>
                        <span className="font-medium text-gray-800">
                          {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-500" /> Trust Score
                        </span>
                        <span className="text-[10px] font-black text-indigo-600">{req.trust_score}/100</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${req.trust_score > 70 ? "bg-green-400" : req.trust_score > 40 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${Math.min(100, req.trust_score)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Apply Dialog ──────────────────────────────────────── */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                <Landmark className="w-4 h-4 text-white" />
              </div>
              Apply for a Loan
            </DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-800">
            💡 Max loan = <strong>3× your total savings</strong>. Trust Score is auto-calculated from savings regularity and repayment history.
          </div>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Loan Amount (₹) *</Label>
              <Input type="number" placeholder="e.g. 15000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose *</Label>
              <Select value={form.purpose} onValueChange={v => setForm({ ...form, purpose: v })}>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (Months) *</Label>
              <Input type="number" placeholder="e.g. 12" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Aadhaar Number *</Label>
              <Input placeholder="12-digit Aadhaar" maxLength={12} value={form.aadhar_number} onChange={e => setForm({ ...form, aadhar_number: e.target.value })} required />
            </div>
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Upload Documents *</p>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Aadhaar Card (image)</Label>
                <Input type="file" accept="image/*" onChange={e => setForm({ ...form, aadhar_image: e.target.files?.[0] || null })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bank Passbook — Front Page</Label>
                <Input type="file" accept="image/*" onChange={e => setForm({ ...form, passbook_image: e.target.files?.[0] || null })} required />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApply(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Request"}
                {!submitting && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}