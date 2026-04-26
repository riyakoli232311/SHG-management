// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Users, PiggyBank, Landmark, AlertCircle,
  Heart, CalendarCheck, CheckCircle2, Clock,
  Sparkles, Activity, BadgeCheck, Wallet,
  UserCheck, AlertTriangle, Plus, ChevronRight, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi, loansApi, savingsApi, membersApi, repaymentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MagicBento } from "@/components/MagicBento";

// ── Animation configs ──────────────────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const up = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

// ── Dark card wrapper ──────────────────────────────────────────
function DCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl border border-white/6 overflow-hidden ${className}`}
      style={{ background: "#0a041a", borderColor: "rgba(255,255,255,0.07)", ...style }}
    >
      {children}
    </div>
  );
}

// ── Tiny sparkline ─────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-end gap-0.5 h-7">
      {[20, 40, 55, 35, 70, 50, pct].map((h, i) => (
        <div key={i} className="w-1.5 rounded-sm transition-all"
          style={{ height: `${i === 6 ? Math.max(10, pct) : h}%`, backgroundColor: color, opacity: i === 6 ? 1 : 0.25 + i * 0.1 }} />
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, sparkMax }:
  { icon: any; label: string; value: string | number; sub: string; color: string; sparkMax?: number }) {
  return (
    <motion.div variants={up}>
      <DCard className="group hover:border-white/15 transition-all duration-300 h-full relative overflow-hidden">
        {/* Color bleed background */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{ background: `radial-gradient(circle at 30% 30%, ${color}12, transparent 70%)` }} />
        <div className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}18`, boxShadow: `0 0 0 1px ${color}22` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            {sparkMax !== undefined && (
              <MiniBar value={typeof value === "string" ? parseInt(value.replace(/\D/g, "")) || 0 : value} max={sparkMax} color={color} />
            )}
          </div>
          <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</p>
          {sub && <p className="text-xs mt-2 font-medium" style={{ color }}>{sub}</p>}
        </div>
      </DCard>
    </motion.div>
  );
}

