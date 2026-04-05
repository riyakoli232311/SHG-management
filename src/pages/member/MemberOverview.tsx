// src/pages/member/MemberOverview.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  PiggyBank, Landmark, CalendarCheck, TrendingUp,
  CheckCircle2, AlertCircle, Clock, ArrowRight, Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loanRequestsApi, savingsApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";

export default function MemberOverview() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const hour = today.getHours();
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
        setLoans(lRes.data || []);
        setSavings(sRes.data || []);
        setRepayments(rRes.data || []);
      } catch (err: any) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalSavings = savings.reduce((s, r) => s + Number(r.amount), 0);
  const approvedLoans = loans.filter((l) => l.status === "approved");
  const pendingLoans = loans.filter((l) => l.status === "pending");
  const paidEMIs = repayments.filter((r) => r.status === "paid").length;
  const overdueEMIs = repayments.filter((r) => r.status === "overdue");
  const pendingEMIs = repayments.filter((r) => r.status === "pending");
  const loanEligibility = totalSavings * 3;

  const quickLinks = [
    { icon: Landmark, label: "Apply for Loan",     sub: "Submit a new request",    to: "/member/loans",      color: "#C2185B" },
    { icon: PiggyBank, label: "View Savings",       sub: "Check contribution history", to: "/member/savings", color: "#6A1B9A" },
    { icon: CalendarCheck, label: "My Repayments",  sub: "Track EMI schedule",      to: "/member/repayments", color: "#0288D1" },
    { icon: TrendingUp, label: "My SHG",            sub: "Group information",       to: "/member/shg",        color: "#388E3C" },
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-7 bg-gradient-to-br from-[#C2185B] via-[#AD1457] to-[#6A1B9A] p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 fill-[#FBC02D] text-[#FBC02D]" />
            <span className="text-white/80 text-sm">{greeting}, Sakhi!</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{user?.name}</h1>
          <p className="text-white/70 text-sm mb-5">SHG Member</p>

          <div className="flex gap-6 flex-wrap">
            {[
              { label: "Total Savings",     value: `₹${totalSavings.toLocaleString("en-IN")}` },
              { label: "Loan Eligibility",  value: `₹${loanEligibility.toLocaleString("en-IN")}` },
              { label: "Active Requests",   value: approvedLoans.length + pendingLoans.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert for overdue EMIs */}
      {overdueEMIs.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdueEMIs.length} overdue EMI{overdueEMIs.length > 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Total overdue: ₹{overdueEMIs.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}
            </p>
          </div>
          <Link to="/member/repayments" className="ml-auto text-xs text-red-600 underline">View →</Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: PiggyBank,    color: "#C2185B", label: "Total Savings",    value: `₹${totalSavings.toLocaleString("en-IN")}`,           sub: `${savings.length} contributions` },
          { icon: TrendingUp,   color: "#6A1B9A", label: "Loan Eligibility", value: `₹${loanEligibility.toLocaleString("en-IN")}`,         sub: "3× total savings" },
          { icon: CheckCircle2, color: "#388E3C", label: "EMIs Paid",        value: paidEMIs,                                              sub: `${pendingEMIs.length} pending` },
          { icon: Landmark,     color: "#0288D1", label: "Loan Requests",    value: loans.length,                                          sub: `${approvedLoans.length} approved` },
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {quickLinks.map(({ icon: Icon, label, sub, to, color }) => (
          <Link to={to} key={label}>
            <Card className="border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
              <CardContent className="p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color }}>
                  Go <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent savings */}
        <Card className="border-border/60 shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#C2185B]" /> Recent Savings
            </p>
            <Link to="/member/savings" className="text-xs text-[#C2185B] hover:underline">View all →</Link>
          </div>
          <CardContent>
            {savings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No savings recorded yet</p>
            ) : (
              <div className="space-y-2">
                {savings.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-muted-foreground">
                        {["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][s.month]} {s.year}
                      </span>
                    </div>
                    <span className="font-semibold text-green-700">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming repayments */}
        <Card className="border-border/60 shadow-sm">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#0288D1]" /> Upcoming Repayments
            </p>
            <Link to="/member/repayments" className="text-xs text-[#C2185B] hover:underline">View all →</Link>
          </div>
          <CardContent>
            {repayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No repayments scheduled</p>
            ) : (
              <div className="space-y-2">
                {[...overdueEMIs, ...pendingEMIs].slice(0, 4).map((r) => (
                  <div key={r.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${r.status === "overdue" ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      {r.status === "overdue"
                        ? <AlertCircle className="w-4 h-4 text-red-500" />
                        : <Clock className="w-4 h-4 text-amber-500" />
                      }
                      <span className={r.status === "overdue" ? "text-red-600 text-xs" : "text-muted-foreground text-xs"}>
                        Due {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <span className="font-medium">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}