// src/pages/Members.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DBadge, DInput, DBtn, DSpinner, DEmpty, DAvatar, fadeUp, stagger } from "@/components/ui/dark";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Phone, MapPin, Pencil, Trash2, ChevronDown, ChevronUp, UserCheck, UserX } from "lucide-react";
import { membersApi, shgApi } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ROLES = ["member", "president", "secretary", "treasurer"] as const;
const CASTE_CATEGORIES = ["general", "obc", "sc", "st"] as const;
const ROLE_LABELS: Record<string, string> = { member: "Member", president: "President", secretary: "Secretary", treasurer: "Treasurer" };
const ROLE_VARIANT: Record<string, "amber" | "blue" | "purple" | "gray"> = { president: "amber", secretary: "blue", treasurer: "purple", member: "gray" };

const EMPTY_FORM = {
  name: "", phone: "", age: "", income: "", aadhar: "", husband_name: "",
  occupation: "", village: "", gram_panchayat: "", block: "", district: "",
  state: "", pin_code: "", role: "member" as typeof ROLES[number],
  joined_date: "", status: "active" as "active" | "inactive",
  bank_account: "", bank_ifsc: "", caste_category: "" as typeof CASTE_CATEGORIES[number] | "",
  bpl_status: false,
};
type FormState = typeof EMPTY_FORM;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{children}</p>;
}

function DField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><FieldLabel>{label}</FieldLabel>{children}</div>;
}

function DFormInput({ value, onChange, placeholder, type = "text", maxLength, min, max }: any) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      maxLength={maxLength} min={min} max={max}
      className="w-full rounded-xl px-3 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

