// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Users, PiggyBank, Landmark, AlertCircle, Heart,
  CalendarCheck, CheckCircle2, Clock, Sparkles,
  Activity, BadgeCheck, Wallet, UserCheck, AlertTriangle,
  Plus, ChevronRight, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi, loansApi, savingsApi, membersApi, repaymentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Dark card primitives ──────────────────────────────────────
function DCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15 ${className}`}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", ...style }}
    >
      {children}
    </div>
  );
}

function DCardSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 pb-4 ${className}`}>{children}</div>;
}

function DCardTitle({ children, icon: Icon, iconColor, link }: { children: React.ReactNode; icon?: any; iconColor?: string; link?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: iconColor || "rgba(255,255,255,0.4)" }} />}
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{children}</p>
      {link && (
        <Link to={link} className="ml-auto text-[10px] font-bold text-[#C2185B] hover:underline">View all →</Link>
      )}
    </div>
  );
}

// ── Sparkline bar ─────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-end gap-0.5 h-7">
      {[20, 40, 55, 35, 70, 50, pct].map((h, i) => (
        <div key={i} className="w-2 rounded-sm transition-all"
          style={{ height: `${i === 6 ? pct : h}%`, backgroundColor: color,
            opacity: i === 6 ? 1 : 0.15 + i * 0.08 }} />
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, sparkMax }: {
  icon: any; label: string; value: string | number;
  sub: string; color: string; sparkMax?: number;
}) {
  return (
    <DCard>
      <DCardSection>
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {sparkMax !== undefined && (
            <MiniBar
              value={typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value}
              max={sparkMax} color={color}
            />
          )}
        </div>
        <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>
        {sub && <p className="text-xs font-semibold mt-0.5" style={{ color }}>{sub}</p>}
      </DCardSection>
    </DCard>
  );
}

// ── Progress ring ─────────────────────────────────────────────
function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, shg } = useAuth();
  const [stats, setStats]             = useState<any>(null);
  const [members, setMembers]         = useState<any[]>([]);
  const [loans, setLoans]             = useState<any[]>([]);
  const [overdueEMIs, setOverdueEMIs] = useState<any[]>([]);
  const [recentSavings, setRecentSavings] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [unseenSchemesCount, setUnseenSchemesCount] = useState(0);

  const today     = new Date();
  const monthName = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const hour      = today.getHours();
  const greeting  = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [dashRes, membersRes, loansRes, repRes, savRes] = await Promise.all([
        dashboardApi.get(),
        membersApi.list(),
        loansApi.list(),
        repaymentsApi.list({ status: "overdue" }),
        savingsApi.list({ month: today.getMonth() + 1, year: today.getFullYear() }),
      ]);
      setStats(dashRes.data);
      setMembers(membersRes.data || []);
      setLoans(loansRes.data || []);
      setOverdueEMIs((repRes.data || []).slice(0, 5));
      setRecentSavings(savRes.data || []);

      if (dashRes.data?.schemes?.length > 0) {
        const lastVisitedStr = localStorage.getItem("lastVisitedSchemesTime");
        if (!lastVisitedStr) {
          setUnseenSchemesCount(dashRes.data.schemes.length);
        } else {
          try {
            const lastVisitedTime = parseInt(lastVisitedStr, 10);
            const newSchemes = dashRes.data.schemes.filter(
              (s: any) => new Date(s.created_at).getTime() > lastVisitedTime
            );
            setUnseenSchemesCount(newSchemes.length);
          } catch { setUnseenSchemesCount(dashRes.data.schemes.length); }
        }
      }
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  }

  const handleSchemesClick = () => {
    setUnseenSchemesCount(0);
    localStorage.setItem("lastVisitedSchemesTime", new Date().getTime().toString());
    setTimeout(() => {
      document.getElementById("schemes-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const activeLoans       = loans.filter(l => l.status === "active");
  const overdueLoans      = loans.filter(l => l.status === "overdue");
  const closedLoans       = loans.filter(l => l.status === "closed");
  const totalOutstanding  = activeLoans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const savingsThisMonth  = recentSavings.reduce((s, r) => s + Number(r.amount), 0);
  const paidThisMonth     = new Set(recentSavings.map(r => r.member_id)).size;
  const collectionPct     = members.length > 0 ? Math.round((paidThisMonth / members.length) * 100) : 0;

  const purposeCount: Record<string, number> = {};
  loans.forEach(l => { const p = l.purpose || "Other"; purposeCount[p] = (purposeCount[p] || 0) + 1; });
  const topPurposes = Object.entries(purposeCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const roleCount = members.reduce((acc: any, m: any) => {
    acc[m.role] = (acc[m.role] || 0) + 1; return acc;
  }, {});

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-7 bg-gradient-to-br from-[#C2185B] via-[#AD1457] to-[#6A1B9A] p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 fill-[#FBC02D] text-[#FBC02D]" />
              <span className="text-white/80 text-sm">{greeting}, Sakhi!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">
              {shg?.name || user?.name || "Your SHG"}
            </h1>
            <p className="text-white/70 text-sm mb-4">
              {shg?.village && `${shg.village} · `}{shg?.district && `${shg.district} · `}{monthName}
            </p>
            <div className="flex gap-5 flex-wrap">
              {[
                { label: "Members",       value: stats?.totalMembers ?? "—" },
                { label: "Total Savings", value: stats?.totalSavings ? `₹${Number(stats.totalSavings).toLocaleString("en-IN")}` : "—" },
                { label: "Active Loans",  value: activeLoans.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 shrink-0 flex-wrap items-center">
            <Button size="sm" variant="outline"
              className="relative border-white/60 text-white hover:bg-white/20 bg-white/10 w-9 h-9 p-0 rounded-full"
              onClick={handleSchemesClick} title="Government Schemes">
              <Bell className="w-4 h-4" />
              {unseenSchemesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#C2185B]">
                  {unseenSchemesCount}
                </span>
              )}
            </Button>
            <Link to="/members">
              <Button size="sm" className="bg-white text-[#C2185B] hover:bg-white/90 font-semibold shadow-md gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Member
              </Button>
            </Link>
            <Link to="/loans">
              <Button size="sm" variant="outline" className="border-white/60 text-white hover:bg-white/20 gap-1.5 bg-white/10">
                <Landmark className="w-3.5 h-3.5" /> New Loan
              </Button>
            </Link>
            <Link to="/savings">
              <Button size="sm" variant="outline" className="border-white/60 text-white hover:bg-white/20 gap-1.5 bg-white/10">
                <PiggyBank className="w-3.5 h-3.5" /> Record Saving
              </Button>
            </Link>
          </div>
        </div>

        {(stats?.overdueRepayments ?? 0) > 0 && (
          <div className="relative z-10 mt-5 bg-red-500/20 border border-red-300/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-200 shrink-0" />
            <p className="text-sm text-red-100 font-medium">
              {stats.overdueRepayments} overdue EMI{stats.overdueRepayments > 1 ? "s" : ""} need attention
            </p>
            <Link to="/repayments" className="ml-auto text-xs text-red-200 underline underline-offset-2 hover:text-white">
              View →
            </Link>
          </div>
        )}
      </div>

      {/* ── 8 Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Users}         label="Total Members"        value={stats?.totalMembers ?? 0}                                                    color="#C2185B" sub={`${stats?.activeMembers ?? 0} active`}        sparkMax={20} />
        <StatCard icon={PiggyBank}     label="Group Savings"        value={`₹${Number(stats?.totalSavings ?? 0).toLocaleString("en-IN")}`}              color="#6A1B9A" sub={`Avg ₹${Number(stats?.averageSavingsPerMember ?? 0).toLocaleString("en-IN")}/member`} />
        <StatCard icon={Landmark}      label="Loans Disbursed"      value={`₹${Number(stats?.totalLoansDisbursed ?? 0).toLocaleString("en-IN")}`}       color="#0288D1" sub={`${activeLoans.length} active · ${closedLoans.length} closed`} />
        <StatCard icon={BadgeCheck}    label="Repayments Collected" value={`₹${Number(stats?.totalRepaymentsCollected ?? 0).toLocaleString("en-IN")}`}  color="#388E3C" sub={`${stats?.pendingRepayments ?? 0} pending EMIs`} />
        <StatCard icon={Wallet}        label="Outstanding Loans"    value={`₹${totalOutstanding.toLocaleString("en-IN")}`}                             color="#F57C00" sub={`${activeLoans.length} loans active`} />
        <StatCard icon={CalendarCheck} label="Savings This Month"   value={`₹${savingsThisMonth.toLocaleString("en-IN")}`}                             color="#7B1FA2" sub={`${paidThisMonth}/${members.length} members paid`} />
        <StatCard icon={AlertCircle}   label="Overdue EMIs"         value={stats?.overdueRepayments ?? 0}                                              color="#D32F2F" sub={stats?.overdueRepayments > 0 ? "Needs attention" : "All clear ✓"} />
        <StatCard icon={Activity}      label="Loans Closed"         value={closedLoans.length}                                                         color="#00897B" sub="Fully repaid" sparkMax={10} />
      </div>

      {/* ── Row: Collection + Repayment Health + Loan Split ─── */}
      <div className="grid md:grid-cols-3 gap-5 mb-7">

        <DCard>
          <DCardSection>
            <div className="flex items-center justify-between mb-3">
              <DCardTitle>Savings Collection</DCardTitle>
              <span className="text-[10px] text-white/25 font-medium -mt-3">{monthName}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-3xl font-bold text-white">{collectionPct}%</p>
                <p className="text-xs text-white/30 mt-0.5">{paidThisMonth} of {members.length} paid</p>
              </div>
              <Ring pct={collectionPct} color="#C2185B" size={60} />
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${collectionPct}%`, background: "linear-gradient(90deg,#C2185B,#6A1B9A)" }} />
            </div>
            <Link to="/savings" className="text-xs text-[#C2185B] hover:underline flex items-center gap-1 font-semibold">
              View details <ChevronRight className="w-3 h-3" />
            </Link>
          </DCardSection>
        </DCard>

        <DCard>
          <DCardSection>
            <DCardTitle>Repayment Health</DCardTitle>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold">
                  {(stats?.overdueRepayments ?? 0) > 0
                    ? <span className="text-red-400">{stats.overdueRepayments} overdue</span>
                    : <span className="text-emerald-400">All good ✓</span>}
                </p>
                <p className="text-xs text-white/30 mt-1">{stats?.pendingRepayments ?? 0} pending · {stats?.overdueRepayments ?? 0} overdue</p>
              </div>
              <Ring
                pct={stats?.overdueRepayments > 0 ? Math.max(10, 100 - stats.overdueRepayments * 15) : 100}
                color={stats?.overdueRepayments > 0 ? "#D32F2F" : "#388E3C"} size={60}
              />
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Paid",    count: loans.length * 2, color: "bg-emerald-400" },
                { label: "Pending", count: stats?.pendingRepayments ?? 0, color: "bg-amber-400" },
                { label: "Overdue", count: stats?.overdueRepayments ?? 0, color: "bg-red-400" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-white/30 w-14">{label}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
            <Link to="/repayments" className="text-xs text-[#C2185B] hover:underline flex items-center gap-1 font-semibold mt-3">
              Manage EMIs <ChevronRight className="w-3 h-3" />
            </Link>
          </DCardSection>
        </DCard>

        <DCard>
          <DCardSection>
            <DCardTitle>Loan Purpose Split</DCardTitle>
            {topPurposes.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">No loans yet</p>
            ) : (
              <div className="space-y-3 mt-1">
                {topPurposes.map(([purpose, count], i) => {
                  const pct = Math.round((count / loans.length) * 100);
                  const colors = ["#C2185B", "#6A1B9A", "#0288D1", "#F57C00"];
                  return (
                    <div key={purpose}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 font-semibold truncate max-w-[120px]">{purpose}</span>
                        <span className="text-white/30">{count} loan{count > 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/loans" className="text-xs text-[#C2185B] hover:underline flex items-center gap-1 font-semibold mt-4">
              View all loans <ChevronRight className="w-3 h-3" />
            </Link>
          </DCardSection>
        </DCard>
      </div>

      {/* ── Row: Active Loans + Overdue EMIs ────────────────── */}
      <div className="grid md:grid-cols-2 gap-5 mb-7">

        <DCard>
          <DCardSection>
            <DCardTitle icon={Landmark} iconColor="#0288D1" link="/loans">Active Loans</DCardTitle>
            {activeLoans.length === 0 ? (
              <div className="text-center py-6 text-white/25">
                <Landmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No active loans</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...overdueLoans, ...activeLoans].slice(0, 5).map(loan => (
                  <div key={loan.id} className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                      {loan.member_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{loan.member_name}</p>
                      <p className="text-xs text-white/30 truncate">{loan.purpose || "General"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">₹{Number(loan.loan_amount).toLocaleString("en-IN")}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        loan.status === "overdue"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-blue-500/10 text-blue-300"
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DCardSection>
        </DCard>

        <DCard style={overdueEMIs.length > 0 ? { borderColor: "rgba(239,68,68,0.15)" } : {}}>
          <DCardSection>
            <DCardTitle icon={AlertCircle} iconColor="#ef4444" link="/repayments">Overdue EMIs</DCardTitle>
            {overdueEMIs.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-semibold">No overdue EMIs!</p>
                <p className="text-xs text-white/25 mt-1">All collections are on track</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueEMIs.map(emi => (
                  <div key={emi.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(239,68,68,0.12)" }}>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{emi.member_name}</p>
                      <p className="text-xs text-red-400">
                        Due {new Date(emi.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-red-400 shrink-0">
                      ₹{Number(emi.emi_amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DCardSection>
        </DCard>
      </div>

      {/* ── Row: Members + Savings This Month ───────────────── */}
      <div className="grid md:grid-cols-2 gap-5 mb-7">

        <DCard>
          <DCardSection>
            <DCardTitle icon={Users} iconColor="#C2185B" link="/members">Members</DCardTitle>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { role: "president", label: "President", color: "#C2185B" },
                { role: "secretary", label: "Secretary", color: "#6A1B9A" },
                { role: "treasurer", label: "Treasurer", color: "#0288D1" },
                { role: "member",    label: "Members",   color: "#388E3C" },
              ].map(({ role, label, color }) => (
                <div key={role} className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-lg font-bold" style={{ color }}>{roleCount[role] ?? 0}</p>
                  <p className="text-[10px] text-white/30 leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {members.slice(0, 4).map(m => (
                <Link to={`/members/${m.id}`} key={m.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors group"
                  style={{ hover: { background: "rgba(255,255,255,0.03)" } }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-pink-300 transition-colors">{m.name}</p>
                    <p className="text-xs text-white/30 capitalize">{m.role} · {m.occupation || "—"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          </DCardSection>
        </DCard>

        <DCard>
          <DCardSection>
            <DCardTitle icon={PiggyBank} iconColor="#6A1B9A" link="/savings">
              Savings — {monthName}
            </DCardTitle>
            <div className="flex items-center gap-4 mb-4 p-3 rounded-xl"
              style={{ background: "rgba(194,24,91,0.07)", border: "1px solid rgba(194,24,91,0.12)" }}>
              <PiggyBank className="w-8 h-8 text-[#C2185B]" />
              <div>
                <p className="text-2xl font-bold text-white">₹{savingsThisMonth.toLocaleString("en-IN")}</p>
                <p className="text-xs text-white/30">collected this month</p>
              </div>
            </div>
            {recentSavings.length === 0 ? (
              <p className="text-sm text-white/25 text-center py-4">No savings recorded this month yet</p>
            ) : (
              <div className="space-y-2">
                {recentSavings.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm px-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white/70 font-medium">{s.member_name || "Member"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-white/30 capitalize px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.06)" }}>{s.payment_mode}</span>
                    </div>
                  </div>
                ))}
                {members.length - paidThisMonth > 0 && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {members.length - paidThisMonth} member{members.length - paidThisMonth > 1 ? "s" : ""} yet to pay
                  </p>
                )}
              </div>
            )}
          </DCardSection>
        </DCard>
      </div>

      {/* ── Row: Admin Info + Schemes + Quick Actions ────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        <div className="space-y-5">
          {stats?.adminInfo ? (
            <DCard>
              <DCardSection className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(194,24,91,0.12)" }}>
                    <UserCheck className="w-5 h-5 text-[#C2185B]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Your District Admin</p>
                    <p className="text-sm font-bold text-white">{stats.adminInfo.name}</p>
                    <p className="text-xs text-white/40">{stats.adminInfo.phone_number}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-[#C2185B]/70 uppercase tracking-wider hidden sm:block">
                  {shg?.district || "District"} Zone
                </p>
              </DCardSection>
            </DCard>
          ) : (
            <DCard>
              <DCardSection className="flex flex-col items-center justify-center text-center gap-2">
                <UserCheck className="w-6 h-6 text-white/20" />
                <div>
                  <p className="text-sm font-bold text-white/50">District Admin</p>
                  <p className="text-xs text-white/25">No admin assigned to {shg?.district || "your"} district yet.</p>
                </div>
              </DCardSection>
            </DCard>
          )}

          <DCard id="schemes-section" className="scroll-m-6">
            <DCardSection>
              <DCardTitle icon={Sparkles} iconColor="#F57C00">Government Schemes</DCardTitle>
              {stats?.schemes?.length > 0 ? (
                <div className="space-y-3">
                  {stats.schemes.slice(0, 3).map((scheme: any) => (
                    <div key={scheme.id} className="p-3 rounded-xl"
                      style={{ background: "rgba(245,124,0,0.07)", border: "1px solid rgba(245,124,0,0.12)" }}>
                      <p className="font-bold text-sm text-white mb-1">{scheme.title}</p>
                      <p className="text-xs text-white/40 line-clamp-2">{scheme.description}</p>
                      <p className="text-[10px] text-white/20 mt-2 font-semibold uppercase tracking-wide">
                        Posted {new Date(scheme.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/25 text-center py-4">No new scheme notifications for your district.</p>
              )}
            </DCardSection>
          </DCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 h-fit">
          {[
            { icon: UserCheck,     label: "Add Member",    sub: "Register a new member",   to: "/members",     color: "#C2185B" },
            { icon: PiggyBank,     label: "Record Saving", sub: "Log this month's saving", to: "/savings",     color: "#6A1B9A" },
            { icon: Landmark,      label: "Disburse Loan", sub: "Issue a new loan",        to: "/loans",       color: "#0288D1" },
            { icon: CalendarCheck, label: "Collect EMI",   sub: "Mark repayments",         to: "/repayments",  color: "#388E3C" },
          ].map(({ icon: Icon, label, sub, to, color }) => (
            <Link to={to} key={label} className="h-full">
              <DCard className="cursor-pointer group h-full hover:-translate-y-0.5">
                <DCardSection className="flex flex-col justify-center h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${color}18` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">{label}</p>
                  <p className="text-xs text-white/30">{sub}</p>
                </DCardSection>
              </DCard>
            </Link>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}