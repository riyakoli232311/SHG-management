// src/pages/member/MemberRepayments.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertCircle, Clock, BadgeCheck, AlertTriangle, IndianRupee } from "lucide-react";
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
    async function load() {
      try {
        const res = await repaymentsApi.list({ member_id: user!.id });
        setRepayments(res.data || []);
      } catch (err: any) {
        toast.error("Failed to load repayments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const pending = repayments.filter((r) => r.status === "pending");
  const overdue = repayments.filter((r) => r.status === "overdue");
  const paid = repayments.filter((r) => r.status === "paid");

  const totalPaid = paid.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalPending = pending.reduce((s, r) => s + Number(r.emi_amount), 0);
  const totalOverdue = overdue.reduce((s, r) => s + Number(r.emi_amount), 0);

  const displayList = tab === "pending" ? pending : tab === "overdue" ? overdue : paid;

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Repayments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your EMI payments and schedule</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: BadgeCheck,    color: "#388E3C", label: "Paid",    value: `₹${totalPaid.toLocaleString("en-IN")}`,    sub: `${paid.length} EMIs` },
          { icon: Clock,         color: "#F57C00", label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}`, sub: `${pending.length} EMIs` },
          { icon: AlertTriangle, color: "#D32F2F", label: "Overdue", value: `₹${totalOverdue.toLocaleString("en-IN")}`, sub: `${overdue.length} EMIs` },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <Card key={label} className={`border-border/60 shadow-sm ${label === "Overdue" && overdue.length > 0 ? "border-red-200" : ""}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-700">
            You have {overdue.length} overdue EMI{overdue.length > 1 ? "s" : ""} — please contact your SHG leader.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "overdue", label: `Overdue (${overdue.length})` },
          { key: "history", label: `Paid (${paid.length})` },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white shadow text-[#C2185B]" : "text-muted-foreground hover:text-foreground"
            } ${t.key === "overdue" && overdue.length > 0 ? "text-red-500" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-0">
          {displayList.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {tab === "overdue" && <><CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" /><p className="text-green-600 font-medium">No overdue EMIs!</p></>}
              {tab === "pending" && <><Clock className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No pending EMIs</p></>}
              {tab === "history" && <><CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No payments recorded yet</p></>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayList.map((r) => (
                    <TableRow key={r.id} className={r.status === "overdue" ? "bg-red-50/30" : ""}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="font-semibold">₹{Number(r.emi_amount).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          r.status === "paid" ? "bg-green-100 text-green-700" :
                          r.status === "overdue" ? "bg-red-100 text-red-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {r.status === "paid" && <CheckCircle2 className="w-3 h-3" />}
                          {r.status === "overdue" && <AlertCircle className="w-3 h-3" />}
                          {r.status === "pending" && <Clock className="w-3 h-3" />}
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.paid_date ? new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex justify-between">
                <span className="text-sm text-muted-foreground">{displayList.length} records</span>
                <span className="font-bold text-[#C2185B]">
                  ₹{displayList.reduce((s, r) => s + Number(r.emi_amount), 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}