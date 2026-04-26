// src/pages/Repayments.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DBadge, DBtn, DSpinner, DEmpty } from "@/components/ui/dark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Clock, CalendarCheck, TrendingUp, AlertTriangle, BadgeCheck } from "lucide-react";
import { repaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type TabKey = "pending" | "overdue" | "history";

export default function Repayments() {
  const [allRepayments, setAllRepayments] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState<TabKey>("pending");
  const [payTarget, setPayTarget]         = useState<any | null>(null);
  const [paying, setPaying]               = useState(false);
  const [payDate, setPayDate]             = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { const res = await repaymentsApi.list(); setAllRepayments(res.data || []); }
    catch (err: any) { toast.error(err.message || "Failed to load repayments"); }
    finally { setLoading(false); }
  }

  async function handlePay() {
    if (!payTarget) return;
    setPaying(true);
    try { await repaymentsApi.pay(payTarget.id, payDate); toast.success(`EMI marked as paid for ${payTarget.member_name}`); setPayTarget(null); loadAll(); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setPaying(false); }
  }

  const pending = allRepayments.filter(r => r.status === "pending");
  const overdue = allRepayments.filter(r => r.status === "overdue");
  const paid    = allRepayments.filter(r => r.status === "paid");
  const totalCollected = paid.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalPending   = pending.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalOverdue   = overdue.reduce((s, r) => s + Number(r.emi_amount), 0);
  const now = new Date();
  const dueThisMonth = allRepayments.filter(r => { const d = new Date(r.due_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status !== "paid"; });
  const displayList = tab === "pending" ? pending : tab === "overdue" ? overdue : paid;

  const statusBadge = (s: string) => {
    if (s === "paid")    return <DBadge variant="green">Paid</DBadge>;
    if (s === "overdue") return <DBadge variant="red">Overdue</DBadge>;
    return <DBadge variant="amber">Pending</DBadge>;
  };

  const TABS = [
    { key: "pending" as TabKey,  label: `Pending (${pending.length})` },
    { key: "overdue" as TabKey,  label: `Overdue (${overdue.length})`, alert: overdue.length > 0 },
    { key: "history" as TabKey,  label: `History (${paid.length})` },
  ];

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Repayments" subtitle="Track EMI collections across all active loans" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BadgeCheck,    color: "#10B981", label: "Total Collected",  value: `₹${totalCollected.toLocaleString("en-IN")}`,  sub: `${paid.length} EMIs paid` },
          { icon: Clock,         color: "#F59E0B", label: "Pending",          value: `₹${totalPending.toLocaleString("en-IN")}`,    sub: `${pending.length} EMIs due` },
          { icon: AlertTriangle, color: "#EF4444", label: "Overdue",          value: `₹${totalOverdue.toLocaleString("en-IN")}`,   sub: `${overdue.length} EMIs overdue` },
          { icon: CalendarCheck, color: "#7C3AED", label: "Due This Month",   value: dueThisMonth.length,                          sub: "EMIs to collect" },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <DCard key={label} className="p-5 hover:border-white/12 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white leading-tight">{value}</p>
                <p className="text-xs text-white/30">{sub}</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">{overdue.length} overdue EMI{overdue.length > 1 ? "s" : ""} need immediate attention</p>
            <p className="text-xs text-red-400/80 mt-0.5">Total overdue: ₹{totalOverdue.toLocaleString("en-IN")} · Members: {[...new Set(overdue.map(r => r.member_name))].join(", ")}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: tab === t.key ? (t.alert ? "rgba(239,68,68,0.15)" : "rgba(194,24,91,0.2)") : "transparent", color: tab === t.key ? (t.alert ? "#f87171" : "#C2185B") : "rgba(255,255,255,0.35)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DCard>
        {displayList.length === 0 ? (
          <div className="py-20">
            {tab === "pending"  && <DEmpty icon={Clock}         title="No pending EMIs" />}
            {tab === "overdue"  && <DEmpty icon={CheckCircle2}  title="No overdue EMIs — great!" />}
            {tab === "history"  && <DEmpty icon={CheckCircle2}  title="No payments recorded yet" />}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Member","Due Date","EMI Amount","Status","Paid On",""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayList.map(r => (
                    <tr key={r.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: r.status === "overdue" ? "rgba(239,68,68,0.04)" : "transparent" }}>
                      <td className="px-4 py-3">
                        <Link to={`/members/${r.member_id}`} className="font-bold text-white hover:text-pink-300 transition-colors">{r.member_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/40">{new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="px-4 py-3 text-sm font-black text-white">₹{Number(r.emi_amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-xs text-white/35">{r.paid_date ? new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                      <td className="px-4 py-3">
                        {(r.status === "pending" || r.status === "overdue") && (
                          <button onClick={() => { setPayTarget(r); setPayDate(new Date().toISOString().split("T")[0]); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", color: "#fff" }}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm text-white/30">{displayList.length} {tab === "history" ? "payments" : "EMIs"}</span>
              <span className="text-base font-black" style={{ color: "#C2185B" }}>₹{displayList.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}</span>
            </div>
          </>
        )}
      </DCard>

      {/* Mark Paid Dialog */}
      <Dialog open={!!payTarget} onOpenChange={o => !o && setPayTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Mark EMI as Paid</DialogTitle></DialogHeader>
          {payTarget && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl p-4 space-y-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                {[["Member", payTarget.member_name], ["Due Date", new Date(payTarget.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })], ["Amount", `₹${Number(payTarget.emi_amount).toLocaleString("en-IN")}`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/35">{k}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Payment Date</p>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
              <div className="flex gap-3 pt-1">
                <DBtn variant="ghost" className="flex-1" onClick={() => setPayTarget(null)}>Cancel</DBtn>
                <DBtn variant="success" className="flex-1" onClick={handlePay} disabled={paying}>{paying ? "Saving…" : "Confirm Payment"}</DBtn>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}