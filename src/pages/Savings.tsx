// src/pages/Savings.tsx
import { useEffect, useState, useCallback } from "react";
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
  Plus, PiggyBank, TrendingUp, Calendar, Trash2, AlertCircle,
  ChevronLeft, ChevronRight, Users, CheckCircle2,
} from "lucide-react";
import { savingsApi, membersApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// ── Constants ─────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const PAYMENT_MODES = ["cash", "upi", "bank"];
const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

// ── Add Saving Form — outside to avoid focus loss ─────────────
const EMPTY_FORM = {
  member_id: "", month: String(CURRENT_MONTH), year: String(CURRENT_YEAR),
  amount: "", payment_mode: "cash", date: new Date().toISOString().split("T")[0],
};
type SavingForm = typeof EMPTY_FORM;

function AddSavingForm({
  members, form, setForm,
}: {
  members: any[];
  form: SavingForm;
  setForm: React.Dispatch<React.SetStateAction<SavingForm>>;
}) {
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Month *</Label>
          <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Year *</Label>
          <Select value={form.year} onValueChange={v => setForm(f => ({ ...f, year: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Amount (₹) *</Label>
          <Input
            type="number" placeholder="e.g. 500"
            value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Payment Mode</Label>
          <Select value={form.payment_mode} onValueChange={v => setForm(f => ({ ...f, payment_mode: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map(m => (
                <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Date</Label>
        <Input
          type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Savings() {
  const [members, setMembers]           = useState<any[]>([]);
  const [allSavings, setAllSavings]     = useState<any[]>([]);
  const [monthSavings, setMonthSavings] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  // Selected month/year for the monthly view
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH);
  const [selYear, setSelYear]   = useState(CURRENT_YEAR);

  // Add dialog
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState<SavingForm>({ ...EMPTY_FORM });
  const [addSaving, setAddSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Active tab
  const [tab, setTab] = useState<"monthly" | "all">("monthly");

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    loadMonthSavings(selMonth, selYear);
  }, [selMonth, selYear]);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        membersApi.list(),
        savingsApi.list(),
      ]);
      setMembers(mRes.data || []);
      setAllSavings(sRes.data || []);
      await loadMonthSavings(selMonth, selYear);
    } catch (err: any) {
      toast.error(err.message || "Failed to load savings");
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthSavings(month: number, year: number) {
    try {
      const res = await savingsApi.list({ month, year });
      setMonthSavings(res.data || []);
    } catch {
      setMonthSavings([]);
    }
  }

  function prevMonth() {
    if (selMonth === 1) { setSelMonth(12); setSelYear(y => y - 1); }
    else setSelMonth(m => m - 1);
  }
  function nextMonth() {
    const now = new Date();
    if (selYear > now.getFullYear() || (selYear === now.getFullYear() && selMonth >= now.getMonth() + 1)) return;
    if (selMonth === 12) { setSelMonth(1); setSelYear(y => y + 1); }
    else setSelMonth(m => m + 1);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.member_id || !addForm.amount) {
      toast.error("Member and amount are required"); return;
    }
    setAddSaving(true);
    try {
      await savingsApi.create({
        member_id:    addForm.member_id,
        month:        Number(addForm.month),
        year:         Number(addForm.year),
        amount:       Number(addForm.amount),
        payment_mode: addForm.payment_mode,
        date:         addForm.date,
      });
      toast.success("Saving recorded!");
      setShowAdd(false);
      setAddForm({ ...EMPTY_FORM });
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to record saving");
    } finally {
      setAddSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await savingsApi.delete(deleteId);
      toast.success("Entry deleted");
      setDeleteId(null);
      loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // ── Derived stats ─────────────────────────────────────────
  const totalAllTime    = allSavings.reduce((s, r) => s + Number(r.amount), 0);
  const totalThisMonth  = monthSavings.reduce((s, r) => s + Number(r.amount), 0);
  const avgPerMember    = members.length ? Math.round(totalAllTime / members.length) : 0;
  const paidThisMonth   = monthSavings.length;
  const pendingCount    = members.length - paidThisMonth;

  // Member-wise summary (all time)
  const memberSummary = members.map(m => {
    const mSavings = allSavings.filter(s => s.member_id === m.id);
    const total    = mSavings.reduce((s, r) => s + Number(r.amount), 0);
    const paidThis = monthSavings.some(s => s.member_id === m.id);
    return { ...m, total, contributions: mSavings.length, paidThisMonth: paidThis };
  }).sort((a, b) => b.total - a.total);

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
          <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track monthly savings for all members</p>
        </div>
        <Button
          onClick={() => { setAddForm({ ...EMPTY_FORM }); setShowAdd(true); }}
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Record Saving
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: PiggyBank,    color: "#C2185B", label: "Total Group Savings",  value: `₹${totalAllTime.toLocaleString("en-IN")}`,   sub: "All time" },
          { icon: Calendar,     color: "#6A1B9A", label: "This Month",           value: `₹${totalThisMonth.toLocaleString("en-IN")}`, sub: `${MONTH_NAMES[selMonth-1]} ${selYear}` },
          { icon: Users,        color: "#0288D1", label: "Paid This Month",      value: `${paidThisMonth} / ${members.length}`,       sub: pendingCount > 0 ? `${pendingCount} pending` : "All paid ✓" },
          { icon: TrendingUp,   color: "#388E3C", label: "Avg per Member",       value: `₹${avgPerMember.toLocaleString("en-IN")}`,   sub: "All time average" },
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
        {(["monthly", "all"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-white shadow text-[#C2185B]" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "monthly" ? "Monthly View" : "All Transactions"}
          </button>
        ))}
      </div>

      {/* ── MONTHLY VIEW ───────────────────────────────────── */}
      {tab === "monthly" && (
        <div className="space-y-5">
          {/* Month navigator */}
          <div className="flex items-center justify-between bg-white border border-border/60 rounded-xl px-4 py-3 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{MONTH_NAMES[selMonth - 1]} {selYear}</p>
              <p className="text-xs text-muted-foreground">{paidThisMonth} of {members.length} members paid</p>
            </div>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="bg-white border border-border/60 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Collection progress</span>
              <span className="font-medium text-[#C2185B]">
                ₹{totalThisMonth.toLocaleString("en-IN")} collected
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] transition-all"
                style={{ width: members.length ? `${(paidThisMonth / members.length) * 100}%` : "0%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {members.length ? Math.round((paidThisMonth / members.length) * 100) : 0}% complete
            </p>
          </div>

          {/* Member payment status grid */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C2185B]" />
                Member Status — {MONTH_NAMES[selMonth - 1]} {selYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No members found</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => {
                    const entry = monthSavings.find(s => s.member_id === m.id);
                    return (
                      <div key={m.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${entry ? "bg-green-50/50 border-green-100" : "bg-orange-50/40 border-orange-100"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <Link to={`/members/${m.id}`} className="text-sm font-medium text-gray-900 hover:text-[#C2185B] transition-colors">
                              {m.name}
                            </Link>
                            <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {entry ? (
                            <>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-700">₹{Number(entry.amount).toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground capitalize">{entry.payment_mode}</p>
                              </div>
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                              <button onClick={() => setDeleteId(entry.id)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-orange-600 font-medium">Not paid</span>
                              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                              <button
                                onClick={() => {
                                  setAddForm({ ...EMPTY_FORM, member_id: m.id, month: String(selMonth), year: String(selYear) });
                                  setShowAdd(true);
                                }}
                                className="p-1 hover:bg-[#C2185B]/10 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#C2185B]" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ALL TRANSACTIONS ──────────────────────────────── */}
      {tab === "all" && (
        <div className="space-y-5">
          {/* Member savings summary */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#C2185B]" /> Member-wise Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Member</TableHead>
                      <TableHead>Contributions</TableHead>
                      <TableHead>Total Saved</TableHead>
                      <TableHead>This Month</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberSummary.map(m => (
                      <TableRow key={m.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <Link to={`/members/${m.id}`} className="flex items-center gap-2.5 hover:text-[#C2185B] transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {m.name.charAt(0)}
                            </div>
                            <span className="font-medium">{m.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{m.contributions} months</TableCell>
                        <TableCell className="font-semibold text-green-700">₹{m.total.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          {m.paidThisMonth
                            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                            : <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Pending</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* All transactions */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#6A1B9A]" /> All Transactions
                </CardTitle>
                <span className="text-xs text-muted-foreground">{allSavings.length} entries</span>
              </div>
            </CardHeader>
            <CardContent>
              {allSavings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No savings recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Member</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSavings.map(s => (
                        <TableRow key={s.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">{s.member_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {MONTH_NAMES[s.month - 1]} {s.year}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.payment_mode}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </TableCell>
                          <TableCell>
                            <button onClick={() => setDeleteId(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Total footer */}
              {allSavings.length > 0 && (
                <div className="mt-4 p-3 bg-[#C2185B]/5 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-[#C2185B]">₹{totalAllTime.toLocaleString("en-IN")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Add Saving Dialog ─────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={o => !o && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-white" />
              </div>
              Record Saving
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-1">
            <AddSavingForm members={members} form={addForm} setForm={setAddForm} />
            <div className="flex gap-3 justify-end pt-5 mt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={addSaving}>
                {addSaving ? "Saving..." : "Record Saving"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> Delete Entry?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will permanently remove this saving entry. This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete} disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}