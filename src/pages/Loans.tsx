// src/pages/Loans.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Landmark, TrendingUp, AlertCircle, CheckCircle2,
  Clock, IndianRupee, Calendar, User, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { loansApi, membersApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// ── Constants ────────────────────────────────────────────────
const PURPOSES = [
  "Dairy Farming", "Vegetable Trading", "Tailoring", "Poultry",
  "Goat Rearing", "Pickle Making", "Papad Making", "Agarbatti Making",
  "Small Business", "Medical Emergency", "Child Education",
  "House Repair", "Agriculture", "Other",
];
const CURRENT_YEAR  = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const EMPTY_FORM = {
  member_id: "", loan_amount: "", interest_rate: "2",
  tenure_months: "12", purpose: "", disbursed_date: new Date().toISOString().split("T")[0],
};
type LoanForm = typeof EMPTY_FORM;

// EMI preview calculator
function calcEMI(principal: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

// ── New Loan Form — outside to prevent focus loss ────────────
function NewLoanForm({
  members, form, setForm,
}: {
  members: any[];
  form: LoanForm;
  setForm: React.Dispatch<React.SetStateAction<LoanForm>>;
}) {
  const emi = form.loan_amount && form.interest_rate && form.tenure_months
    ? calcEMI(Number(form.loan_amount), Number(form.interest_rate), Number(form.tenure_months))
    : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Member *</Label>
        <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>
            {members.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Purpose</Label>
        <Select value={form.purpose} onValueChange={v => setForm(f => ({ ...f, purpose: v }))}>
          <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
          <SelectContent>
            {PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Loan Amount (₹) *</Label>
          <Input type="number" placeholder="e.g. 10000"
            value={form.loan_amount} onChange={e => setForm(f => ({ ...f, loan_amount: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Interest Rate (% p.a.)</Label>
          <Input type="number" placeholder="e.g. 24"
            value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Tenure (months)</Label>
          <Input type="number" placeholder="e.g. 12"
            value={form.tenure_months} onChange={e => setForm(f => ({ ...f, tenure_months: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Disbursed Date</Label>
          <Input type="date" value={form.disbursed_date}
            onChange={e => setForm(f => ({ ...f, disbursed_date: e.target.value }))} />
        </div>
      </div>

      {/* EMI Preview */}
      {emi && (
        <div className="rounded-xl bg-gradient-to-r from-[#C2185B]/5 to-[#6A1B9A]/5 border border-[#C2185B]/10 p-4">
          <p className="text-xs text-muted-foreground mb-1">Monthly EMI (auto-calculated)</p>
          <p className="text-2xl font-bold text-[#C2185B]">₹{emi.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {form.tenure_months} EMIs · Total repayment ≈ ₹{(emi * Number(form.tenure_months)).toLocaleString("en-IN")}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Loan Card ─────────────────────────────────────────────────
function LoanCard({ loan, onClose }: { loan: any; onClose: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loadingRep, setLoadingRep] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  async function loadRepayments() {
    if (repayments.length > 0) { setExpanded(e => !e); return; }
    setLoadingRep(true);
    try {
      const res = await repaymentsApi.list({ loan_id: loan.id });
      setRepayments(res.data || []);
      setExpanded(true);
    } catch { toast.error("Failed to load EMIs"); }
    finally { setLoadingRep(false); }
  }

  async function handlePay(repId: string) {
    setPaying(repId);
    try {
      await repaymentsApi.pay(repId, new Date().toISOString().split("T")[0]);
      const res = await repaymentsApi.list({ loan_id: loan.id });
      setRepayments(res.data || []);
      toast.success("EMI marked as paid!");
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setPaying(null); }
  }

  const paid    = repayments.filter(r => r.status === "paid").length;
  const total   = repayments.length;
  const overdue = repayments.filter(r => r.status === "overdue").length;
  const pct     = total ? Math.round((paid / total) * 100) : 0;

  return (
    <Card className={`border-border/60 shadow-sm transition-all ${loan.status === "overdue" ? "border-red-200" : ""}`}>
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-bold shrink-0">
              {loan.member_name?.charAt(0) || "?"}
            </div>
            <div>
              <Link to={`/members/${loan.member_id}`}
                className="font-semibold text-gray-900 hover:text-[#C2185B] transition-colors">
                {loan.member_name}
              </Link>
              <p className="text-xs text-muted-foreground">{loan.purpose || "General Purpose"}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            loan.status === "active"  ? "bg-blue-100 text-blue-700" :
            loan.status === "closed"  ? "bg-green-100 text-green-700" :
            "bg-red-100 text-red-600"}`}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </span>
        </div>

        {/* Loan details grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Loan Amount",  value: `₹${Number(loan.loan_amount).toLocaleString("en-IN")}` },
            { label: "Interest",     value: `${loan.interest_rate}% p.a.` },
            { label: "Tenure",       value: `${loan.tenure_months} months` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Disbursed date */}
        {loan.disbursed_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
            <Calendar className="w-3 h-3" />
            Disbursed {new Date(loan.disbursed_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {/* Overdue warning */}
        {overdue > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {overdue} overdue EMI{overdue > 1 ? "s" : ""} — needs immediate attention
          </div>
        )}

        {/* Repayment progress (only if loaded) */}
        {total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{paid}/{total} EMIs paid</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${loan.status === "closed" ? "bg-green-500" : "bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]"}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={loadRepayments}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[#C2185B] hover:bg-[#C2185B]/5 py-2 rounded-lg border border-[#C2185B]/20 transition-colors"
          >
            {loadingRep ? "Loading..." : expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide EMIs</> : <><ChevronDown className="w-3.5 h-3.5" />View EMIs</>}
          </button>
          {loan.status === "active" && (
            <button
              onClick={() => onClose(loan.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 py-2 px-3 rounded-lg border border-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Close Loan
            </button>
          )}
        </div>

        {/* EMI Schedule */}
        {expanded && repayments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">EMI Schedule</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {repayments.map(r => (
                <div key={r.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border ${
                  r.status === "paid"    ? "bg-green-50/50 border-green-100" :
                  r.status === "overdue" ? "bg-red-50/50 border-red-100" :
                  "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center gap-2">
                    {r.status === "paid"    && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    {r.status === "overdue" && <AlertCircle  className="w-4 h-4 text-red-500   shrink-0" />}
                    {r.status === "pending" && <Clock        className="w-4 h-4 text-amber-500  shrink-0" />}
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Due {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {r.paid_date && (
                        <p className="text-green-600 text-xs">
                          Paid {new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                    {(r.status === "pending" || r.status === "overdue") && (
                      <button
                        onClick={() => handlePay(r.id)}
                        disabled={paying === r.id}
                        className="text-xs bg-[#C2185B] text-white px-2.5 py-1 rounded-lg hover:bg-[#AD1457] transition-colors disabled:opacity-50"
                      >
                        {paying === r.id ? "..." : "Pay"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Loans() {
  const [members, setMembers]   = useState<any[]>([]);
  const [loans, setLoans]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"active" | "all">("active");

  const [showNew, setShowNew]   = useState(false);
  const [newForm, setNewForm]   = useState<LoanForm>({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);

  const [closeId, setCloseId]   = useState<string | null>(null);
  const [closing, setClosing]   = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, lRes] = await Promise.all([membersApi.list(), loansApi.list()]);
      setMembers(mRes.data || []);
      setLoans(lRes.data || []);
    } catch (err: any) { toast.error(err.message || "Failed to load"); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.member_id || !newForm.loan_amount) {
      toast.error("Member and amount are required"); return;
    }
    setCreating(true);
    try {
      await loansApi.create({
        member_id:    newForm.member_id,
        loan_amount:  Number(newForm.loan_amount),
        interest_rate: Number(newForm.interest_rate),
        tenure_months: Number(newForm.tenure_months),
        purpose:      newForm.purpose,
        disbursed_date: newForm.disbursed_date,
      });
      toast.success("Loan created! EMI schedule auto-generated.");
      setShowNew(false);
      setNewForm({ ...EMPTY_FORM });
      loadAll();
    } catch (err: any) { toast.error(err.message || "Failed to create loan"); }
    finally { setCreating(false); }
  }

  async function handleClose(id: string) {
    setClosing(true);
    try {
      await loansApi.update(id, { status: "closed" });
      toast.success("Loan marked as closed");
      setCloseId(null);
      loadAll();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setClosing(false); }
  }

  // ── Derived stats ────────────────────────────────────────
  const activeLoans    = loans.filter(l => l.status === "active");
  const closedLoans    = loans.filter(l => l.status === "closed");
  const overdueLoans   = loans.filter(l => l.status === "overdue");
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const totalActive    = activeLoans.reduce((s, l) => s + Number(l.loan_amount), 0);

  const displayedLoans = tab === "active"
    ? [...overdueLoans, ...activeLoans]  // overdue first
    : loans;

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage group loans and EMI schedules</p>
        </div>
        <Button onClick={() => { setNewForm({ ...EMPTY_FORM }); setShowNew(true); }}
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white">
          <Plus className="w-4 h-4 mr-2" /> New Loan
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Landmark,    color: "#C2185B", label: "Total Disbursed",   value: `₹${totalDisbursed.toLocaleString("en-IN")}`,  sub: `${loans.length} loans` },
          { icon: TrendingUp,  color: "#6A1B9A", label: "Active Portfolio",  value: `₹${totalActive.toLocaleString("en-IN")}`,     sub: `${activeLoans.length} active` },
          { icon: CheckCircle2,color: "#388E3C", label: "Loans Closed",      value: closedLoans.length,                             sub: "Fully repaid" },
          { icon: AlertCircle, color: "#D32F2F", label: "Overdue",           value: overdueLoans.length,                            sub: overdueLoans.length > 0 ? "Needs attention" : "All clear ✓" },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: "active", label: `Active (${activeLoans.length + overdueLoans.length})` },
          { key: "all",    label: `All Loans (${loans.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-white shadow text-[#C2185B]" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Loan cards grid */}
      {displayedLoans.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-20 text-center text-muted-foreground">
            <Landmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No loans found</p>
            <p className="text-sm mt-1">Click "New Loan" to disburse the first loan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {displayedLoans.map(loan => (
            <LoanCard key={loan.id} loan={loan} onClose={id => setCloseId(id)} />
          ))}
        </div>
      )}

      {/* New Loan Dialog */}
      <Dialog open={showNew} onOpenChange={o => !o && setShowNew(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                <Landmark className="w-4 h-4 text-white" />
              </div>
              New Loan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="mt-1">
            <NewLoanForm members={members} form={newForm} setForm={setNewForm} />
            <div className="flex gap-3 justify-end pt-5 mt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={creating}>
                {creating ? "Creating..." : "Disburse Loan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Loan Confirm */}
      <Dialog open={!!closeId} onOpenChange={o => !o && setCloseId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Close Loan?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will mark the loan as closed. Use this only if the loan is fully repaid or being written off.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setCloseId(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => closeId && handleClose(closeId)} disabled={closing}>
              {closing ? "Closing..." : "Yes, Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}