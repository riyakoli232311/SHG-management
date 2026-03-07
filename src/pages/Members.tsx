// src/pages/Members.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import {
  Users, Plus, Search, Phone, MapPin,
  Pencil, Trash2, UserCheck, UserX, ChevronDown, ChevronUp,
} from "lucide-react";
import { membersApi, shgApi } from "@/lib/api";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────
const ROLES = ["member", "president", "secretary", "treasurer"] as const;
const CASTE_CATEGORIES = ["general", "obc", "sc", "st"] as const;
const ROLE_LABELS: Record<string, string> = {
  member: "Member",
  president: "President",
  secretary: "Secretary",
  treasurer: "Treasurer",
};
const ROLE_COLORS: Record<string, string> = {
  president: "bg-amber-100 text-amber-700",
  secretary: "bg-blue-100 text-blue-700",
  treasurer: "bg-purple-100 text-purple-700",
  member: "bg-gray-100 text-gray-600",
};

const EMPTY_FORM = {
  name: "",
  phone: "",
  age: "",
  income: "",
  aadhar: "",
  husband_name: "",
  occupation: "",
  village: "",
  gram_panchayat: "",
  block: "",
  district: "",
  state: "",
  pin_code: "",
  role: "member" as typeof ROLES[number],
  joined_date: "",
  status: "active" as "active" | "inactive",
  bank_account: "",
  bank_ifsc: "",
  caste_category: "" as typeof CASTE_CATEGORIES[number] | "",
  bpl_status: false,
};

type FormState = typeof EMPTY_FORM;