function MemberFormFields({ form, setForm, shgDefaults }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; shgDefaults: any }) {
  const [showFinancial, setShowFinancial] = useState(false);
  const f = (key: keyof FormState) => (e: any) => setForm(p => ({ ...p, [key]: e.target.value }));
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Personal Details</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2"><DField label="Full Name *"><DFormInput value={form.name} onChange={f("name")} placeholder="e.g. Sunita Devi" /></DField></div>
          <DField label="Husband's Name"><DFormInput value={form.husband_name} onChange={f("husband_name")} placeholder="W/O" /></DField>
          <DField label="Phone"><DFormInput value={form.phone} onChange={f("phone")} placeholder="10-digit" maxLength={10} /></DField>
          <DField label="Age"><DFormInput value={form.age} onChange={f("age")} type="number" placeholder="Age" min={18} max={80} /></DField>
          <DField label="Aadhaar"><DFormInput value={form.aadhar} onChange={f("aadhar")} placeholder="12-digit" maxLength={12} /></DField>
          <DField label="Occupation"><DFormInput value={form.occupation} onChange={f("occupation")} placeholder="e.g. Dairy" /></DField>
          <DField label="Monthly Income (₹)"><DFormInput value={form.income} onChange={f("income")} type="number" placeholder="e.g. 5000" /></DField>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Address</p>
        <div className="grid grid-cols-2 gap-2.5">
          <DField label="Village"><DFormInput value={form.village} onChange={f("village")} placeholder="Village" /></DField>
          <DField label="Gram Panchayat"><DFormInput value={form.gram_panchayat} onChange={f("gram_panchayat")} placeholder="GP" /></DField>
          <DField label="Block"><DFormInput value={form.block} onChange={f("block")} placeholder={shgDefaults.block || "Block"} /></DField>
          <DField label="District"><DFormInput value={form.district} onChange={f("district")} placeholder={shgDefaults.district || "District"} /></DField>
          <DField label="State"><DFormInput value={form.state} onChange={f("state")} placeholder={shgDefaults.state || "State"} /></DField>
          <DField label="PIN Code"><DFormInput value={form.pin_code} onChange={f("pin_code")} placeholder="6-digit" maxLength={6} /></DField>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Group Details</p>
        <div className="grid grid-cols-2 gap-2.5">
          <DField label="Role">
            <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as typeof ROLES[number] }))}>
              <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
            </Select>
          </DField>
          <DField label="Joining Date"><DFormInput value={form.joined_date} onChange={f("joined_date")} type="date" /></DField>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px dashed rgba(194,24,91,0.25)" }}>
        <button type="button" onClick={() => setShowFinancial(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#C2185B] uppercase tracking-wider hover:bg-[#C2185B]/5 transition-colors">
          Bank & Scheme Details (Optional)
          {showFinancial ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showFinancial && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2.5">
            <DField label="Bank Account"><DFormInput value={form.bank_account} onChange={f("bank_account")} placeholder="PMJDY account" /></DField>
            <DField label="IFSC"><DFormInput value={form.bank_ifsc} onChange={f("bank_ifsc")} placeholder="IFSC code" /></DField>
            <DField label="Caste Category">
              <Select value={form.caste_category} onValueChange={v => setForm(p => ({ ...p, caste_category: v as any }))}>
                <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{CASTE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </DField>
            <DField label="BPL Status">
              <div className="flex gap-2 mt-1">
                {[true, false].map(val => (
                  <button key={String(val)} type="button" onClick={() => setForm(p => ({ ...p, bpl_status: val }))}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: form.bpl_status === val ? (val ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.07)") : "rgba(255,255,255,0.03)", color: form.bpl_status === val ? (val ? "#fbbf24" : "#fff") : "rgba(255,255,255,0.3)", border: `1px solid ${form.bpl_status === val ? (val ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.15)") : "rgba(255,255,255,0.06)"}` }}>
                    {val ? "BPL" : "Non-BPL"}
                  </button>
                ))}
              </div>
            </DField>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shgDefaults, setShgDefaults] = useState({ block: "", district: "", state: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
  const [addSaving, setAddSaving] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteMember, setDeleteMember] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    shgApi.get().then((res: any) => {
      const s = res.data;
      const d = { block: s.block || "", district: s.district || "", state: s.state || "" };
      setShgDefaults(d);
      setAddForm(f => ({ ...f, ...d }));
    }).catch(() => {});
    loadMembers();
  }, []);

  async function loadMembers() {
    try { const res = await membersApi.list(); setMembers(res.data); }
    catch { toast.error("Failed to load members"); }
    finally { setLoading(false); }
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.village || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.role || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error("Name is required");
    setAddSaving(true);
    try {
      await membersApi.create({ ...addForm, age: addForm.age ? Number(addForm.age) : undefined, income: addForm.income ? Number(addForm.income) : undefined } as any);
      toast.success(`${addForm.name} added!`);
      setAddForm({ ...EMPTY_FORM, ...shgDefaults });
      setShowAdd(false);
      loadMembers();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setAddSaving(false); }
  }

  function openEdit(m: any) {
    setEditMember(m);
    setEditForm({ name: m.name || "", phone: m.phone || "", age: m.age ? String(m.age) : "", income: m.income ? String(m.income) : "", aadhar: m.aadhar || "", husband_name: m.husband_name || "", occupation: m.occupation || "", village: m.village || "", gram_panchayat: m.gram_panchayat || "", block: m.block || shgDefaults.block, district: m.district || shgDefaults.district, state: m.state || shgDefaults.state, pin_code: m.pin_code || "", role: m.role || "member", joined_date: m.joined_date ? m.joined_date.split("T")[0] : "", status: m.status || "active", bank_account: m.bank_account || "", bank_ifsc: m.bank_ifsc || "", caste_category: m.caste_category || "", bpl_status: m.bpl_status || false });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setEditSaving(true);
    try {
      await membersApi.update(editMember.id, { ...editForm, age: editForm.age ? Number(editForm.age) : null, income: editForm.income ? Number(editForm.income) : null });
      toast.success("Member updated!"); setEditMember(null); loadMembers();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!deleteMember) return;
    setDeleting(true);
    try { await membersApi.delete(deleteMember.id); toast.success(`${deleteMember.name} removed`); setDeleteMember(null); loadMembers(); }
    catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setDeleting(false); }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Members" subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} in your SHG`}>
        <DBtn variant="primary" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Member</DBtn>
      </PageHeader>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <DInput className="pl-9" placeholder="Search by name, village or role…" value={search} onChange={(e: any) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <DSpinner /> : filtered.length === 0 ? (
        <DEmpty icon={Users} title={search ? "No members match." : "No members yet."} subtitle={!search ? "Click 'Add Member' to get started." : undefined} />
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => (
            <motion.div key={member.id} variants={fadeUp}>
              <DCard className="group hover:border-white/15 transition-all duration-300">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Link to={`/members/${member.id}`} className="shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                        style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    <Link to={`/members/${member.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate hover:text-pink-300 transition-colors">{member.name}</h3>
                      {member.husband_name && <p className="text-xs text-white/35 truncate">W/O {member.husband_name}</p>}
                      {member.village && <div className="flex items-center gap-1 text-xs text-white/35 mt-0.5"><MapPin className="w-3 h-3 shrink-0" />{member.village}{member.block ? `, ${member.block}` : ""}</div>}
                      {member.phone && <div className="flex items-center gap-1 text-xs text-white/35 mt-0.5"><Phone className="w-3 h-3" />{member.phone}</div>}
                    </Link>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <DBadge variant={ROLE_VARIANT[member.role] || "gray"}>{ROLE_LABELS[member.role] || "Member"}</DBadge>
                      <DBadge variant={member.status === "active" ? "green" : "gray"}>{member.status === "active" ? "Active" : "Inactive"}</DBadge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        <button onClick={e => { e.preventDefault(); openEdit(member); }} className="p-1.5 rounded-lg hover:bg-[#C2185B]/15 text-[#C2185B] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={e => { e.preventDefault(); setDeleteMember(member); }} className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 pl-14 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {member.occupation && <span className="text-xs text-white/35">{member.occupation}</span>}
                    {member.caste_category && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{member.caste_category}</span>}
                    {member.bpl_status && <DBadge variant="amber">BPL</DBadge>}
                    {member.joined_date && <span className="text-xs text-white/25 ml-auto">{new Date(member.joined_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
              </DCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><UserCheck className="w-5 h-5 text-[#C2185B]" /> Add New Member</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <MemberFormFields form={addForm} setForm={setAddForm} shgDefaults={shgDefaults} />
            <div className="flex gap-3 justify-end pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={addSaving}>{addSaving ? "Adding…" : "Add Member"}</DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editMember} onOpenChange={o => !o && setEditMember(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Pencil className="w-5 h-5 text-[#C2185B]" /> Edit — {editMember?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <MemberFormFields form={editForm} setForm={setEditForm} shgDefaults={shgDefaults} />
            <div className="pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Status</p>
              <div className="flex gap-3">
                {(["active", "inactive"] as const).map(s => (
                  <button key={s} type="button" onClick={() => setEditForm(f => ({ ...f, status: s }))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: editForm.status === s ? (s === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)") : "rgba(255,255,255,0.04)", color: editForm.status === s ? (s === "active" ? "#34d399" : "#f87171") : "rgba(255,255,255,0.3)", border: `1px solid ${editForm.status === s ? (s === "active" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)") : "rgba(255,255,255,0.07)"}` }}>
                    {s === "active" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    {s === "active" ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setEditMember(null)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={editSaving}>{editSaving ? "Saving…" : "Save Changes"}</DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteMember} onOpenChange={o => !o && setDeleteMember(null)}>
        <AlertDialogContent style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove {deleteMember?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">This will permanently delete this member and all their records. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff" }}>{deleting ? "Deleting…" : "Yes, Remove"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}