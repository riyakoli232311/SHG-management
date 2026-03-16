// src/pages/Repayments.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2, AlertCircle, Clock, IndianRupee,
  CalendarCheck, TrendingUp, AlertTriangle, BadgeCheck,
} from "lucide-react";
import { repaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Tab = "pending" | "overdue" | "history";

export default function Repayments() {
  const [allRepayments, setAllRepayments] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState<Tab>("pending");

  // Pay confirm dialog
  const [payTarget, setPayTarget]   = useState<any | null>(null);
  const [paying, setPaying]         = useState(false);
  const [payDate, setPayDate]       = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const res = await repaymentsApi.list();
      setAllRepayments(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load repayments");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!payTarget) return;
    setPaying(true);
    try {
      await repaymentsApi.pay(payTarget.id, payDate);
      toast.success(`EMI marked as paid for ${payTarget.member_name}`);
      setPayTarget(null);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark payment");
    } finally {
      setPaying(false);
    }
  }

  // ── Derived data ──────────────────────────────────────────
  const pending  = allRepayments.filter(r => r.status === "pending");
  const overdue  = allRepayments.filter(r => r.status === "overdue");
  const paid     = allRepayments.filter(r => r.status === "paid");

  const totalCollected  = paid.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalPending    = pending.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalOverdue    = overdue.reduce((s, r) => s + Number(r.emi_amount), 0);

  // Due this month
  const now = new Date();
  const dueThisMonth = allRepayments.filter(r => {
    const d = new Date(r.due_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      && r.status !== "paid";
  });

  const displayList = tab === "pending" ? pending : tab === "overdue" ? overdue : paid;

  // ── Row component ─────────────────────────────────────────
  function RepRow({ r }: { r: any }) {
    const isActionable = r.status === "pending" || r.status === "overdue";
    return (
      <TableRow className={`hover:bg-gray-50/50 ${r.status === "overdue" ? "bg-red-50/30" : ""}`}>
        <TableCell>
          <Link to={`/members/${r.member_id}`}
            className="font-medium text-gray-900 hover:text-[#C2185B] transition-colors">
            {r.member_name}
          </Link>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </TableCell>
        <TableCell>
          <span className="font-semibold text-gray-900">
            ₹{Number(r.emi_amount).toLocaleString("en-IN")}
          </span>
        </TableCell>
        <TableCell>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
            r.status === "paid"    ? "bg-green-100 text-green-700" :
            r.status === "overdue" ? "bg-red-100 text-red-600" :
            "bg-amber-100 text-amber-700"
          }`}>
            {r.status === "paid"    && <CheckCircle2 className="w-3 h-3" />}
            {r.status === "overdue" && <AlertCircle  className="w-3 h-3" />}
            {r.status === "pending" && <Clock        className="w-3 h-3" />}
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {r.paid_date
            ? new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "—"}
        </TableCell>
        <TableCell>
          {isActionable && (
            <Button
              size="sm"
              onClick={() => { setPayTarget(r); setPayDate(new Date().toISOString().split("T")[0]); }}
              className="bg-[#C2185B] hover:bg-[#AD1457] text-white h-7 text-xs px-3"
            >
              Mark Paid
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Repayments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track EMI collections across all active loans</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BadgeCheck,    color: "#388E3C", label: "Total Collected",  value: `₹${totalCollected.toLocaleString("en-IN")}`,  sub: `${paid.length} EMIs paid` },
          { icon: Clock,         color: "#F57C00", label: "Pending",          value: `₹${totalPending.toLocaleString("en-IN")}`,    sub: `${pending.length} EMIs due` },
          { icon: AlertTriangle, color: "#D32F2F", label: "Overdue",          value: `₹${totalOverdue.toLocaleString("en-IN")}`,   sub: `${overdue.length} EMIs overdue` },
          { icon: CalendarCheck, color: "#6A1B9A", label: "Due This Month",   value: dueThisMonth.length,                           sub: `EMIs to collect` },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <Card key={label} className={`border-border/60 shadow-sm ${label === "Overdue" && overdue.length > 0 ? "border-red-200" : ""}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15` }}>
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

      {/* Overdue alert banner */}
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdue.length} overdue EMI{overdue.length > 1 ? "s" : ""} need immediate attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Total overdue: ₹{totalOverdue.toLocaleString("en-IN")} · 
              Members: {[...new Set(overdue.map(r => r.member_name))].join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: "pending",  label: `Pending (${pending.length})` },
          { key: "overdue",  label: `Overdue (${overdue.length})` },
          { key: "history",  label: `History (${paid.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white shadow text-[#C2185B]" : "text-muted-foreground hover:text-foreground"
            } ${t.key === "overdue" && overdue.length > 0 ? "text-red-500" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="pt-0">
          {displayList.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              {tab === "pending"  && <><Clock className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No pending EMIs</p></>}
              {tab === "overdue"  && <><AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20 text-green-500" /><p className="text-green-600 font-medium">No overdue EMIs — great!</p></>}
              {tab === "history"  && <><CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No payments recorded yet</p></>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Member</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>EMI Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid On</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayList.map(r => <RepRow key={r.id} r={r} />)}
                  </TableBody>
                </Table>
              </div>

              {/* Footer totals */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {displayList.length} {tab === "history" ? "payments" : "EMIs"}
                </span>
                <span className="text-base font-bold text-[#C2185B]">
                  ₹{displayList.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mark Paid Dialog */}
      <Dialog open={!!payTarget} onOpenChange={o => !o && setPayTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Mark EMI as Paid
            </DialogTitle>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-4 py-1">
              {/* Summary */}
              <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member</span>
                  <span className="font-medium">{payTarget.member_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">
                    {new Date(payTarget.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-[#C2185B]">₹{Number(payTarget.emi_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment date */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C2185B]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setPayTarget(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePay} disabled={paying}
                >
                  {paying ? "Saving..." : "Confirm Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}