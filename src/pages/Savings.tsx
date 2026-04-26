// src/pages/Savings.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DBadge, DBtn, DSpinner, DEmpty, stagger, fadeUp } from "@/components/ui/dark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PiggyBank, TrendingUp, Calendar, Trash2, AlertCircle, ChevronLeft, ChevronRight, Users, CheckCircle2 } from "lucide-react";
import { savingsApi, membersApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PAYMENT_MODES = ["cash", "upi", "bank"];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const EMPTY_FORM = { member_id: "", month: String(CURRENT_MONTH), year: String(CURRENT_YEAR), amount: "", payment_mode: "cash", date: new Date().toISOString().split("T")[0] };
type SavingForm = typeof EMPTY_FORM;

function DarkInput({ value, onChange, type = "text", placeholder }: any) {
  return (
    <input value={value} onChange={onChange} type={type} placeholder={placeholder}
      className="w-full rounded-xl px-3 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
  );
}

function AddSavingForm({ members, form, setForm }: { members: any[]; form: SavingForm; setForm: React.Dispatch<React.SetStateAction<SavingForm>> }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Member *</p>
        <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
          <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Month *</p>
          <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTH_NAMES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Year *</p>
          <Select value={form.year} onValueChange={v => setForm(f => ({ ...f, year: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Amount (₹) *</p>
          <DarkInput value={form.amount} onChange={(e: any) => setForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="e.g. 500" />
        </div>
        <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Payment Mode</p>
          <Select value={form.payment_mode} onValueChange={v => setForm(f => ({ ...f, payment_mode: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Date</p>
        <DarkInput value={form.date} onChange={(e: any) => setForm(f => ({ ...f, date: e.target.value }))} type="date" />
      </div>
    </div>
  );
}

export default function Savings() {
  const [members, setMembers] = useState<any[]>([]);
  const [allSavings, setAllSavings] = useState<any[]>([]);
  const [monthSavings, setMonthSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH);
  const [selYear, setSelYear] = useState(CURRENT_YEAR);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<SavingForm>({ ...EMPTY_FORM });
  const [addSaving, setAddSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<"monthly" | "all">("monthly");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadMonthSavings(selMonth, selYear); }, [selMonth, selYear]);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([membersApi.list(), savingsApi.list()]);
      setMembers(mRes.data || []); setAllSavings(sRes.data || []);
      await loadMonthSavings(selMonth, selYear);
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  }

  async function loadMonthSavings(month: number, year: number) {
    try { const res = await savingsApi.list({ month, year }); setMonthSavings(res.data || []); }
    catch { setMonthSavings([]); }
  }

  function prevMonth() { if (selMonth === 1) { setSelMonth(12); setSelYear(y => y - 1); } else setSelMonth(m => m - 1); }
  function nextMonth() {
    const now = new Date();
    if (selYear > now.getFullYear() || (selYear === now.getFullYear() && selMonth >= now.getMonth() + 1)) return;
    if (selMonth === 12) { setSelMonth(1); setSelYear(y => y + 1); } else setSelMonth(m => m + 1);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.member_id || !addForm.amount) { toast.error("Member and amount required"); return; }
    setAddSaving(true);
    try {
      await savingsApi.create({ member_id: addForm.member_id, month: Number(addForm.month), year: Number(addForm.year), amount: Number(addForm.amount), payment_mode: addForm.payment_mode, date: addForm.date });
      toast.success("Saving recorded!"); setShowAdd(false); setAddForm({ ...EMPTY_FORM }); loadAll();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setAddSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await savingsApi.delete(deleteId); toast.success("Entry deleted"); setDeleteId(null); loadAll(); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setDeleting(false); }
  }

  const totalAllTime = allSavings.reduce((s, r) => s + Number(r.amount), 0);
  const totalThisMonth = monthSavings.reduce((s, r) => s + Number(r.amount), 0);
  const avgPerMember = members.length ? Math.round(totalAllTime / members.length) : 0;
  const paidThisMonth = monthSavings.length;
  const pendingCount = members.length - paidThisMonth;
  const collectionPct = members.length ? Math.round((paidThisMonth / members.length) * 100) : 0;

  const memberSummary = members.map(m => {
    const mSavings = allSavings.filter(s => s.member_id === m.id);
    return { ...m, total: mSavings.reduce((s, r) => s + Number(r.amount), 0), contributions: mSavings.length, paidThisMonth: monthSavings.some(s => s.member_id === m.id) };
  }).sort((a, b) => b.total - a.total);

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Savings" subtitle="Track monthly savings for all members">
        <DBtn variant="primary" onClick={() => { setAddForm({ ...EMPTY_FORM }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Record Saving</DBtn>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: PiggyBank,  color: "#C2185B", label: "Total Savings",   value: `₹${totalAllTime.toLocaleString("en-IN")}`,   sub: "All time" },
          { icon: Calendar,   color: "#7C3AED", label: "This Month",      value: `₹${totalThisMonth.toLocaleString("en-IN")}`, sub: `${MONTH_NAMES[selMonth-1]} ${selYear}` },
          { icon: Users,      color: "#0288D1", label: "Paid This Month", value: `${paidThisMonth} / ${members.length}`,        sub: pendingCount > 0 ? `${pendingCount} pending` : "All paid ✓" },
          { icon: TrendingUp, color: "#10B981", label: "Avg Per Member",  value: `₹${avgPerMember.toLocaleString("en-IN")}`,   sub: "All time average" },
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
        {(["monthly", "all"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: tab === t ? "rgba(194,24,91,0.2)" : "transparent", color: tab === t ? "#C2185B" : "rgba(255,255,255,0.35)" }}>
            {t === "monthly" ? "Monthly View" : "All Transactions"}
          </button>
        ))}
      </div>

      {/* Monthly View */}
      {tab === "monthly" && (
        <div className="space-y-5">
          {/* Month navigator */}
          <DCard className="px-5 py-4 flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/8 transition-colors"><ChevronLeft className="w-5 h-5 text-white/50" /></button>
            <div className="text-center">
              <p className="font-bold text-white">{MONTH_NAMES[selMonth - 1]} {selYear}</p>
              <p className="text-xs text-white/35">{paidThisMonth} of {members.length} members paid</p>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/8 transition-colors"><ChevronRight className="w-5 h-5 text-white/50" /></button>
          </DCard>

          {/* Progress */}
          <DCard className="px-5 py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/40 font-medium">Collection progress</span>
              <span className="font-bold" style={{ color: "#C2185B" }}>₹{totalThisMonth.toLocaleString("en-IN")} collected</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${collectionPct}%`, background: "linear-gradient(90deg,#C2185B,#6A1B9A)", boxShadow: "0 0 10px rgba(194,24,91,0.35)" }} />
            </div>
            <p className="text-xs text-white/30">{collectionPct}% complete</p>
          </DCard>

          {/* Member status grid */}
          <DCard>
            <DCardHeader>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-[#C2185B]" />Member Status — {MONTH_NAMES[selMonth - 1]} {selYear}</h3>
            </DCardHeader>
            <div className="p-5">
              {members.length === 0 ? <DEmpty icon={Users} title="No members" /> : (
                <div className="space-y-2">
                  {members.map(m => {
                    const entry = monthSavings.find(s => s.member_id === m.id);
                    return (
                      <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                        style={{ background: entry ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.06)", border: `1px solid ${entry ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.12)"}` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>{m.name.charAt(0)}</div>
                          <div>
                            <Link to={`/members/${m.id}`} className="text-sm font-bold text-white hover:text-pink-300 transition-colors">{m.name}</Link>
                            <p className="text-xs text-white/30 capitalize">{m.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {entry ? (
                            <>
                              <div className="text-right"><p className="text-sm font-bold text-emerald-400">₹{Number(entry.amount).toLocaleString("en-IN")}</p><p className="text-xs text-white/30 capitalize">{entry.payment_mode}</p></div>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              <button onClick={() => setDeleteId(entry.id)} className="p-1 hover:bg-red-500/15 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-amber-400">Not paid</span>
                              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                              <button onClick={() => { setAddForm({ ...EMPTY_FORM, member_id: m.id, month: String(selMonth), year: String(selYear) }); setShowAdd(true); }} className="p-1 hover:bg-[#C2185B]/15 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5 text-[#C2185B]" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DCard>
        </div>
      )}

      {/* All Transactions */}
      {tab === "all" && (
        <div className="space-y-5">
          {/* Member summary */}
          <DCard>
            <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><PiggyBank className="w-4 h-4 text-[#C2185B]" />Member-wise Summary</h3></DCardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Member","Contributions","Total Saved","This Month"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memberSummary.map(m => (
                    <tr key={m.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3">
                        <Link to={`/members/${m.id}`} className="flex items-center gap-2.5 hover:text-pink-300 transition-colors">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>{m.name.charAt(0)}</div>
                          <span className="font-bold text-white">{m.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/40">{m.contributions} months</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">₹{m.total.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3"><DBadge variant={m.paidThisMonth ? "green" : "amber"}>{m.paidThisMonth ? "Paid" : "Pending"}</DBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DCard>

          {/* All transactions */}
          <DCard>
            <DCardHeader>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#7C3AED]" />All Transactions</h3>
              <span className="text-xs text-white/30">{allSavings.length} entries</span>
            </DCardHeader>
            {allSavings.length === 0 ? <div className="py-12"><DEmpty icon={PiggyBank} title="No savings recorded yet" /></div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Member","Month","Amount","Mode","Date",""].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {allSavings.map(s => (
                        <tr key={s.id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-3 text-sm font-bold text-white">{s.member_name}</td>
                          <td className="px-4 py-3 text-sm text-white/40">{MONTH_NAMES[s.month - 1]} {s.year}</td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-400">₹{Number(s.amount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3"><DBadge variant="gray">{s.payment_mode}</DBadge></td>
                          <td className="px-4 py-3 text-xs text-white/35">{s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                          <td className="px-4 py-3"><button onClick={() => setDeleteId(s.id)} className="p-1.5 hover:bg-red-500/15 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm text-white/30">Grand Total</span>
                  <span className="text-lg font-black" style={{ color: "#C2185B" }}>₹{totalAllTime.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </DCard>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={o => !o && setShowAdd(false)}>
        <DialogContent className="max-w-md" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}><PiggyBank className="w-4 h-4 text-white" /></div> Record Saving</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <AddSavingForm members={members} form={addForm} setForm={setAddForm} />
            <div className="flex gap-3 justify-end pt-5 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={addSaving}>{addSaving ? "Saving…" : "Record Saving"}</DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" /> Delete Entry?</DialogTitle></DialogHeader>
          <p className="text-sm text-white/40 py-2">This will permanently remove this saving entry. Cannot be undone.</p>
          <div className="flex gap-3 justify-end pt-2">
            <DBtn variant="ghost" onClick={() => setDeleteId(null)}>Cancel</DBtn>
            <DBtn variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</DBtn>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}