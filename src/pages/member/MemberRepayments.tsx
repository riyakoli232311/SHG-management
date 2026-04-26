// src/pages/member/MemberRepayments.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DSpinner, DBadge, DEmpty } from "@/components/ui/dark";
import { CheckCircle2, AlertCircle, Clock, BadgeCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { repaymentsApi } from "@/lib/api";
import { toast } from "sonner";

type Tab = "pending" | "overdue" | "history";

export default function MemberRepayments() {
  const { user } = useAuth();
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");

  useEffect(() => {
    if (!user?.id) return;
    repaymentsApi.list({ member_id: user.id }).then(res => setRepayments(res.data || [])).catch(() => toast.error("Failed to load repayments")).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  const pending = repayments.filter(r => r.status === "pending");
  const overdue = repayments.filter(r => r.status === "overdue");
  const paid    = repayments.filter(r => r.status === "paid");
  const totalPaid    = paid.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalPending = pending.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalOverdue = overdue.reduce((s, r) => s + Number(r.emi_amount), 0);
  const displayList  = tab === "pending" ? pending : tab === "overdue" ? overdue : paid;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  return (
    <DashboardLayout>
      <PageHeader title="My Repayments" subtitle="Track your EMI payments and schedule" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: BadgeCheck,    color: "#10B981", label: "Paid",    value: `₹${totalPaid.toLocaleString("en-IN")}`,    sub: `${paid.length} EMIs` },
          { icon: Clock,         color: "#F59E0B", label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}`, sub: `${pending.length} EMIs` },
          { icon: AlertTriangle, color: "#EF4444", label: "Overdue", value: `₹${totalOverdue.toLocaleString("en-IN")}`, sub: `${overdue.length} EMIs` },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <DCard key={label} className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}><Icon className="w-4 h-4" style={{ color }} /></div>
              <div><p className="text-xs text-white/30 uppercase tracking-wider">{label}</p><p className="text-lg font-black text-white leading-tight">{value}</p><p className="text-xs text-white/30">{sub}</p></div>
            </div>
          </DCard>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-white">You have {overdue.length} overdue EMI{overdue.length > 1 ? "s" : ""} — please contact your SHG leader.</p>
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {([
          { key: "pending" as Tab, label: `Pending (${pending.length})` },
          { key: "overdue" as Tab, label: `Overdue (${overdue.length})`, alert: overdue.length > 0 },
          { key: "history" as Tab, label: `Paid (${paid.length})` },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: tab === t.key ? (t.alert ? "rgba(239,68,68,0.15)" : "rgba(194,24,91,0.2)") : "transparent", color: tab === t.key ? (t.alert ? "#f87171" : "#C2185B") : "rgba(255,255,255,0.35)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <DCard>
        {displayList.length === 0 ? (
          <div className="py-20">
            {tab === "overdue"  && <DEmpty icon={CheckCircle2} title="No overdue EMIs — great!" />}
            {tab === "pending"  && <DEmpty icon={Clock}        title="No pending EMIs" />}
            {tab === "history"  && <DEmpty icon={CheckCircle2} title="No payments recorded yet" />}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Due Date","EMI Amount","Status","Paid On"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {displayList.map(r => (
                    <tr key={r.id} className="hover:bg-white/3 transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: r.status === "overdue" ? "rgba(239,68,68,0.04)" : "transparent" }}>
                      <td className="px-4 py-3 text-sm text-white/40">{fmtDate(r.due_date)}</td>
                      <td className="px-4 py-3 font-black text-white">₹{Number(r.emi_amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <DBadge variant={r.status === "paid" ? "green" : r.status === "overdue" ? "red" : "amber"}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </DBadge>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35">{r.paid_date ? fmtDate(r.paid_date) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 flex justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm text-white/30">{displayList.length} records</span>
              <span className="font-black" style={{ color: "#C2185B" }}>₹{displayList.reduce((s,r)=>s+Number(r.emi_amount),0).toLocaleString("en-IN")}</span>
            </div>
          </>
        )}
      </DCard>
    </DashboardLayout>
  );
}