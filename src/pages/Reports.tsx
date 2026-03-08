// src/pages/Reports.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts";
import {
  Users, PiggyBank, Landmark, CalendarCheck,
  TrendingUp, BadgeCheck, AlertCircle, Activity,
} from "lucide-react";
import { dashboardApi, savingsApi, loansApi, repaymentsApi, membersApi } from "@/lib/api";
import { toast } from "sonner";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS  = ["#C2185B","#6A1B9A","#0288D1","#F57C00","#388E3C","#00897B","#AD1457","#7B1FA2"];

// ── Custom tooltip ────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = "₹" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function Reports() {
  const [stats, setStats]         = useState<any>(null);
  const [savings, setSavings]     = useState<any[]>([]);
  const [loans, setLoans]         = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [members, setMembers]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [dashRes, savRes, loanRes, repRes, memRes] = await Promise.all([
        dashboardApi.get(),
        savingsApi.list(),
        loansApi.list(),
        repaymentsApi.list(),
        membersApi.list(),
      ]);
      setStats(dashRes.data);
      setSavings(savRes.data || []);
      setLoans(loanRes.data || []);
      setRepayments(repRes.data || []);
      setMembers(memRes.data || []);
    } catch (err: any) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  // ── Derived chart data ────────────────────────────────────

  // Monthly savings trend (last 14 months)
  const savingsByMonth: Record<string, number> = {};
  savings.forEach(s => {
    const key = `${MONTHS[s.month - 1]} ${String(s.year).slice(2)}`;
    savingsByMonth[key] = (savingsByMonth[key] || 0) + Number(s.amount);
  });
  const savingsTrend = Object.entries(savingsByMonth)
    .sort((a, b) => {
      const [am, ay] = a[0].split(" ");
      const [bm, by] = b[0].split(" ");
      return (Number(ay) * 12 + MONTHS.indexOf(am)) - (Number(by) * 12 + MONTHS.indexOf(bm));
    })
    .slice(-12)
    .map(([month, amount]) => ({ month, amount }));

  // Loan disbursals by month
  const loansByMonth: Record<string, number> = {};
  loans.forEach(l => {
    if (!l.disbursed_date) return;
    const d = new Date(l.disbursed_date);
    const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    loansByMonth[key] = (loansByMonth[key] || 0) + Number(l.loan_amount);
  });
  const loansTrend = Object.entries(loansByMonth)
    .sort((a, b) => {
      const [am, ay] = a[0].split(" ");
      const [bm, by] = b[0].split(" ");
      return (Number(ay) * 12 + MONTHS.indexOf(am)) - (Number(by) * 12 + MONTHS.indexOf(bm));
    })
    .slice(-12)
    .map(([month, amount]) => ({ month, amount }));

  // Loan purpose breakdown (pie)
  const purposeMap: Record<string, number> = {};
  loans.forEach(l => {
    const p = l.purpose || "Other";
    purposeMap[p] = (purposeMap[p] || 0) + 1;
  });
  const purposePie = Object.entries(purposeMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Repayment status breakdown (pie)
  const statusMap = { paid: 0, pending: 0, overdue: 0 };
  repayments.forEach(r => { statusMap[r.status as keyof typeof statusMap]++; });
  const repaymentPie = [
    { name: "Paid",    value: statusMap.paid,    color: "#388E3C" },
    { name: "Pending", value: statusMap.pending, color: "#F57C00" },
    { name: "Overdue", value: statusMap.overdue, color: "#D32F2F" },
  ].filter(d => d.value > 0);

  // Loan status breakdown
  const loanStatusMap = { active: 0, closed: 0, overdue: 0 };
  loans.forEach(l => { loanStatusMap[l.status as keyof typeof loanStatusMap]++; });

  // Member savings leaderboard (top 8)
  const memberSavingsMap: Record<string, { name: string; total: number }> = {};
  savings.forEach(s => {
    if (!memberSavingsMap[s.member_id]) {
      memberSavingsMap[s.member_id] = { name: s.member_name || "Member", total: 0 };
    }
    memberSavingsMap[s.member_id].total += Number(s.amount);
  });
  const leaderboard = Object.values(memberSavingsMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(m => ({ name: m.name.split(" ")[0], total: m.total }));

  // Caste distribution
  const casteMap: Record<string, number> = {};
  members.forEach(m => { casteMap[m.caste_category || "unknown"]++; });
  const castePie = Object.entries(casteMap).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Collection rate per month
  const collectionRate = savingsTrend.map(s => ({
    month: s.month,
    rate: members.length > 0 ? Math.min(100, Math.round((s.amount / (members.length * 500)) * 100)) : 0,
  }));

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Financial analytics and trends for your SHG</p>
      </div>

      {/* ── Summary stat cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: Users,       color: "#C2185B", label: "Total Members",        value: stats?.totalMembers ?? 0,                                                           sub: `${stats?.activeMembers ?? 0} active` },
          { icon: PiggyBank,   color: "#6A1B9A", label: "Total Savings",        value: `₹${Number(stats?.totalSavings ?? 0).toLocaleString("en-IN")}`,                    sub: `Avg ₹${Number(stats?.averageSavingsPerMember ?? 0).toLocaleString("en-IN")}/member` },
          { icon: Landmark,    color: "#0288D1", label: "Loans Disbursed",      value: `₹${Number(stats?.totalLoansDisbursed ?? 0).toLocaleString("en-IN")}`,             sub: `${loans.length} total loans` },
          { icon: BadgeCheck,  color: "#388E3C", label: "Repayments Collected", value: `₹${Number(stats?.totalRepaymentsCollected ?? 0).toLocaleString("en-IN")}`,        sub: `${statusMap.paid} EMIs paid` },
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
                  <p className="text-xs font-medium mt-0.5" style={{ color }}>{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 1: Savings trend + Loan disbursals ─────────── */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">

        {/* Savings trend */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#6A1B9A]" /> Monthly Savings Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {savingsTrend.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={savingsTrend} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" name="Savings" fill="#6A1B9A" radius={[6,6,0,0]}
                    background={{ fill: "#f9f9f9", radius: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Loan disbursals */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#0288D1]" /> Loan Disbursals by Month
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loansTrend.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No loans yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={loansTrend} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="amount" name="Disbursed" fill="#0288D1" radius={[6,6,0,0]}
                    background={{ fill: "#f9f9f9", radius: 6 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Collection rate line + Member leaderboard ── */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">

        {/* Collection rate */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C2185B]" /> Monthly Collection Rate (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {collectionRate.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={collectionRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip prefix="" />} />
                  <Line type="monotone" dataKey="rate" name="Collection %" stroke="#C2185B"
                    strokeWidth={2.5} dot={{ fill: "#C2185B", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Member savings leaderboard */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#388E3C]" /> Top Savers
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leaderboard} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151" }}
                    axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="total" name="Total Savings" fill="#388E3C" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Pies + Loan status ─────────────────────── */}
      <div className="grid md:grid-cols-3 gap-5 mb-5">

        {/* Repayment status pie */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#388E3C]" /> Repayment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {repaymentPie.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No EMIs yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={repaymentPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {repaymentPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} EMIs`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {repaymentPie.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Loan purpose pie */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#0288D1]" /> Loan Purposes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {purposePie.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No loans yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={purposePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {purposePie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v} loans`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {purposePie.slice(0, 4).map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 truncate max-w-[120px]">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Caste distribution */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C2185B]" /> Member Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {castePie.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={castePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {castePie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v} members`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {castePie.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Loan portfolio summary ─────────────────── */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6A1B9A]" /> Loan Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Total Loans",       value: loans.length,                                                                  color: "#6A1B9A" },
              { label: "Active",            value: loanStatusMap.active,                                                          color: "#0288D1" },
              { label: "Closed",            value: loanStatusMap.closed,                                                          color: "#388E3C" },
              { label: "Overdue",           value: loanStatusMap.overdue,                                                         color: "#D32F2F" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Per-member loan table */}
          {loans.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Member</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Amount</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Purpose</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Status</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Disbursed</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="py-2 font-medium text-gray-900">{l.member_name}</td>
                      <td className="py-2 text-right font-semibold">₹{Number(l.loan_amount).toLocaleString("en-IN")}</td>
                      <td className="py-2 text-muted-foreground truncate max-w-[120px]">{l.purpose || "—"}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          l.status === "closed"  ? "bg-green-100 text-green-700" :
                          l.status === "overdue" ? "bg-red-100 text-red-600" :
                          "bg-blue-100 text-blue-700"}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {l.disbursed_date ? new Date(l.disbursed_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </DashboardLayout>
  );
}