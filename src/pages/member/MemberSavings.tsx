// src/pages/member/MemberSavings.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DSpinner, DBadge, DEmpty } from "@/components/ui/dark";
import { PiggyBank, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { savingsApi } from "@/lib/api";
import { toast } from "sonner";

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MemberSavings() {
  const { user } = useAuth();
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    savingsApi.list({ member_id: user.id }).then(res => setSavings(res.data || [])).catch(() => toast.error("Failed to load savings")).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  const total = savings.reduce((s, r) => s + Number(r.amount), 0);
  const avg = savings.length ? Math.round(total / savings.length) : 0;
  const thisYear = new Date().getFullYear();
  const thisYearSavings = savings.filter(s => s.year === thisYear).reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <DashboardLayout>
      <PageHeader title="My Savings" subtitle="Your monthly contribution history" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: PiggyBank,  color: "#C2185B", label: "Total Savings",   value: `₹${total.toLocaleString("en-IN")}`,          sub: `${savings.length} contributions` },
          { icon: Calendar,   color: "#7C3AED", label: "This Year",       value: `₹${thisYearSavings.toLocaleString("en-IN")}`, sub: String(thisYear) },
          { icon: TrendingUp, color: "#10B981", label: "Monthly Average", value: `₹${avg.toLocaleString("en-IN")}`,             sub: "per month" },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <DCard key={label} className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}><Icon className="w-4 h-4" style={{ color }} /></div>
              <div><p className="text-xs text-white/30 uppercase tracking-wider">{label}</p><p className="text-lg font-black text-white leading-tight">{value}</p><p className="text-xs text-white/30">{sub}</p></div>
            </div>
          </DCard>
        ))}
      </div>

      <DCard>
        <DCardHeader>
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><PiggyBank className="w-4 h-4 text-[#C2185B]" /> All Contributions</h3>
          <span className="text-xs text-white/30">{savings.length} entries</span>
        </DCardHeader>
        {savings.length === 0 ? (
          <div className="py-16"><DEmpty icon={PiggyBank} title="No savings recorded yet" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Month","Amount","Mode","Date"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {savings.map(s => (
                    <tr key={s.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{MONTH_NAMES[s.month]} {s.year}</td>
                      <td className="px-4 py-3 font-black text-emerald-400">₹{Number(s.amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><DBadge variant="gray">{s.payment_mode}</DBadge></td>
                      <td className="px-4 py-3 text-xs text-white/35">{s.date ? new Date(s.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 flex justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm text-white/30">Total</span>
              <span className="text-lg font-black" style={{ color: "#C2185B" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </>
        )}
      </DCard>
    </DashboardLayout>
  );
}