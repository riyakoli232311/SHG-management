// src/pages/Loans.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, PageHeader, DBadge, DBtn, DSpinner, DEmpty, stagger, fadeUp } from "@/components/ui/dark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Landmark, TrendingUp, AlertCircle, CheckCircle2, Clock, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { loansApi, membersApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PURPOSES = ["Dairy Farming","Vegetable Trading","Tailoring","Poultry","Goat Rearing","Pickle Making","Papad Making","Agarbatti Making","Small Business","Medical Emergency","Child Education","House Repair","Agriculture","Other"];
const EMPTY_FORM = { member_id: "", loan_amount: "", interest_rate: "2", tenure_months: "12", purpose: "", disbursed_date: new Date().toISOString().split("T")[0] };
type LoanForm = typeof EMPTY_FORM;

function calcEMI(p: number, r: number, m: number) {
  const rate = r / 100 / 12;
  if (rate === 0) return Math.round(p / m);
  return Math.round((p * rate * Math.pow(1 + rate, m)) / (Math.pow(1 + rate, m) - 1));
}

function DFormInput({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>{children}</div>;
}

function DarkInput({ value, onChange, type = "text", placeholder }: any) {
  return (
    <input value={value} onChange={onChange} type={type} placeholder={placeholder}
      className="w-full rounded-xl px-3 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
  );
}

function NewLoanForm({ members, form, setForm }: { members: any[]; form: LoanForm; setForm: React.Dispatch<React.SetStateAction<LoanForm>> }) {
  const emi = form.loan_amount && form.interest_rate && form.tenure_months
    ? calcEMI(Number(form.loan_amount), Number(form.interest_rate), Number(form.tenure_months)) : null;
  return (
    <div className="space-y-4">
      <DFormInput label="Member *">
        <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
          <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
        </Select>
      </DFormInput>
      <DFormInput label="Purpose">
        <Select value={form.purpose} onValueChange={v => setForm(f => ({ ...f, purpose: v }))}>
          <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue placeholder="Select purpose" /></SelectTrigger>
          <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </DFormInput>
      <div className="grid grid-cols-2 gap-3">
        <DFormInput label="Loan Amount (₹) *"><DarkInput value={form.loan_amount} onChange={(e: any) => setForm(f => ({ ...f, loan_amount: e.target.value }))} type="number" placeholder="e.g. 10000" /></DFormInput>
        <DFormInput label="Interest (% p.a.)"><DarkInput value={form.interest_rate} onChange={(e: any) => setForm(f => ({ ...f, interest_rate: e.target.value }))} type="number" placeholder="e.g. 24" /></DFormInput>
        <DFormInput label="Tenure (months)"><DarkInput value={form.tenure_months} onChange={(e: any) => setForm(f => ({ ...f, tenure_months: e.target.value }))} type="number" placeholder="12" /></DFormInput>
        <DFormInput label="Disbursed Date"><DarkInput value={form.disbursed_date} onChange={(e: any) => setForm(f => ({ ...f, disbursed_date: e.target.value }))} type="date" /></DFormInput>
      </div>
      {emi && (
        <div className="rounded-xl p-4" style={{ background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.18)" }}>
          <p className="text-xs text-white/40 mb-1">Monthly EMI (auto-calculated)</p>
          <p className="text-2xl font-black text-[#C2185B]">₹{emi.toLocaleString("en-IN")}</p>
          <p className="text-xs text-white/30 mt-1">{form.tenure_months} EMIs · Total ≈ ₹{(emi * Number(form.tenure_months)).toLocaleString("en-IN")}</p>
        </div>
      )}
    </div>
  );
}

function LoanCard({ loan, onClose }: { loan: any; onClose: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loadingRep, setLoadingRep] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  async function loadRepayments() {
    if (repayments.length > 0) { setExpanded(e => !e); return; }
    setLoadingRep(true);
    try { const res = await repaymentsApi.list({ loan_id: loan.id }); setRepayments(res.data || []); setExpanded(true); }
    catch { toast.error("Failed to load EMIs"); }
    finally { setLoadingRep(false); }
  }

  async function handlePay(repId: string) {
    setPaying(repId);
    try { await repaymentsApi.pay(repId, new Date().toISOString().split("T")[0]); const res = await repaymentsApi.list({ loan_id: loan.id }); setRepayments(res.data || []); toast.success("EMI marked paid!"); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setPaying(null); }
  }

  const paid = repayments.filter(r => r.status === "paid").length;
  const total = repayments.length;
  const overdue = repayments.filter(r => r.status === "overdue").length;
  const pct = total ? Math.round((paid / total) * 100) : 0;

  const statusVariant = loan.status === "active" ? "blue" : loan.status === "closed" ? "green" : "red";

  return (
    <DCard className="hover:border-white/15 transition-all duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 12px rgba(194,24,91,0.3)" }}>
              {loan.member_name?.charAt(0) || "?"}
            </div>
            <div>
              <Link to={`/members/${loan.member_id}`} className="font-bold text-white hover:text-pink-300 transition-colors">{loan.member_name}</Link>
              <p className="text-xs text-white/35">{loan.purpose || "General Purpose"}</p>
            </div>
          </div>
          <DBadge variant={statusVariant}>{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</DBadge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Loan Amount", value: `₹${Number(loan.loan_amount).toLocaleString("en-IN")}` },
            { label: "Interest", value: `${loan.interest_rate}% p.a.` },
            { label: "Tenure", value: `${loan.tenure_months} mo` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center rounded-xl py-3 px-2" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {loan.disbursed_date && (
          <p className="text-xs text-white/30 flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3" /> Disbursed {new Date(loan.disbursed_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {overdue > 0 && (
          <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 mb-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {overdue} overdue EMI{overdue > 1 ? "s" : ""}
          </div>
        )}

        {total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-white/30 mb-1"><span>{paid}/{total} EMIs paid</span><span className="font-bold">{pct}%</span></div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: loan.status === "closed" ? "#10B981" : "linear-gradient(90deg,#C2185B,#6A1B9A)" }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button onClick={loadRepayments}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-colors"
            style={{ background: "rgba(194,24,91,0.08)", color: "#C2185B", border: "1px solid rgba(194,24,91,0.2)" }}>
            {loadingRep ? "Loading…" : expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide EMIs</> : <><ChevronDown className="w-3.5 h-3.5" />View EMIs</>}
          </button>
          {loan.status === "active" && (
            <button onClick={() => onClose(loan.id)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <X className="w-3.5 h-3.5" /> Close Loan
            </button>
          )}
        </div>

        {expanded && repayments.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">EMI Schedule</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {repayments.map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: r.status === "paid" ? "rgba(16,185,129,0.08)" : r.status === "overdue" ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${r.status === "paid" ? "rgba(16,185,129,0.15)" : r.status === "overdue" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}` }}>
                  <div className="flex items-center gap-2">
                    {r.status === "paid" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {r.status === "overdue" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    {r.status === "pending" && <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
                    <div>
                      <p className="text-xs text-white/40">Due {new Date(r.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      {r.paid_date && <p className="text-xs text-emerald-400">Paid {new Date(r.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                    {(r.status === "pending" || r.status === "overdue") && (
                      <button onClick={() => handlePay(r.id)} disabled={paying === r.id}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", color: "#fff" }}>
                        {paying === r.id ? "…" : "Pay"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DCard>
  );
}

export default function Loans() {
  const [members, setMembers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "all">("active");
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<LoanForm>({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const [closeId, setCloseId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { const [mRes, lRes] = await Promise.all([membersApi.list(), loansApi.list()]); setMembers(mRes.data || []); setLoans(lRes.data || []); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.member_id || !newForm.loan_amount) { toast.error("Member and amount required"); return; }
    setCreating(true);
    try {
      await loansApi.create({ member_id: newForm.member_id, loan_amount: Number(newForm.loan_amount), interest_rate: Number(newForm.interest_rate), tenure_months: Number(newForm.tenure_months), purpose: newForm.purpose, disbursed_date: newForm.disbursed_date });
      toast.success("Loan created! EMI schedule auto-generated."); setShowNew(false); setNewForm({ ...EMPTY_FORM }); loadAll();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setCreating(false); }
  }

  async function handleClose(id: string) {
    setClosing(true);
    try { await loansApi.update(id, { status: "closed" }); toast.success("Loan closed"); setCloseId(null); loadAll(); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setClosing(false); }
  }

  const activeLoans = loans.filter(l => l.status === "active");
  const closedLoans = loans.filter(l => l.status === "closed");
  const overdueLoans = loans.filter(l => l.status === "overdue");
  const totalDisbursed = loans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const totalActive = activeLoans.reduce((s, l) => s + Number(l.loan_amount), 0);
  const displayedLoans = tab === "active" ? [...overdueLoans, ...activeLoans] : loans;

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  const TABS = [{ key: "active", label: `Active (${activeLoans.length + overdueLoans.length})` }, { key: "all", label: `All (${loans.length})` }] as const;

  return (
    <DashboardLayout>
      <PageHeader title="Loans" subtitle="Manage group loans and EMI schedules">
        <DBtn variant="primary" onClick={() => { setNewForm({ ...EMPTY_FORM }); setShowNew(true); }}><Plus className="w-4 h-4" /> New Loan</DBtn>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Landmark,     color: "#C2185B", label: "Total Disbursed",  value: `₹${totalDisbursed.toLocaleString("en-IN")}`,  sub: `${loans.length} loans` },
          { icon: TrendingUp,   color: "#7C3AED", label: "Active Portfolio", value: `₹${totalActive.toLocaleString("en-IN")}`,     sub: `${activeLoans.length} active` },
          { icon: CheckCircle2, color: "#10B981", label: "Loans Closed",     value: closedLoans.length,                            sub: "Fully repaid" },
          { icon: AlertCircle,  color: "#EF4444", label: "Overdue",          value: overdueLoans.length,                           sub: overdueLoans.length > 0 ? "Needs attention" : "All clear ✓" },
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: tab === t.key ? "rgba(194,24,91,0.2)" : "transparent", color: tab === t.key ? "#C2185B" : "rgba(255,255,255,0.35)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {displayedLoans.length === 0 ? (
        <DCard className="py-20 text-center"><DEmpty icon={Landmark} title="No loans found" subtitle='Click "New Loan" to disburse the first loan' /></DCard>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid md:grid-cols-2 gap-5">
          {displayedLoans.map(loan => (
            <motion.div key={loan.id} variants={fadeUp}>
              <LoanCard loan={loan} onClose={id => setCloseId(id)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* New Loan Dialog */}
      <Dialog open={showNew} onOpenChange={o => !o && setShowNew(false)}>
        <DialogContent className="max-w-md" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}><Landmark className="w-4 h-4 text-white" /></div> New Loan</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="mt-2">
            <NewLoanForm members={members} form={newForm} setForm={setNewForm} />
            <div className="flex gap-3 justify-end pt-5 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setShowNew(false)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={creating}>{creating ? "Creating…" : "Disburse Loan"}</DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Confirm */}
      <Dialog open={!!closeId} onOpenChange={o => !o && setCloseId(null)}>
        <DialogContent className="max-w-sm" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Close Loan?</DialogTitle></DialogHeader>
          <p className="text-sm text-white/40 py-2">This will mark the loan as closed. Use only if fully repaid or being written off.</p>
          <div className="flex gap-3 justify-end pt-2">
            <DBtn variant="ghost" onClick={() => setCloseId(null)}>Cancel</DBtn>
            <DBtn variant="success" onClick={() => closeId && handleClose(closeId)} disabled={closing}>{closing ? "Closing…" : "Yes, Close"}</DBtn>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}