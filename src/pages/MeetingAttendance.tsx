import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
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
import { Users, Plus, Pencil, Trash2, Clock, AlignLeft, ArrowLeft } from "lucide-react";
import { meetingAttendanceApi, meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const EMPTY_FORM = {
  check_in_time: "",
  checkout_time: "",
  minutes_of_the_meeting: "",
};

type FormState = typeof EMPTY_FORM;

export default function MeetingAttendance() {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("meetingId");

  const [meeting, setMeeting] = useState<Record<string, unknown> | null>(null);
  const [attendances, setAttendances] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);

  const [editObj, setEditObj] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ ...EMPTY_FORM });

  const [deleteObj, setDeleteObj] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (meetingId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [meetingId]);

  async function loadData() {
    if (!meetingId) return;
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        meetingsApi.get(meetingId),
        meetingAttendanceApi.getForMeeting(meetingId),
      ]);
      setMeeting(mRes.meeting as Record<string, unknown>);
      setAttendances((aRes.attendance as Record<string, unknown>[]) || []);
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingId) return;
    
    setIsSaving(true);
    try {
      await meetingAttendanceApi.create({
        ...addForm,
        meeting_id: meetingId,
      });
      toast.success("Attendance record added!");
      setAddForm({ ...EMPTY_FORM });
      setShowAdd(false);
      loadData(); // Reload to get new data
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add attendance");
    } finally {
      setIsSaving(false);
    }
  }

  function openEdit(record: Record<string, unknown>) {
    setEditObj(record);
    setEditForm({
      check_in_time: (record["check in time"] as string) || "",
      checkout_time: (record["checkout time"] as string) || "",
      minutes_of_the_meeting: (record["minutes of the meeting"] as string) || "",
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editObj || !editObj.id || !meetingId) return;
    setIsSaving(true);
    try {
      await meetingAttendanceApi.update(String(editObj.id), {
        ...editForm,
        meeting_id: meetingId,
      });
      toast.success("Attendance updated!");
      setEditObj(null);
      loadData();
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update attendance");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteObj || !deleteObj.id) return;
    setDeleting(true);
    try {
      await meetingAttendanceApi.delete(String(deleteObj.id));
      toast.success("Record deleted");
      setDeleteObj(null);
      loadData();
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  }

  if (!meetingId) {
    return (
      <DashboardLayout>
        <PageHeader title="Meeting Attendance" description="Select a meeting to view attendance" />
        <div className="text-center py-16 text-muted-foreground">
          <p>Meeting ID is missing from the URL.</p>
          <Link to="/meetings" className="text-[#C2185B] hover:underline mt-2 inline-block">
            Go back to Meetings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link to="/meetings" className="text-sm text-gray-500 hover:text-[#C2185B] flex items-center gap-1 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Meetings
        </Link>
      </div>
      
      <PageHeader
        title={`Attendance: ${meeting?.agenda as string || 'Meeting'}`}
        description={`Manage attendance records and minutes for this meeting`}
      />

      <div className="flex justify-end mb-6">
        <Button
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Record
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : attendances.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-dashed border-gray-300">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="font-medium text-gray-600">No attendance records for this meeting yet.</p>
          <p className="text-sm mt-1">Click "Add Record" to log meeting details.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {attendances.map((record) => (
            <Card key={String(record.id)} className="hover:border-[#C2185B]/40 hover:shadow-md transition-all group">
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                        <Clock className="w-4 h-4 opacity-70" />
                        Check-in: {record["check in time"] ? new Date("1970-01-01T" + (record["check in time"] as string)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not set"}
                      </div>
                      <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
                        <Clock className="w-4 h-4 opacity-70" />
                        Check-out: {record["checkout time"] ? new Date("1970-01-01T" + (record["checkout time"] as string)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not set"}
                      </div>
                    </div>
                    {record["minutes of the meeting"] && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium mb-1 border-b border-gray-200 pb-1">
                          <AlignLeft className="w-4 h-4 text-[#C2185B]" />
                          Minutes of Meeting
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{record["minutes of the meeting"] as string}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 self-end md:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(record)}
                      className="text-[#C2185B] border-[#C2185B]/20 hover:bg-[#C2185B]/5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteObj(record)}
                      className="text-red-500 border-red-500/20 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C2185B]" /> Add Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Check-in Time</Label>
                <Input
                  type="time"
                  value={addForm.check_in_time}
                  onChange={(e) => setAddForm({ ...addForm, check_in_time: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Check-out Time</Label>
                <Input
                  type="time"
                  value={addForm.checkout_time}
                  onChange={(e) => setAddForm({ ...addForm, checkout_time: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Minutes of the Meeting</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2185B]/50"
                  value={addForm.minutes_of_the_meeting}
                  onChange={(e) => setAddForm({ ...addForm, minutes_of_the_meeting: e.target.value })}
                  placeholder="Record discussions, decisions made, action items, etc..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editObj} onOpenChange={(o) => !o && setEditObj(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]" /> Edit Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Check-in Time</Label>
                <Input
                  type="time"
                  value={editForm.check_in_time}
                  onChange={(e) => setEditForm({ ...editForm, check_in_time: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Check-out Time</Label>
                <Input
                  type="time"
                  value={editForm.checkout_time}
                  onChange={(e) => setEditForm({ ...editForm, checkout_time: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Minutes of the Meeting</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2185B]/50"
                  value={editForm.minutes_of_the_meeting}
                  onChange={(e) => setEditForm({ ...editForm, minutes_of_the_meeting: e.target.value })}
                  placeholder="Record discussions, decisions made, action items, etc..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setEditObj(null)}>Cancel</Button>
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
              This will permanently delete "{deleteMeeting?.agenda as string}" and all its associated attendance records. This cannot be undone.
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