// ── MemberFormFields — defined OUTSIDE to prevent focus loss ──
function MemberFormFields({
  form,
  setForm,
  shgDefaults,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  shgDefaults: { block: string; district: string; state: string };
}) {
  const [showFinancial, setShowFinancial] = useState(false);

  return (
    <div className="space-y-5">
      {/* Personal */}
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">
          Personal Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label>Full Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Sunita Devi"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Husband's Name</Label>
            <Input
              value={form.husband_name}
              onChange={(e) => setForm((f) => ({ ...f, husband_name: e.target.value }))}
              placeholder="W/O"
            />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>
          <div className="space-y-1">
            <Label>Age</Label>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Age"
              min={18}
              max={80}
            />
          </div>
          <div className="space-y-1">
            <Label>Aadhaar Number</Label>
            <Input
              value={form.aadhar}
              onChange={(e) => setForm((f) => ({ ...f, aadhar: e.target.value }))}
              placeholder="12-digit Aadhaar"
              maxLength={12}
            />
          </div>
          <div className="space-y-1">
            <Label>Occupation</Label>
            <Input
              value={form.occupation}
              onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
              placeholder="e.g. Dairy, Tailoring"
            />
          </div>
          <div className="space-y-1">
            <Label>Monthly Income (₹)</Label>
            <Input
              type="number"
              value={form.income}
              onChange={(e) => setForm((f) => ({ ...f, income: e.target.value }))}
              placeholder="e.g. 5000"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">
          Address
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Village</Label>
            <Input
              value={form.village}
              onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
              placeholder="Village name"
            />
          </div>
          <div className="space-y-1">
            <Label>Gram Panchayat</Label>
            <Input
              value={form.gram_panchayat}
              onChange={(e) => setForm((f) => ({ ...f, gram_panchayat: e.target.value }))}
              placeholder="GP name"
            />
          </div>
          <div className="space-y-1">
            <Label>Block / Tehsil</Label>
            <Input
              value={form.block}
              onChange={(e) => setForm((f) => ({ ...f, block: e.target.value }))}
              placeholder={shgDefaults.block || "Block"}
            />
          </div>
          <div className="space-y-1">
            <Label>District</Label>
            <Input
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              placeholder={shgDefaults.district || "District"}
            />
          </div>
          <div className="space-y-1">
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              placeholder={shgDefaults.state || "State"}
            />
          </div>
          <div className="space-y-1">
            <Label>PIN Code</Label>
            <Input
              value={form.pin_code}
              onChange={(e) => setForm((f) => ({ ...f, pin_code: e.target.value }))}
              placeholder="6-digit PIN"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      {/* Group */}
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">
          Group Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Role in Group</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as typeof ROLES[number] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Joining Date</Label>
            <Input
              type="date"
              value={form.joined_date}
              onChange={(e) => setForm((f) => ({ ...f, joined_date: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Financial — collapsible */}
      <div className="border border-dashed border-[#C2185B]/20 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFinancial((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider hover:bg-[#C2185B]/5 transition-colors"
        >
          Bank & Scheme Details (optional)
          {showFinancial ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showFinancial && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Bank Account No.</Label>
              <Input
                value={form.bank_account}
                onChange={(e) => setForm((f) => ({ ...f, bank_account: e.target.value }))}
                placeholder="PMJDY account"
              />
            </div>
            <div className="space-y-1">
              <Label>Bank IFSC</Label>
              <Input
                value={form.bank_ifsc}
                onChange={(e) => setForm((f) => ({ ...f, bank_ifsc: e.target.value }))}
                placeholder="IFSC code"
              />
            </div>
            <div className="space-y-1">
              <Label>Caste Category</Label>
              <Select
                value={form.caste_category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, caste_category: v as typeof CASTE_CATEGORIES[number] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CASTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>BPL Status</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bpl_status: true }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.bpl_status
                      ? "bg-orange-50 border-orange-300 text-orange-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  BPL
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bpl_status: false }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    !form.bpl_status
                      ? "bg-gray-50 border-gray-300 text-gray-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  Non-BPL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
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
      const defaults = {
        block: s.block || "",
        district: s.district || "",
        state: s.state || "",
      };
      setShgDefaults(defaults);
      setAddForm((f) => ({ ...f, ...defaults }));
    }).catch(() => {});
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const res = await membersApi.list();
      setMembers(res.data);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.village || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.role || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error("Name is required");
    setAddSaving(true);
    try {
      await membersApi.create({
        ...addForm,
        age: addForm.age ? Number(addForm.age) : undefined,
        income: addForm.income ? Number(addForm.income) : undefined,
      } as any);
      toast.success(`${addForm.name} added!`);
      setAddForm({ ...EMPTY_FORM, ...shgDefaults });
      setShowAdd(false);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setAddSaving(false);
    }
  }

  function openEdit(m: any) {
    setEditMember(m);
    setEditForm({
      name: m.name || "",
      phone: m.phone || "",
      age: m.age ? String(m.age) : "",
      income: m.income ? String(m.income) : "",
      aadhar: m.aadhar || "",
      husband_name: m.husband_name || "",
      occupation: m.occupation || "",
      village: m.village || "",
      gram_panchayat: m.gram_panchayat || "",
      block: m.block || shgDefaults.block,
      district: m.district || shgDefaults.district,
      state: m.state || shgDefaults.state,
      pin_code: m.pin_code || "",
      role: m.role || "member",
      joined_date: m.joined_date ? m.joined_date.split("T")[0] : "",
      status: m.status || "active",
      bank_account: m.bank_account || "",
      bank_ifsc: m.bank_ifsc || "",
      caste_category: m.caste_category || "",
      bpl_status: m.bpl_status || false,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setEditSaving(true);
    try {
      await membersApi.update(editMember.id, {
        ...editForm,
        age: editForm.age ? Number(editForm.age) : null,
        income: editForm.income ? Number(editForm.income) : null,
      });
      toast.success("Member updated!");
      setEditMember(null);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update member");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteMember) return;
    setDeleting(true);
    try {
      await membersApi.delete(deleteMember.id);
      toast.success(`${deleteMember.name} removed`);
      setDeleteMember(null);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Members"
        description={`${members.length} member${members.length !== 1 ? "s" : ""} in your SHG`}
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, village, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {search ? "No members match your search." : "No members yet."}
          </p>
          {!search && <p className="text-sm mt-1">Click "Add Member" to get started.</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <Card
              key={member.id}
              className="hover:border-[#C2185B]/40 hover:shadow-md transition-all border-border group"
            >
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <Link to={`/members/${member.id}`} className="shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-base">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>

                  <Link to={`/members/${member.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate hover:text-[#C2185B] transition-colors">
                      {member.name}
                    </h3>
                    {member.husband_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        W/O {member.husband_name}
                      </p>
                    )}
                    {member.village && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {member.village}{member.block ? `, ${member.block}` : ""}
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] || ROLE_COLORS.member}`}>
                      {ROLE_LABELS[member.role] || "Member"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {member.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                      <button
                        onClick={(e) => { e.preventDefault(); openEdit(member); }}
                        className="p-1.5 rounded-lg hover:bg-[#C2185B]/10 text-[#C2185B] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setDeleteMember(member); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50 pl-14 flex-wrap">
                  {member.occupation && (
                    <span className="text-xs text-muted-foreground">{member.occupation}</span>
                  )}
                  {member.caste_category && (
                    <span className="text-xs uppercase bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">
                      {member.caste_category}
                    </span>
                  )}
                  {member.bpl_status && (
                    <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">BPL</span>
                  )}
                  {member.joined_date && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(member.joined_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C2185B]" /> Add New Member
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <MemberFormFields form={addForm} setForm={setAddForm} shgDefaults={shgDefaults} />
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={addSaving}>
                {addSaving ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]" /> Edit — {editMember?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <MemberFormFields form={editForm} setForm={setEditForm} shgDefaults={shgDefaults} />
            <div className="space-y-1 pt-4">
              <Label>Member Status</Label>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setEditForm((f) => ({ ...f, status: "active" }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${editForm.status === "active" ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-500"}`}>
                  <UserCheck className="w-3.5 h-3.5" /> Active
                </button>
                <button type="button" onClick={() => setEditForm((f) => ({ ...f, status: "inactive" }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${editForm.status === "inactive" ? "bg-red-50 border-red-300 text-red-600" : "border-gray-200 text-gray-500"}`}>
                  <UserX className="w-3.5 h-3.5" /> Inactive
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={editSaving}>
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteMember} onOpenChange={(o) => !o && setDeleteMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteMember?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this member and all their savings, loan,
              and repayment records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Deleting..." : "Yes, Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}