// ── Progress ring ──────────────────────────────────────────────
function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease", filter: `drop-shadow(0 0 6px ${color}80)` }} />
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, shg } = useAuth();
  const [stats, setStats]               = useState<any>(null);
  const [members, setMembers]           = useState<any[]>([]);
  const [loans, setLoans]               = useState<any[]>([]);
  const [overdueEMIs, setOverdueEMIs]   = useState<any[]>([]);
  const [recentSavings, setRecentSavings] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [unseenSchemes, setUnseenSchemes] = useState(0);

  const today     = new Date();
  const monthName = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const hour      = today.getHours();
  const greeting  = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [dashRes, membersRes, loansRes, repRes, savRes] = await Promise.all([
        dashboardApi.get(), membersApi.list(), loansApi.list(),
        repaymentsApi.list({ status: "overdue" }),
        savingsApi.list({ month: today.getMonth() + 1, year: today.getFullYear() }),
      ]);
      setStats(dashRes.data);
      setMembers(membersRes.data || []);
      setLoans(loansRes.data || []);
      setOverdueEMIs((repRes.data || []).slice(0, 5));
      setRecentSavings(savRes.data || []);
      if (dashRes.data?.schemes?.length > 0) {
        const last = localStorage.getItem("lastVisitedSchemesTime");
        if (!last) { setUnseenSchemes(dashRes.data.schemes.length); }
        else {
          const t = parseInt(last, 10);
          setUnseenSchemes(dashRes.data.schemes.filter((s: any) => new Date(s.created_at).getTime() > t).length);
        }
      }
    } catch { toast.error("Failed to load dashboard"); }
    finally { setLoading(false); }
  }

  const handleSchemesClick = () => {
    setUnseenSchemes(0);
    localStorage.setItem("lastVisitedSchemesTime", Date.now().toString());
    setTimeout(() => document.getElementById("schemes-section")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const activeLoans      = loans.filter(l => l.status === "active");
  const overdueLoans     = loans.filter(l => l.status === "overdue");
  const closedLoans      = loans.filter(l => l.status === "closed");
  const totalOutstanding = activeLoans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const savingsThisMonth = recentSavings.reduce((s, r) => s + Number(r.amount), 0);
  const paidThisMonth    = new Set(recentSavings.map(r => r.member_id)).size;
  const collectionPct    = members.length > 0 ? Math.round((paidThisMonth / members.length) * 100) : 0;

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-[#C2185B]/20 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <motion.div variants={up}>
          <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 text-white"
            style={{ background: "linear-gradient(135deg, #C2185B 0%, #AD1457 40%, #6A1B9A 100%)" }}>
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 fill-yellow-300 text-yellow-300 animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">{greeting}, Sakhi!</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black mb-1.5 leading-tight drop-shadow-lg">
                  {shg?.name || user?.name || "Your SHG"}
                </h1>
                <p className="text-white/65 text-sm mb-5">
                  {shg?.village && `${shg.village} · `}{shg?.district && `${shg.district} · `}{monthName}
                </p>
                {/* Quick stats inline */}
                <div className="flex gap-6 flex-wrap p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                  {[
                    { label: "Members",       v: stats?.totalMembers ?? "—" },
                    { label: "Total Savings", v: stats?.totalSavings ? `₹${Number(stats.totalSavings).toLocaleString("en-IN")}` : "—" },
                    { label: "Active Loans",  v: activeLoans.length },
                  ].map(({ label, v }) => (
                    <div key={label}>
                      <p className="text-2xl font-black text-white">{v}</p>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 flex-wrap items-center shrink-0">
                <Button size="sm" variant="outline"
                  className="relative border-white/30 text-white hover:bg-white/20 bg-white/10 w-10 h-10 p-0 rounded-full"
                  onClick={handleSchemesClick}>
                  <Bell className="w-4 h-4" />
                  {unseenSchemes > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-[#C2185B]">
                      {unseenSchemes}
                    </span>
                  )}
                </Button>
                <Link to="/members"><Button size="sm" className="bg-white text-[#C2185B] hover:bg-white/90 font-bold rounded-full px-5 h-9 gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Member</Button></Link>
                <Link to="/loans"><Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/15 bg-white/8 rounded-full px-4 h-9 gap-1.5"><Landmark className="w-3.5 h-3.5" /> New Loan</Button></Link>
                <Link to="/savings"><Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/15 bg-white/8 rounded-full px-4 h-9 gap-1.5"><PiggyBank className="w-3.5 h-3.5" /> Saving</Button></Link>
              </div>
            </div>

            {/* Overdue alert strip */}
            {(stats?.overdueRepayments ?? 0) > 0 && (
              <div className="relative z-10 mt-5 flex items-center gap-3 bg-red-500/25 border border-red-400/30 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
                <p className="text-sm text-white font-semibold">{stats.overdueRepayments} overdue EMI{stats.overdueRepayments > 1 ? "s" : ""} need attention</p>
                <Link to="/repayments" className="ml-auto text-xs font-bold text-red-200 bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/40 transition-all">View →</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── 8 Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}         label="Total Members"      value={stats?.totalMembers ?? 0}                                                    color="#C2185B"  sub={`${stats?.activeMembers ?? 0} active`}         sparkMax={20} />
          <StatCard icon={PiggyBank}     label="Group Savings"      value={`₹${Number(stats?.totalSavings ?? 0).toLocaleString("en-IN")}`}              color="#7C3AED"  sub={`Avg ₹${Number(stats?.averageSavingsPerMember ?? 0).toLocaleString("en-IN")}/member`} />
          <StatCard icon={Landmark}      label="Loans Disbursed"    value={`₹${Number(stats?.totalLoansDisbursed ?? 0).toLocaleString("en-IN")}`}       color="#0288D1"  sub={`${activeLoans.length} active · ${closedLoans.length} closed`} />
          <StatCard icon={BadgeCheck}    label="Repayments"         value={`₹${Number(stats?.totalRepaymentsCollected ?? 0).toLocaleString("en-IN")}`}  color="#10B981"  sub={`${stats?.pendingRepayments ?? 0} pending`} />
          <StatCard icon={Wallet}        label="Outstanding"        value={`₹${totalOutstanding.toLocaleString("en-IN")}`}                             color="#F59E0B"  sub={`${activeLoans.length} loans active`} />
          <StatCard icon={CalendarCheck} label="Savings This Month" value={`₹${savingsThisMonth.toLocaleString("en-IN")}`}                             color="#8B5CF6"  sub={`${paidThisMonth}/${members.length} paid`} />
          <StatCard icon={AlertCircle}   label="Overdue EMIs"       value={stats?.overdueRepayments ?? 0}                                              color="#EF4444"  sub={stats?.overdueRepayments > 0 ? "Needs attention" : "All clear ✓"} />
          <StatCard icon={Activity}      label="Loans Closed"       value={closedLoans.length}                                                         color="#06B6D4"  sub="Fully repaid" sparkMax={10} />
        </div>

        {/* ── Savings Progress + MagicBento Navigation ────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Savings ring card */}
          <motion.div variants={up}>
            <DCard className="h-full">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">Collection</p>
                    <h3 className="text-base font-bold text-white">Savings This Month</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#C2185B", background: "rgba(194,24,91,0.12)" }}>{monthName}</span>
                </div>

                <div className="flex items-center gap-5 mb-5">
                  <Ring pct={collectionPct} color="#C2185B" size={80} />
                  <div>
                    <p className="text-4xl font-black text-white">{collectionPct}%</p>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-1">{paidThisMonth} of {members.length} paid</p>
                  </div>
                </div>

                <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${collectionPct}%`, background: "linear-gradient(90deg, #C2185B, #6A1B9A)", boxShadow: "0 0 12px rgba(194,24,91,0.4)" }} />
                </div>

                <Link to="/savings" className="mt-auto text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: "#C2185B" }}>
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </DCard>
          </motion.div>

          {/* MagicBento — full reference look */}
          <motion.div variants={up} className="lg:col-span-2">
            <DCard className="overflow-hidden h-full" style={{ padding: 0, background: "#060010" }}>
              <div className="px-5 pt-5 pb-1">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">Quick Navigation</p>
              </div>
              <MagicBento
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                glowColor="132, 0, 255"
                particleCount={12}
                spotlightRadius={300}
                textAutoHide={true}
              />
            </DCard>
          </motion.div>
        </div>

        {/* ── Active Loans + Admin / Schemes ──────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Active Loans */}
          <motion.div variants={up}>
            <DCard className="h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#0288D1]" /> Active Loans
                </h3>
                <Link to="/loans" className="text-xs font-bold hover:underline" style={{ color: "#0288D1" }}>View all →</Link>
              </div>
              {activeLoans.length === 0 ? (
                <div className="text-center py-10">
                  <Landmark className="w-8 h-8 mx-auto mb-2 text-white/10" />
                  <p className="text-sm text-white/30 font-medium">No active loans</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {[...overdueLoans, ...activeLoans].slice(0, 5).map(loan => (
                    <div key={loan.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/3 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
                        {loan.member_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{loan.member_name}</p>
                        <p className="text-xs text-white/40 capitalize">{loan.purpose || "General"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-white">₹{Number(loan.loan_amount).toLocaleString("en-IN")}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${loan.status === "overdue" ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-300"}`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DCard>
          </motion.div>

          <div className="space-y-5">
            {/* District Admin */}
            <motion.div variants={up}>
              <DCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none" style={{ background: "rgba(194,24,91,0.12)", transform: "translate(30%,-30%)" }} />
                <div className="p-5 flex items-center gap-4 relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 16px rgba(194,24,91,0.3)" }}>
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#C2185B" }}>District Admin</p>
                    <p className="text-base font-black text-white">{stats?.adminInfo?.name || "Unassigned"}</p>
                    <p className="text-sm text-white/40">{stats?.adminInfo?.phone_number || "Awaiting assignment"}</p>
                  </div>
                </div>
              </DCard>
            </motion.div>

            {/* Schemes */}
            <motion.div variants={up}>
              <DCard id="schemes-section" className="h-full">
                <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-white">Govt Schemes & Alerts</h3>
                </div>
                <div className="p-5 space-y-3">
                  {stats?.schemes?.length > 0 ? stats.schemes.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="p-4 rounded-xl border" style={{ background: "rgba(194,24,91,0.05)", borderColor: "rgba(194,24,91,0.15)" }}>
                      <h4 className="text-sm font-bold text-white mb-1.5">{s.title}</h4>
                      <p className="text-xs text-white/45 leading-relaxed mb-2">{s.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: "#C2185B", background: "rgba(194,24,91,0.12)" }}>News</span>
                        <span className="text-[10px] text-white/30 font-medium">{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-white/30 text-center py-4">No new scheme notifications.</p>
                  )}
                </div>
              </DCard>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}