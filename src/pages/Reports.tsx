// src/pages/Reports.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DSpinner, DBadge } from "@/components/ui/dark";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Users, PiggyBank, Landmark, CalendarCheck, TrendingUp, BadgeCheck, Activity } from "lucide-react";
import { dashboardApi, savingsApi, loansApi, repaymentsApi, membersApi } from "@/lib/api";
import { toast } from "sonner";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#C2185B","#7C3AED","#0288D1","#F57C00","#10B981","#00897B","#AD1457","#7B1FA2"];

function DarkTooltip({ active, payload, label, prefix = "₹" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm shadow-xl" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="font-bold text-white/60 mb-1 text-xs">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {prefix}{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  return (
    <DCard>
      <DCardHeader>
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: iconColor }} />{title}</h3>
      </DCardHeader>
      <div className="p-5">{children}</div>
    </DCard>
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
      const [dashRes, savRes, loanRes, repRes, memRes] = await Promise.all([dashboardApi.get(), savingsApi.list(), loansApi.list(), repaymentsApi.list(), membersApi.list()]);
      setStats(dashRes.data); setSavings(savRes.data || []); setLoans(loanRes.data || []); setRepayments(repRes.data || []); setMembers(memRes.data || []);
    } catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  }

  // Chart data derivations
  const savingsByMonth: Record<string, number> = {};
  savings.forEach(s => { const key = `${MONTHS[s.month - 1]} ${String(s.year).slice(2)}`; savingsByMonth[key] = (savingsByMonth[key] || 0) + Number(s.amount); });
  const savingsTrend = Object.entries(savingsByMonth).sort((a, b) => { const [am,ay]=a[0].split(" "), [bm,by]=b[0].split(" "); return (Number(ay)*12+MONTHS.indexOf(am))-(Number(by)*12+MONTHS.indexOf(bm)); }).slice(-12).map(([month, amount]) => ({ month, amount }));

  const loansByMonth: Record<string, number> = {};
  loans.forEach(l => { if(!l.disbursed_date) return; const d=new Date(l.disbursed_date), key=`${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; loansByMonth[key]=(loansByMonth[key]||0)+Number(l.loan_amount); });
  const loansTrend = Object.entries(loansByMonth).sort((a,b)=>{const[am,ay]=a[0].split(" "),[bm,by]=b[0].split(" ");return(Number(ay)*12+MONTHS.indexOf(am))-(Number(by)*12+MONTHS.indexOf(bm));}).slice(-12).map(([month,amount])=>({month,amount}));

  const purposeMap: Record<string, number> = {};
  loans.forEach(l => { purposeMap[l.purpose||"Other"]=(purposeMap[l.purpose||"Other"]||0)+1; });
  const purposePie = Object.entries(purposeMap).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));

  const statusMap = { paid: 0, pending: 0, overdue: 0 };
  repayments.forEach(r => { statusMap[r.status as keyof typeof statusMap]++; });
  const repaymentPie = [
    { name: "Paid",    value: statusMap.paid,    color: "#10B981" },
    { name: "Pending", value: statusMap.pending, color: "#F59E0B" },
    { name: "Overdue", value: statusMap.overdue, color: "#EF4444" },
  ].filter(d => d.value > 0);

  const loanStatusMap = { active: 0, closed: 0, overdue: 0 };
  loans.forEach(l => { loanStatusMap[l.status as keyof typeof loanStatusMap]++; });

  const memberSavingsMap: Record<string, { name: string; total: number }> = {};
  savings.forEach(s => { if(!memberSavingsMap[s.member_id]) memberSavingsMap[s.member_id]={name:s.member_name||"Member",total:0}; memberSavingsMap[s.member_id].total+=Number(s.amount); });
  const leaderboard = Object.values(memberSavingsMap).sort((a,b)=>b.total-a.total).slice(0,8).map(m=>({name:m.name.split(" ")[0],total:m.total}));

  const casteMap: Record<string, number> = {};
  members.forEach(m => { casteMap[m.caste_category||"unknown"]++; });
  const castePie = Object.entries(casteMap).map(([name,value])=>({name:name.toUpperCase(),value}));

  const collectionRate = savingsTrend.map(s=>({ month:s.month, rate:members.length>0?Math.min(100,Math.round((s.amount/(members.length*500))*100)):0 }));

  const AXIS_STYLE = { fontSize: 11, fill: "rgba(255,255,255,0.3)" };

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Reports & Insights" subtitle="Financial analytics and trends for your SHG" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: Users,      color: "#C2185B", label: "Total Members",        value: stats?.totalMembers ?? 0,                                                           sub: `${stats?.activeMembers ?? 0} active` },
          { icon: PiggyBank,  color: "#7C3AED", label: "Total Savings",        value: `₹${Number(stats?.totalSavings ?? 0).toLocaleString("en-IN")}`,                    sub: `Avg ₹${Number(stats?.averageSavingsPerMember ?? 0).toLocaleString("en-IN")}/member` },
          { icon: Landmark,   color: "#0288D1", label: "Loans Disbursed",      value: `₹${Number(stats?.totalLoansDisbursed ?? 0).toLocaleString("en-IN")}`,             sub: `${loans.length} total loans` },
          { icon: BadgeCheck, color: "#10B981", label: "Repayments Collected", value: `₹${Number(stats?.totalRepaymentsCollected ?? 0).toLocaleString("en-IN")}`,        sub: `${statusMap.paid} EMIs paid` },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <DCard key={label} className="p-5 hover:border-white/12 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}><Icon className="w-4 h-4" style={{ color }} /></div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white leading-tight">{value}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color }}>{sub}</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Monthly Savings Trend" icon={PiggyBank} iconColor="#7C3AED">
          {savingsTrend.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={savingsTrend} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="amount" name="Savings" fill="#7C3AED" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Loan Disbursals by Month" icon={Landmark} iconColor="#0288D1">
          {loansTrend.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No loans yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={loansTrend} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="amount" name="Disbursed" fill="#0288D1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Monthly Collection Rate (%)" icon={Activity} iconColor="#C2185B">
          {collectionRate.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={collectionRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip content={<DarkTooltip prefix="" />} />
                <Line type="monotone" dataKey="rate" name="Collection %" stroke="#C2185B" strokeWidth={2.5} dot={{ fill:"#C2185B", r:4 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Savers" icon={TrendingUp} iconColor="#10B981">
          {leaderboard.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaderboard} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ ...AXIS_STYLE, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="total" name="Total Savings" fill="#10B981" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Pie charts row */}
      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Repayment Status */}
        <ChartCard title="Repayment Status" icon={CalendarCheck} iconColor="#10B981">
          {repaymentPie.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No EMIs yet</p> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={repaymentPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {repaymentPie.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v:any) => [`${v} EMIs`,""]} contentStyle={{ background:"#0a041a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {repaymentPie.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-white/40">{d.name}</span>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Loan Purposes */}
        <ChartCard title="Loan Purposes" icon={Landmark} iconColor="#0288D1">
          {purposePie.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No loans yet</p> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={purposePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {purposePie.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v:any,n:any) => [`${v} loans`,n]} contentStyle={{ background:"#0a041a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {purposePie.slice(0,4).map((d,i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i%COLORS.length] }} /><span className="text-white/40 truncate max-w-[120px]">{d.name}</span></div>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Member Categories */}
        <ChartCard title="Member Categories" icon={Users} iconColor="#C2185B">
          {castePie.length === 0 ? <p className="text-center text-white/30 py-10 text-sm">No data</p> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={castePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {castePie.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v:any,n:any) => [`${v} members`,n]} contentStyle={{ background:"#0a041a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {castePie.map((d,i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i%COLORS.length] }} /><span className="text-white/40">{d.name}</span></div>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Loan Portfolio Summary */}
      <DCard>
        <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-[#7C3AED]" />Loan Portfolio Summary</h3></DCardHeader>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Total Loans", value: loans.length,            color: "#7C3AED" },
              { label: "Active",      value: loanStatusMap.active,    color: "#0288D1" },
              { label: "Closed",      value: loanStatusMap.closed,    color: "#10B981" },
              { label: "Overdue",     value: loanStatusMap.overdue,   color: "#EF4444" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-xs text-white/30 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {loans.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Member","Amount","Purpose","Status","Disbursed"].map(h => <th key={h} className="pb-2 text-left text-[10px] font-bold uppercase tracking-widest text-white/25 px-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="py-2.5 px-2 font-bold text-white">{l.member_name}</td>
                      <td className="py-2.5 px-2 font-bold text-white">₹{Number(l.loan_amount).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-2 text-white/40 truncate max-w-[120px]">{l.purpose||"—"}</td>
                      <td className="py-2.5 px-2"><DBadge variant={l.status==="closed"?"green":l.status==="overdue"?"red":"blue"}>{l.status}</DBadge></td>
                      <td className="py-2.5 px-2 text-xs text-white/35">{l.disbursed_date?new Date(l.disbursed_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"}):"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DCard>
    </DashboardLayout>
  );
}