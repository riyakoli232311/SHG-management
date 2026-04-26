// src/pages/member/MemberOverview.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, DSpinner, DBadge } from "@/components/ui/dark";
import { Link } from "react-router-dom";
import { PiggyBank, Landmark, CalendarCheck, TrendingUp, CheckCircle2, AlertCircle, Clock, ArrowRight, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loanRequestsApi, savingsApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MemberOverview() {
  const { user } = useAuth();
  const [loans, setLoans]         = useState<any[]>([]);
  const [savings, setSavings]     = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        const [lRes, sRes, rRes] = await Promise.all([
          loanRequestsApi.getMemberLoans(user!.id),
          savingsApi.list({ member_id: user!.id }),
          repaymentsApi.list({ member_id: user!.id }),
        ]);
        setLoans(lRes.data || []); setSavings(sRes.data || []); setRepayments(rRes.data || []);
      } catch { toast.error("Failed to load data"); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  const totalSavings   = savings.reduce((s, r) => s + Number(r.amount), 0);
  const approvedLoans  = loans.filter(l => l.status === "approved");
  const pendingLoans   = loans.filter(l => l.status === "pending");
  const paidEMIs       = repayments.filter(r => r.status === "paid").length;
  const overdueEMIs    = repayments.filter(r => r.status === "overdue");
  const pendingEMIs    = repayments.filter(r => r.status === "pending");
  const loanEligibility = totalSavings * 3;

  const quickLinks = [
    { icon: Landmark,    label: "Apply for Loan",  sub: "Submit a new request",     to: "/member/loans",      color: "#C2185B" },
    { icon: PiggyBank,  label: "View Savings",    sub: "Check contributions",       to: "/member/savings",    color: "#7C3AED" },
    { icon: CalendarCheck, label: "My Repayments", sub: "Track EMI schedule",       to: "/member/repayments", color: "#0288D1" },
    { icon: TrendingUp, label: "My SHG",          sub: "Group information",         to: "/member/shg",        color: "#10B981" },
  ];

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-7 p-6 md:p-8 text-white"
        style={{ background: "linear-gradient(135deg,#C2185B 0%,#AD1457 45%,#6A1B9A 100%)", boxShadow: "0 20px 60px rgba(194,24,91,0.3)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            <span className="text-white/75 text-sm">{greeting}, Sakhi!</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1">{user?.name}</h1>
          <p className="text-white/65 text-sm mb-5">SHG Member</p>
          <div className="flex gap-8 flex-wrap">
            {[
              { label: "Total Savings",    value: `₹${totalSavings.toLocaleString("en-IN")}` },
              { label: "Loan Eligibility", value: `₹${loanEligibility.toLocaleString("en-IN")}` },
              { label: "Active Requests",  value: approvedLoans.length + pendingLoans.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-xs text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Overdue alert */}
      {overdueEMIs.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">{overdueEMIs.length} overdue EMI{overdueEMIs.length > 1 ? "s" : ""} need attention</p>
            <p className="text-xs text-red-400/80 mt-0.5">Total: ₹{overdueEMIs.reduce((s,r)=>s+Number(r.emi_amount),0).toLocaleString("en-IN")}</p>
          </div>
          <Link to="/member/repayments" className="ml-auto text-xs text-red-400 underline font-bold shrink-0">View →</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: PiggyBank,    color: "#C2185B", label: "Total Savings",    value: `₹${totalSavings.toLocaleString("en-IN")}`,     sub: `${savings.length} contributions` },
          { icon: TrendingUp,   color: "#7C3AED", label: "Loan Eligibility", value: `₹${loanEligibility.toLocaleString("en-IN")}`, sub: "3× total savings" },
          { icon: CheckCircle2, color: "#10B981", label: "EMIs Paid",        value: paidEMIs,                                       sub: `${pendingEMIs.length} pending` },
          { icon: Landmark,     color: "#0288D1", label: "Loan Requests",    value: loans.length,                                   sub: `${approvedLoans.length} approved` },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <DCard key={label} className="p-5 hover:border-white/12 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}><Icon className="w-4 h-4" style={{ color }} /></div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white leading-tight">{value}</p>
                <p className="text-xs text-white/30">{sub}</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {quickLinks.map(({ icon: Icon, label, sub, to, color }) => (
          <Link to={to} key={label}>
            <DCard className="hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-sm font-bold text-white mb-0.5">{label}</p>
              <p className="text-xs text-white/35">{sub}</p>
              <div className="flex items-center gap-1 mt-2 text-xs font-bold" style={{ color }}>Go <ArrowRight className="w-3 h-3" /></div>
            </DCard>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent Savings */}
        <DCard>
          <DCardHeader>
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><PiggyBank className="w-4 h-4 text-[#C2185B]" /> Recent Savings</h3>
            <Link to="/member/savings" className="text-xs font-bold hover:underline" style={{ color: "#C2185B" }}>View all →</Link>
          </DCardHeader>
          <div className="p-5">
            {savings.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-6">No savings recorded yet</p>
            ) : (
              <div className="space-y-2.5">
                {savings.slice(0, 4).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white/40">
                        {["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][s.month]} {s.year}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DCard>

        {/* Upcoming Repayments */}
        <DCard>
          <DCardHeader>
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-[#0288D1]" /> Upcoming Repayments</h3>
            <Link to="/member/repayments" className="text-xs font-bold hover:underline" style={{ color: "#C2185B" }}>View all →</Link>
          </DCardHeader>
          <div className="p-5">
            {repayments.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-6">No repayments scheduled</p>
            ) : (
              <div className="space-y-2">
                {[...overdueEMIs, ...pendingEMIs].slice(0, 4).map(r => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: r.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${r.status === "overdue" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="flex items-center gap-2">
                      {r.status === "overdue" ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                      <span className="text-xs" style={{ color: r.status === "overdue" ? "#f87171" : "rgba(255,255,255,0.4)" }}>
                        Due {new Date(r.due_date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                      </span>
                    </div>
                    <span className="font-bold text-white text-sm">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DCard>
      </div>
    </DashboardLayout>
  );
}