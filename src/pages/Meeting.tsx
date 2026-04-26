// src/pages/Meeting.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  DCard, PageHeader, DBadge, DBtn, DSpinner, DEmpty, fadeUp, stagger,
} from "@/components/ui/dark";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays, Plus, MapPin, Users, Search,
  Pencil, Trash2, Link as LinkIcon, CheckCircle2,
  Clock, XCircle, CalendarCheck,
} from "lucide-react";
import { meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────
interface Meeting {
  id: number;
  date: string;
  agenda: string;
  venue: string | null;
  meeting_type: string;
  category: string;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  next_meeting_date: string | null;
  total_members: number;
  total_present: number;
  total_absent: number;
}

const EMPTY_FORM = {
  date: "",
  agenda: "",
  venue: "",
  meeting_type: "regular",
  category: "internal",
  status: "scheduled",
  meeting_link: "",
  notes: "",
  next_meeting_date: "",
};
type FormState = typeof EMPTY_FORM;

// ── Helpers ───────────────────────────────────────────────────
function statusConfig(status: string): { label: string; variant: "green" | "blue" | "red" | "amber" | "gray" } {
  switch (status) {
    case "completed": return { label: "Completed", variant: "green" };
    case "scheduled": return { label: "Scheduled", variant: "blue" };
    case "cancelled": return { label: "Cancelled", variant: "red" };
    case "postponed": return { label: "Postponed", variant: "amber" };
    default:          return { label: status,       variant: "gray" };
  }
}

function attendanceRate(m: Meeting) {
  if (!m.total_members) return 0;
  return Math.round((m.total_present / m.total_members) * 100);
}

// ── Dark form input (outside component to prevent focus loss) ──
function DFormInput({ value, onChange, type = "text", placeholder, required }: any) {
  return (
    <input
      value={value} onChange={onChange} type={type}
      placeholder={placeholder} required={required}
      className="w-full rounded-xl px-3 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{children}</p>;
}

// ── Form (outside component to prevent focus loss) ────────────
function MeetingForm({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">

        <div className="col-span-2 space-y-1">
          <DLabel>Agenda *</DLabel>
          <DFormInput
            value={form.agenda}
            onChange={(e: any) => setForm(f => ({ ...f, agenda: e.target.value }))}
            placeholder="e.g. Monthly savings collection"
            required
          />
        </div>

        <div className="space-y-1">
          <DLabel>Date *</DLabel>
          <DFormInput
            type="date"
            value={form.date}
            onChange={(e: any) => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1">
          <DLabel>Next Meeting Date</DLabel>
          <DFormInput
            type="date"
            value={form.next_meeting_date}
            onChange={(e: any) => setForm(f => ({ ...f, next_meeting_date: e.target.value }))}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <DLabel>Venue</DLabel>
          <DFormInput
            value={form.venue}
            onChange={(e: any) => setForm(f => ({ ...f, venue: e.target.value }))}
            placeholder="e.g. Gram Panchayat Office"
          />
        </div>

        <div className="space-y-1">
          <DLabel>Meeting Type</DLabel>
          <Select value={form.meeting_type} onValueChange={v => setForm(f => ({ ...f, meeting_type: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="special">Special</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="annual">Annual General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <DLabel>Category</DLabel>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External (Bank/Govt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <DLabel>Status</DLabel>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <DLabel>Meeting Link (for virtual meetings)</DLabel>
          <DFormInput
            value={form.meeting_link}
            onChange={(e: any) => setForm(f => ({ ...f, meeting_link: e.target.value }))}
            placeholder="https://meet.google.com/..."
          />
        </div>

        <div className="col-span-2 space-y-1">
          <DLabel>Notes</DLabel>
          <DFormInput
            value={form.notes}
            onChange={(e: any) => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional information..."
          />
        </div>

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Meetings() {
  const [meetings, setMeetings]         = useState<Meeting[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");

  const [showAdd, setShowAdd]           = useState(false);
  const [addForm, setAddForm]           = useState<FormState>({ ...EMPTY_FORM });
  const [isSaving, setIsSaving]         = useState(false);

  const [editMeeting, setEditMeeting]   = useState<Meeting | null>(null);
  const [editForm, setEditForm]         = useState<FormState>({ ...EMPTY_FORM });

  const [deleteMeeting, setDeleteMeeting] = useState<Meeting | null>(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await meetingsApi.list();
      setMeetings(res.meetings || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }

  const filtered = meetings.filter(m =>
    m.agenda.toLowerCase().includes(search.toLowerCase()) ||
    (m.venue || "").toLowerCase().includes(search.toLowerCase()) ||
    m.status.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const completed  = meetings.filter(m => m.status === "completed").length;
  const scheduled  = meetings.filter(m => m.status === "scheduled").length;
  const avgRate    = meetings.length
    ? Math.round(meetings.reduce((s, m) => s + attendanceRate(m), 0) / meetings.length)
    : 0;

  // ── Add ──────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.date || !addForm.agenda.trim()) {
      toast.error("Date and agenda are required"); return;
    }
    setIsSaving(true);
    try {
      await meetingsApi.create(addForm);
      toast.success("Meeting scheduled!");
      setAddForm({ ...EMPTY_FORM });
      setShowAdd(false);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create meeting");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────
  function openEdit(m: Meeting) {
    setEditMeeting(m);
    setEditForm({
      date:              m.date ? m.date.split("T")[0] : "",
      agenda:            m.agenda            || "",
      venue:             m.venue             || "",
      meeting_type:      m.meeting_type      || "regular",
      category:          m.category          || "internal",
      status:            m.status            || "scheduled",
      meeting_link:      m.meeting_link      || "",
      notes:             m.notes             || "",
      next_meeting_date: m.next_meeting_date ? m.next_meeting_date.split("T")[0] : "",
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editMeeting) return;
    setIsSaving(true);
    try {
      await meetingsApi.update(String(editMeeting.id), editForm);
      toast.success("Meeting updated!");
      setEditMeeting(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update meeting");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteMeeting) return;
    setDeleting(true);
    try {
      await meetingsApi.delete(String(deleteMeeting.id));
      toast.success("Meeting deleted");
      setDeleteMeeting(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete meeting");
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <DashboardLayout>

      <PageHeader title="Meetings" subtitle="Schedule, track and manage SHG meetings">
        <DBtn variant="primary" onClick={() => { setAddForm({ ...EMPTY_FORM }); setShowAdd(true); }}>
          <Plus className="w-4 h-4" /> Schedule Meeting
        </DBtn>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: CalendarCheck, color: "#10B981", label: "Completed",      value: completed },
          { icon: Clock,         color: "#60d8ff", label: "Upcoming",       value: scheduled },
          { icon: Users,         color: "#C2185B", label: "Avg Attendance", value: `${avgRate}%` },
        ].map(({ icon: Icon, color, label, value }) => (
          <DCard key={label} className="p-5 hover:border-white/12 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white leading-tight">{value}</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-medium placeholder:text-white/25 outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          placeholder="Search by agenda, venue or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        />
      </div>

      {/* List */}
      {loading ? (
        <DSpinner />
      ) : filtered.length === 0 ? (
        <DCard className="py-4">
          <DEmpty
            icon={CalendarDays}
            title={search ? "No meetings match your search." : "No meetings scheduled yet."}
            subtitle={!search ? "Click \"Schedule Meeting\" to get started." : undefined}
          />
        </DCard>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(meeting => {
            const { label, variant } = statusConfig(meeting.status);
            const rate = attendanceRate(meeting);
            return (
              <motion.div key={meeting.id} variants={fadeUp}>
                <DCard className="group hover:border-white/15 transition-all duration-300 h-full">
                  {/* Top accent bar */}
                  <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,#C2185B,#6A1B9A)" }} />

                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white group-hover:text-pink-300 transition-colors leading-tight truncate"
                          title={meeting.agenda}>
                          {meeting.agenda}
                        </h3>
                        <p className="text-xs text-white/35 mt-1">
                          {new Date(meeting.date).toLocaleDateString("en-IN", {
                            weekday: "short", day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <DBadge variant={variant}>{label}</DBadge>
                    </div>

                    {/* Type + Category badges */}
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                        {meeting.meeting_type}
                      </span>
                      {meeting.category === "external" && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd" }}>
                          External
                        </span>
                      )}
                    </div>

                    {/* Venue */}
                    {meeting.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-white/35 mb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{meeting.venue}</span>
                      </div>
                    )}

                    {/* Meeting link */}
                    {meeting.meeting_link && (
                      <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#C2185B] hover:text-pink-300 transition-colors mb-2">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        Join online
                      </a>
                    )}

                    {/* Attendance bar */}
                    {meeting.status === "completed" && meeting.total_members > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/35 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.total_present}/{meeting.total_members} attended
                          </span>
                          <span className="font-bold text-[#C2185B]">{rate}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${rate}%`, background: "linear-gradient(90deg,#C2185B,#6A1B9A)" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Next meeting */}
                    {meeting.next_meeting_date && (
                      <p className="text-xs text-white/30 mb-3">
                        Next: {new Date(meeting.next_meeting_date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <Link
                        to={`/meeting-attendance?meetingId=${meeting.id}`}
                        className="text-xs font-bold text-[#C2185B] hover:text-pink-300 transition-colors"
                      >
                        Mark Attendance →
                      </Link>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(meeting)}
                          className="p-1.5 rounded-lg hover:bg-[#C2185B]/15 text-[#C2185B] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteMeeting(meeting)}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </DCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Add Dialog ──────────────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto"
          style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              Schedule Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <MeetingForm form={addForm} setForm={setAddForm} />
            <div className="flex gap-3 justify-end pt-5 mt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Schedule"}
              </DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={!!editMeeting} onOpenChange={o => !o && setEditMeeting(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto"
          style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]" /> Edit Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <MeetingForm form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 justify-end pt-5 mt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setEditMeeting(null)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <AlertDialog open={!!deleteMeeting} onOpenChange={o => !o && setDeleteMeeting(null)}>
        <AlertDialogContent style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Meeting?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              This will permanently delete "{deleteMeeting?.agenda}" and all its attendance records.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff" }}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}