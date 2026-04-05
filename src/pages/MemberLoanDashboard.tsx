import { useEffect, useState } from "react";
import { loanRequestsApi, repaymentsApi, savingsApi, membersApi, shgApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Landmark, ArrowRight, ShieldCheck, UserCheck, CalendarDays,
  CheckCircle2, Clock, XCircle, FilePlus, PiggyBank,
  AlertCircle, BadgeCheck, TrendingUp, User, MapPin,
  Phone, Building2, CreditCard, Heart, Users,
  IndianRupee,
} from "lucide-react";

const PURPOSES = [
  "Dairy Farming", "Vegetable Trading", "Tailoring", "Poultry",
  "Goat Rearing", "Pickle Making", "Small Business", "Medical Emergency",
  "Child Education", "Agriculture", "Other"
];

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMPTY_FORM = {
  amount: "",
  purpose: "",
  duration: "12",
  aadhar_number: "",
  aadhar_image: null as File | null,
  passbook_image: null as File | null
};

type Tab = "overview" | "loans" | "repayments" | "savings" | "shg";

export default function MemberLoanDashboard() {
  const { user } = useAuth();
  const [shgData, setShgData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Data states
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Loan apply dialog
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [loansRes, repsRes, savRes, shgRes] = await Promise.all([
        loanRequestsApi.getMemberLoans(user!.id),
        repaymentsApi.list({ member_id: user!.id }),
        savingsApi.list({ member_id: user!.id }),
        shgApi.get().catch(() => ({ data: null })),
      ]);
      setRequests(loansRes.data || []);
      setRepayments(repsRes.data || []);
      setSavings(savRes.data || []);
      if (shgRes?.data) setShgData(shgRes.data);

      // Try to find member profile
      try {
        const membersRes = await membersApi.list();
        const me = (membersRes.data || []).find((m: any) => m.id === user!.id);
        setMemberProfile(me || null);
      } catch { /* ignore */ }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.purpose || !form.aadhar_number) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!form.aadhar_image || !form.passbook_image) {
      toast.error("Please upload both Aadhaar and Passbook images");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (user?.id) formData.append("member_id", user.id);
      formData.append("amount", form.amount);
      formData.append("purpose", form.purpose);
      formData.append("duration", form.duration);
      formData.append("aadhar_number", form.aadhar_number);
      formData.append("aadhar_image", form.aadhar_image);
      formData.append("passbook_image", form.passbook_image);
      await loanRequestsApi.apply(formData);
      toast.success("Loan request submitted!");
      setShowApply(false);
      setForm({ ...EMPTY_FORM });
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived stats ──────────────────────────────────────────
  const totalSavings = savings.reduce((s, r) => s + Number(r.amount), 0);
  const paidEMIs = repayments.filter(r => r.status === "paid");
  const pendingEMIs = repayments.filter(r => r.status === "pending");
  const overdueEMIs = repayments.filter(r => r.status === "overdue");
  const totalRepaid = paidEMIs.reduce((s, r) => s + Number(r.emi_amount), 0);
  const loanEligibility = totalSavings * 3;

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "overview",   label: "Overview",    icon: User },
    { key: "loans",      label: "My Loans",    icon: Landmark },
    { key: "repayments", label: "Repayments",  icon: CalendarDays },
    { key: "savings",    label: "Savings",     icon: PiggyBank },
    { key: "shg",        label: "My SHG",      icon: Users },
  ];

  return (
    <DashboardLayout>
      {/* ── Hero banner ────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-[#C2185B] via-[#AD1457] to-[#6A1B9A] p-6 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-3.5 h-3.5 fill-[#FBC02D] text-[#FBC02D]" />
                <span className="text-white/70 text-xs">Member Portal</span>
              </div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-white/70 text-sm">{shgData?.name || "SHG Member"}</p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: "Total Savings",  value: `₹${totalSavings.toLocaleString("en-IN")}` },
              { label: "EMIs Paid",      value: paidEMIs.length },
              { label: "Loan Eligibility", value: `₹${loanEligibility.toLocaleString("en-IN")}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-white shadow text-[#C2185B]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {key === "repayments" && overdueEMIs.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {overdueEMIs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : (
        <>
          {/* ══ OVERVIEW TAB ══════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: PiggyBank,    color: "#C2185B", label: "Total Savings",    value: `₹${totalSavings.toLocaleString("en-IN")}`,  sub: `${savings.length} contributions` },
                  { icon: TrendingUp,   color: "#6A1B9A", label: "Loan Eligibility", value: `₹${loanEligibility.toLocaleString("en-IN")}`, sub: "3× total savings" },
                  { icon: BadgeCheck,   color: "#388E3C", label: "EMIs Paid",        value: paidEMIs.length,                              sub: `₹${totalRepaid.toLocaleString("en-IN")} repaid` },
                  { icon: AlertCircle,  color: "#D32F2F", label: "Overdue EMIs",     value: overdueEMIs.length,                           sub: overdueEMIs.length > 0 ? "Attention needed" : "All clear ✓" },
                ].map(({ icon: Icon, color, label, value, sub }) => (
                  <Card key={label} className="border-border/60 shadow-sm">
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

              {/* Overdue alert */}
              {overdueEMIs.length > 0 && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">You have {overdueEMIs.length} overdue EMI{overdueEMIs.length > 1 ? "s" : ""}</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Total overdue: ₹{overdueEMIs.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")} — please contact your SHG leader.
                    </p>
                  </div>
                </div>
              )}

              {/* Profile info */}
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-[#C2185B]" /> My Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {memberProfile ? [
                      { label: "Full Name",    value: memberProfile.name },
                      { label: "W/O",          value: memberProfile.husband_name || "—" },
                      { label: "Phone",        value: memberProfile.phone || "—" },
                      { label: "Occupation",   value: memberProfile.occupation || "—" },
                      { label: "Role in SHG",  value: (memberProfile.role || "member").charAt(0).toUpperCase() + (memberProfile.role || "member").slice(1) },
                      { label: "Caste",        value: memberProfile.caste_category ? memberProfile.caste_category.toUpperCase() : "—" },
                      { label: "BPL Status",   value: memberProfile.bpl_status ? "Yes (BPL)" : "No" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-6">Profile details not available</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6A1B9A]" /> Address & Bank
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    {memberProfile ? [
                      { label: "Village",       value: memberProfile.village || "—" },
                      { label: "Block",         value: memberProfile.block || "—" },
                      { label: "District",      value: memberProfile.district || "—" },
                      { label: "State",         value: memberProfile.state || "—" },
                      { label: "Bank Account",  value: memberProfile.bank_account ? `****${memberProfile.bank_account.slice(-4)}` : "—" },
                      { label: "IFSC",          value: memberProfile.bank_ifsc || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-6">Profile details not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Apply for Loan",   icon: FilePlus,    action: () => setShowApply(true),              color: "#C2185B" },
                  { label: "View Repayments",  icon: CalendarDays, action: () => setActiveTab("repayments"),     color: "#6A1B9A" },
                  { label: "View Savings",     icon: PiggyBank,   action: () => setActiveTab("savings"),         color: "#388E3C" },
                  { label: "SHG Info",         icon: Users,       action: () => setActiveTab("shg"),             color: "#0288D1" },
                ].map(({ label, icon: Icon, action, color }) => (
                  <button key={label} onClick={action}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ LOANS TAB ══════════════════════════════════════ */}
          {activeTab === "loans" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{requests.length} loan request{requests.length !== 1 ? "s" : ""}</p>
                <Button
                  onClick={() => setShowApply(true)}
                  className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white rounded-full px-5"
                  size="sm"
                >
                  <FilePlus className="w-4 h-4 mr-1.5" /> Request New Loan
                </Button>
              </div>

              {requests.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50 shadow-none">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <Landmark className="w-14 h-14 opacity-20 mb-3" />
                    <p className="font-medium text-gray-700">No loan requests yet</p>
                    <p className="text-sm mt-1 max-w-xs">Your eligibility is ₹{loanEligibility.toLocaleString("en-IN")} (3× your savings). Click above to apply.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {requests.map(req => (
                    <Card key={req.loan_id} className="border border-gray-100 shadow-sm overflow-hidden">
                      <div className={`h-1.5 w-full ${req.status === "approved" ? "bg-green-500" : req.status === "rejected" ? "bg-red-500" : "bg-amber-400"}`} />
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-full flex justify-center items-center ${req.status === "approved" ? "bg-green-100 text-green-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                              {req.status === "approved" && <CheckCircle2 className="w-5 h-5" />}
                              {req.status === "rejected" && <XCircle className="w-5 h-5" />}
                              {req.status === "pending" && <Clock className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{req.status}</p>
                              <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString("en-IN")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">₹{Number(req.amount).toLocaleString("en-IN")}</p>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Requested</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Purpose</p>
                            <p className="font-medium">{req.purpose}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-medium">{req.duration} months</p>
                          </div>
                          <div className="col-span-2 bg-blue-50 rounded-lg p-2.5 flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <p className="text-xs font-semibold text-gray-700">Trust Score</p>
                                <span className="text-xs font-bold text-indigo-600">{req.trust_score}/100</span>
                              </div>
                              <div className="h-1.5 bg-blue-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, req.trust_score)}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ REPAYMENTS TAB ════════════════════════════════ */}
          {activeTab === "repayments" && (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Paid",    value: paidEMIs.length,    color: "#388E3C", sub: `₹${totalRepaid.toLocaleString("en-IN")}` },
                  { label: "Pending", value: pendingEMIs.length,  color: "#F57C00", sub: `₹${pendingEMIs.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}` },
                  { label: "Overdue", value: overdueEMIs.length,  color: "#D32F2F", sub: `₹${overdueEMIs.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}` },
                ].map(({ label, value, color, sub }) => (
                  <Card key={label} className={`border-border/60 shadow-sm ${label === "Overdue" && value > 0 ? "border-red-200" : ""}`}>
                    <CardContent className="pt-4 pb-4 text-center">
                      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                      <p className="text-xs text-muted-foreground">{label} EMIs</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color }}>{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {repayments.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50 shadow-none">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No repayment records found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">EMI Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                      {repayments.map(r => (
                        <div key={r.id} className={`flex items-center justify-between px-5 py-3.5 ${r.status === "overdue" ? "bg-red-50/40" : r.status === "paid" ? "bg-green-50/30" : ""}`}>
                          <div className="flex items-center gap-3">
                            {r.status === "paid"    && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                            {r.status === "overdue" && <AlertCircle  className="w-5 h-5 text-red-500   shrink-0" />}
                            {r.status === "pending" && <Clock        className="w-5 h-5 text-amber-500  shrink-0" />}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              {r.paid_date && (
                                <p className="text-xs text-green-600">
                                  Paid on {new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              r.status === "paid"    ? "bg-green-100 text-green-700" :
                              r.status === "overdue" ? "bg-red-100 text-red-600" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{repayments.length} total EMIs</span>
                      <span className="text-base font-bold text-[#C2185B]">
                        ₹{repayments.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")} total
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ══ SAVINGS TAB ═══════════════════════════════════ */}
          {activeTab === "savings" && (
            <div className="space-y-5">
              {/* Total savings highlight */}
              <Card className="border-border/60 bg-gradient-to-r from-[#C2185B]/5 to-[#6A1B9A]/5">
                <CardContent className="pt-5 pb-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shrink-0">
                    <PiggyBank className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Savings (All Time)</p>
                    <p className="text-3xl font-bold text-gray-900">₹{totalSavings.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-[#C2185B] font-medium mt-0.5">
                      Loan eligibility: ₹{loanEligibility.toLocaleString("en-IN")} (3× savings)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {savings.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50 shadow-none">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No savings recorded yet</p>
                    <p className="text-xs mt-1">Ask your SHG leader to record your monthly savings.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Savings History</CardTitle>
                      <span className="text-xs text-muted-foreground">{savings.length} contributions</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                      {savings.map(s => (
                        <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{MONTH_NAMES[s.month]} {s.year}</p>
                              <p className="text-xs text-muted-foreground capitalize">{s.payment_mode} · {s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-700">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{savings.length} entries</span>
                      <span className="text-base font-bold text-[#C2185B]">₹{totalSavings.toLocaleString("en-IN")}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ══ SHG TAB ═══════════════════════════════════════ */}
          {activeTab === "shg" && (
            <div className="space-y-5">
              {shgData ? (
                <>
                  {/* SHG hero */}
                  <Card className="border-border/60 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]" />
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C2185B]/20 to-[#6A1B9A]/20 border border-[#C2185B]/20 flex items-center justify-center shrink-0">
                          <Heart className="w-7 h-7 text-[#C2185B]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{shgData?.name}</h2>
                          {(shgData as any).district && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {[(shgData as any).village, (shgData as any).district, (shgData as any).state].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Card className="border-border/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#C2185B]" /> SHG Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {[
                          { label: "SHG Name",     value: shgData?.name },
                          { label: "Village",       value: (shgData as any).village || "—" },
                          { label: "Block",         value: (shgData as any).block || "—" },
                          { label: "District",      value: (shgData as any).district || "—" },
                          { label: "State",         value: (shgData as any).state || "—" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-gray-800">{value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#6A1B9A]" /> My Eligibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-xl bg-gradient-to-br from-[#C2185B]/5 to-[#6A1B9A]/5 border border-[#C2185B]/10 p-4 mb-4">
                          <p className="text-xs text-muted-foreground mb-1">Maximum Loan You Can Apply For</p>
                          <p className="text-3xl font-bold text-[#C2185B]">₹{loanEligibility.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-muted-foreground mt-1">Based on ₹{totalSavings.toLocaleString("en-IN")} savings × 3</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Your total savings</span>
                            <span className="font-medium">₹{totalSavings.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Eligibility multiplier</span>
                            <span className="font-medium">3×</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                            <span>Eligible amount</span>
                            <span className="text-[#C2185B]">₹{loanEligibility.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowApply(true)}
                          className="w-full mt-4 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white"
                          size="sm"
                        >
                          <FilePlus className="w-4 h-4 mr-1.5" /> Apply for Loan
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="border-dashed border-2 bg-gray-50/50 shadow-none">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>SHG information not available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Apply Loan Dialog ──────────────────────────────── */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Request a Loan</DialogTitle>
          </DialogHeader>
          <div className="mb-3 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
            <p className="text-xs text-blue-800 font-medium">
              💡 Your max eligibility: <strong>₹{loanEligibility.toLocaleString("en-IN")}</strong> (3× your savings of ₹{totalSavings.toLocaleString("en-IN")})
            </p>
          </div>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Loan Amount (₹) *</Label>
              <Input type="number" placeholder={`Max ₹${loanEligibility.toLocaleString("en-IN")}`}
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
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
              <Input type="number" placeholder="e.g. 12"
                value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Aadhaar Card Number *</Label>
              <Input type="text" placeholder="12-digit Aadhaar"
                value={form.aadhar_number} onChange={e => setForm({ ...form, aadhar_number: e.target.value })} required />
            </div>
            <div className="pt-2 border-t space-y-3">
              <p className="text-sm font-semibold text-gray-800">Upload Documents *</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Aadhaar Card Image</Label>
                <Input type="file" accept="image/*"
                  onChange={e => setForm({ ...form, aadhar_image: e.target.files?.[0] || null })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bank Passbook (Front Page)</Label>
                <Input type="file" accept="image/*"
                  onChange={e => setForm({ ...form, passbook_image: e.target.files?.[0] || null })} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}