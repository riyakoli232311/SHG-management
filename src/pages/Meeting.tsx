import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, Plus, MapPin, Users, Search,
  Pencil, Trash2, Link as LinkIcon, CheckCircle2,
  Clock, XCircle, CalendarCheck,
} from "lucide-react";
import { meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
function statusConfig(status: string) {
  switch (status) {
    case "completed":  return { label: "Completed",  cls: "bg-green-100 text-green-700" };
    case "scheduled":  return { label: "Scheduled",  cls: "bg-blue-100 text-blue-700" };
    case "cancelled":  return { label: "Cancelled",  cls: "bg-red-100 text-red-700" };
    case "postponed":  return { label: "Postponed",  cls: "bg-amber-100 text-amber-700" };
    default:           return { label: status,       cls: "bg-gray-100 text-gray-700" };
  }
}

function attendanceRate(m: Meeting) {
  if (!m.total_members) return 0;
  return Math.round((m.total_present / m.total_members) * 100);
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
          <Label>Agenda *</Label>
          <Input
            value={form.agenda}
            onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
            placeholder="e.g. Monthly savings collection"
            required
          />
        </div>

        <div className="space-y-1">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1">
          <Label>Next Meeting Date</Label>
          <Input
            type="date"
            value={form.next_meeting_date}
            onChange={e => setForm(f => ({ ...f, next_meeting_date: e.target.value }))}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Venue</Label>
          <Input
            value={form.venue}
            onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
            placeholder="e.g. Gram Panchayat Office"
          />
        </div>

        <div className="space-y-1">
          <Label>Meeting Type</Label>
          <Select value={form.meeting_type} onValueChange={v => setForm(f => ({ ...f, meeting_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="special">Special</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="annual">Annual General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External (Bank/Govt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Meeting Link (for virtual meetings)</Label>
          <Input
            value={form.meeting_link}
            onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
            placeholder="https://meet.google.com/..."
          />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Notes</Label>
          <Input
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule, track and manage SHG meetings</p>
        </div>
        <Button
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white"
          onClick={() => { setAddForm({ ...EMPTY_FORM }); setShowAdd(true); }}
        >
          <Plus className="w-4 h-4 mr-1" /> Schedule Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: CalendarCheck, color: "#388E3C", label: "Completed",       value: completed },
          { icon: Clock,         color: "#0288D1", label: "Upcoming",        value: scheduled },
          { icon: Users,         color: "#C2185B", label: "Avg Attendance",  value: `${avgRate}%` },
        ].map(({ icon: Icon, color, label, value }) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by agenda, venue or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {search ? "No meetings match your search." : "No meetings scheduled yet."}
          </p>
          {!search && <p className="text-sm mt-1">Click "Schedule Meeting" to get started.</p>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(meeting => {
            const { label, cls } = statusConfig(meeting.status);
            const rate = attendanceRate(meeting);
            return (
              <Card key={meeting.id}
                className="hover:border-[#C2185B]/40 hover:shadow-md transition-all border-border group">
                <CardContent className="pt-5 pb-4">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#C2185B] transition-colors leading-tight truncate"
                        title={meeting.agenda}>
                        {meeting.agenda}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(meeting.date).toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>
                      {label}
                    </span>
                  </div>

                  {/* Venue */}
                  {meeting.venue && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{meeting.venue}</span>
                    </div>
                  )}

                  {/* Meeting link */}
                  {meeting.meeting_link && (
                    <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#C2185B] hover:underline mb-2">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      Join online
                    </a>
                  )}

                  {/* Type + Category badges */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    <span className="text-[10px] uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {meeting.meeting_type}
                    </span>
                    {meeting.category === "external" && (
                      <span className="text-[10px] uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        External
                      </span>
                    )}
                  </div>

                  {/* Attendance bar */}
                  {meeting.status === "completed" && meeting.total_members > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.total_present}/{meeting.total_members} attended
                        </span>
                        <span className="font-medium text-[#C2185B]">{rate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Next meeting */}
                  {meeting.next_meeting_date && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Next: {new Date(meeting.next_meeting_date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Link
                      to={`/meeting-attendance?meetingId=${meeting.id}`}
                      className="text-xs font-semibold text-[#C2185B] hover:text-[#AD1457] hover:underline transition-colors"
                    >
                      Mark Attendance →
                    </Link>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(meeting)}
                        className="p-1.5 rounded hover:bg-[#C2185B]/10 text-[#C2185B] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteMeeting(meeting)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Add Dialog ──────────────────────────────────────────── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#C2185B]" /> Schedule Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <MeetingForm form={addForm} setForm={setAddForm} />
            <div className="flex gap-3 justify-end pt-4 mt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Schedule"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!editMeeting} onOpenChange={o => !o && setEditMeeting(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]" /> Edit Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <MeetingForm form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 justify-end pt-4 mt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setEditMeeting(null)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────── */}
      <AlertDialog open={!!deleteMeeting} onOpenChange={o => !o && setDeleteMeeting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteMeeting?.agenda}" and all its attendance records.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}