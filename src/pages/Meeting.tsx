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
import { CalendarDays, Plus, MapPin, Users, Key, AlignLeft, Search, Pencil, Trash2, KeyRound } from "lucide-react";
import { meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const EMPTY_FORM = {
  date: "",
  agenda: "",
  venue: "",
  status: "scheduled",
  notes: "",
  meeting_type: "regular",
  organizer_id: "",
  duration: "",
  next_meeting_date: "",
  total_members: "",
  total_present: "",
  category: "internal"
};

type FormState = typeof EMPTY_FORM;

export default function Meetings() {
  const [meetings, setMeetings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);

  const [editMeeting, setEditMeeting] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });

  const [deleteMeeting, setDeleteMeeting] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      setLoading(true);
      const res = await meetingsApi.list();
      setMeetings((res.meetings as Record<string, unknown>[]) || []);
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }

  const filtered = meetings.filter(
    (m) =>
      String(m.agenda || "").toLowerCase().includes(search.toLowerCase()) ||
      String(m.venue || "").toLowerCase().includes(search.toLowerCase()) ||
      String(m.status || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.agenda.trim()) return toast.error("Agenda is required");
    if (!addForm.date) return toast.error("Date is required");
    
    setIsSaving(true);
    try {
      await meetingsApi.create({
        ...addForm,
        organizer_id: addForm.organizer_id ? Number(addForm.organizer_id) : null,
        duration: addForm.duration ? Number(addForm.duration) : null,
        total_members: addForm.total_members ? Number(addForm.total_members) : 0,
        total_present: addForm.total_present ? Number(addForm.total_present) : 0,
      });
      toast.success("Meeting scheduled!");
      setAddForm({ ...EMPTY_FORM });
      setShowAdd(false);
      loadMeetings();
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule meeting");
    } finally {
      setIsSaving(false);
    }
  }

  function openEdit(m: Record<string, unknown>) {
    setEditMeeting(m);
    setEditForm({
      date: m.date ? new Date(m.date as string).toISOString().split('T')[0] : "",
      agenda: m.agenda as string || "",
      venue: m.venue as string || "",
      status: m.status as string || "scheduled",
      notes: m.notes as string || "",
      meeting_type: m["meeting type"] as string || "regular",
      organizer_id: m["organizer id"] ? String(m["organizer id"]) : "",
      duration: m.duration ? String(m.duration) : "",
      next_meeting_date: m["next meeting date"] ? new Date(m["next meeting date"] as string).toISOString().split('T')[0] : "",
      total_members: m["total members"] ? String(m["total members"]) : "",
      total_present: m["total present"] ? String(m["total present"]) : "",
      category: String(m.category || "internal")
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editMeeting || !editMeeting.id) return;
    setIsSaving(true);
    try {
      await meetingsApi.update(String(editMeeting.id), {
        ...editForm,
        organizer_id: editForm.organizer_id ? Number(editForm.organizer_id) : null,
        duration: editForm.duration ? Number(editForm.duration) : null,
        total_members: editForm.total_members ? Number(editForm.total_members) : 0,
        total_present: editForm.total_present ? Number(editForm.total_present) : 0,
        meeting_type: editForm.meeting_type,
        next_meeting_date: editForm.next_meeting_date
      });
      toast.success("Meeting updated!");
      setEditMeeting(null);
      loadMeetings();
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update meeting");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteMeeting || !deleteMeeting.id) return;
    setDeleting(true);
    try {
      await meetingsApi.delete(String(deleteMeeting.id));
      toast.success("Meeting deleted");
      setDeleteMeeting(null);
      loadMeetings();
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete meeting");
    } finally {
      setDeleting(false);
    }
  }

  function MeetingFormFields({
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
            <Label>Agenda / Title *</Label>
            <Input
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="e.g. Monthly Savings Collection"
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label>Meeting Date *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label>Duration (Minutes)</Label>
            <Input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="60"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Venue</Label>
            <Input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. Panchayat Bhawan"
            />
          </div>
          
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label>Meeting Type</Label>
            <Select
              value={form.meeting_type}
              onValueChange={(v) => setForm({ ...form, meeting_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
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
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal (SHG Members)</SelectItem>
                <SelectItem value="external">External (Bank/Govt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label>Next Meeting Date</Label>
            <Input
              type="date"
              value={form.next_meeting_date}
              onChange={(e) => setForm({ ...form, next_meeting_date: e.target.value })}
            />
          </div>
          
          <div className="col-span-2 space-y-1">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional information..."
            />
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'postponed': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Meetings"
        description={`Manage your SHG meetings and agendas`}
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by agenda, venue or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Schedule Meeting
        </Button>
      </div>

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
          {filtered.map((meeting) => (
            <Card
              key={String(meeting.id)}
              className="hover:border-[#C2185B]/40 hover:shadow-md transition-all border-border group"
            >
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <CalendarDays className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-gray-900 group-hover:text-[#C2185B] transition-colors" title={meeting.agenda as string}>
                      {(meeting.agenda as string) || "Untitled Meeting"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <KeyRound className="w-3.5 h-3.5 opacity-70" />
                      {new Date(meeting.date as string).toLocaleDateString("en-IN", { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {meeting.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        <span className="truncate">{meeting.venue as string}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(meeting.status as string)}`}>
                      {(meeting.status as string) || "Unknown"}
                    </span>
                    <span className="text-[10px] uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {(meeting["meeting type"] as string) || "Regular"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
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
                </div>

                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border/50">
                  <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {String(meeting["total present"] || 0)} / {String(meeting["total members"] || 0)}
                    </div>
                  </div>
                  <Link 
                    to={`/meeting-attendance?meetingId=${meeting.id}`}
                    className="text-xs font-semibold text-[#C2185B] hover:text-[#AD1457] hover:underline transition-colors"
                  >
                    Manage Attendance →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#C2185B]" /> Schedule Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-2">
            <MeetingFormFields form={addForm} setForm={setAddForm} />
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Schedule Meeting"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editMeeting} onOpenChange={(o) => !o && setEditMeeting(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]" /> Edit Meeting
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <MeetingFormFields form={editForm} setForm={setEditForm} />
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setEditMeeting(null)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteMeeting} onOpenChange={(o) => !o && setDeleteMeeting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteMeeting?.agenda}" and all its associated attendance records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
