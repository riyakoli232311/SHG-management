import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Users, CheckCircle2, XCircle,
  IndianRupee, ClipboardList, Save, AlertCircle,
} from "lucide-react";
import { meetingAttendanceApi, meetingsApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface AttendanceRow {
  member_id:      number;
  member_name:    string;
  member_role:    string;
  id:             number | null;
  attended:       boolean;
  late_minutes:   number;
  fine_amount:    number;
  fine_paid:      boolean;
  tasks_assigned: string;
  notes:          string;
}

interface Meeting {
  id: number;
  agenda: string;
  date: string;
  status: string;
  venue: string | null;
  total_members: number;
  total_present: number;
  total_absent:  number;
}

const ROLE_ORDER: Record<string, number> = {
  president: 1, secretary: 2, treasurer: 3, member: 4,
};

// ── Main Page ─────────────────────────────────────────────────
export default function MeetingAttendance() {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("meetingId");

  const [meeting, setMeeting]       = useState<Meeting | null>(null);
  const [rows, setRows]             = useState<AttendanceRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [markingFine, setMarkingFine] = useState<number | null>(null);

  useEffect(() => {
    if (meetingId) load();
    else setLoading(false);
  }, [meetingId]);

  async function load() {
    if (!meetingId) return;
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        meetingsApi.get(meetingId),
        meetingAttendanceApi.getForMeeting(meetingId),
      ]);
      setMeeting(mRes.meeting);
      setRows(aRes.attendance || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  // ── Row update helpers ────────────────────────────────────────
  function toggle(memberId: number) {
    setRows(prev => prev.map(r => {
      if (r.member_id !== memberId) return r;
      const attended = !r.attended;
      return {
        ...r,
        attended,
        // Auto-set fine to 50 for absent, clear if present
        fine_amount: !attended ? 50 : 0,
        fine_paid:   !attended ? false : r.fine_paid,
      };
    }));
  }

  function setField(memberId: number, field: keyof AttendanceRow, value: any) {
    setRows(prev => prev.map(r =>
      r.member_id === memberId ? { ...r, [field]: value } : r
    ));
  }

  // ── Save all ──────────────────────────────────────────────────
  async function handleSave() {
    if (!meetingId) return;
    setSaving(true);
    try {
      await meetingAttendanceApi.bulkSave(meetingId, rows.map(r => ({
        member_id:      r.member_id,
        attended:       r.attended,
        late_minutes:   r.late_minutes,
        fine_amount:    r.fine_amount,
        fine_paid:      r.fine_paid,
        tasks_assigned: r.tasks_assigned || null,
        notes:          r.notes || null,
      })));
      toast.success("Attendance saved!");
      load(); // Reload to get updated meeting totals
    } catch (err: any) {
      toast.error(err?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  // ── Mark fine paid ────────────────────────────────────────────
  async function markFinePaid(attendanceId: number, memberId: number) {
    setMarkingFine(memberId);
    try {
      await meetingAttendanceApi.markFinePaid(String(attendanceId));
      setRows(prev => prev.map(r =>
        r.member_id === memberId ? { ...r, fine_paid: true } : r
      ));
      toast.success("Fine marked as paid");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update fine");
    } finally {
      setMarkingFine(null);
    }
  }

  // ── Derived stats ─────────────────────────────────────────────
  const presentCount = rows.filter(r => r.attended).length;
  const absentCount  = rows.length - presentCount;
  const totalFines   = rows.reduce((s, r) => s + (r.attended ? 0 : Number(r.fine_amount)), 0);
  const unpaidFines  = rows.filter(r => !r.attended && r.fine_amount > 0 && !r.fine_paid)
                          .reduce((s, r) => s + Number(r.fine_amount), 0);

  // Sort rows by role order
  const sortedRows = [...rows].sort((a, b) =>
    (ROLE_ORDER[a.member_role] || 4) - (ROLE_ORDER[b.member_role] || 4) ||
    a.member_name.localeCompare(b.member_name)
  );

  // ── Missing meetingId ─────────────────────────────────────────
  if (!meetingId) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Meeting ID is missing.</p>
          <Link to="/meetings" className="text-[#C2185B] hover:underline mt-2 inline-block">
            Go back to Meetings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* Back */}
      <div className="mb-4">
        <Link to="/meetings"
          className="text-sm text-gray-500 hover:text-[#C2185B] flex items-center gap-1 group w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Meetings
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {meeting?.agenda || "Meeting Attendance"}
          </h1>
          {meeting && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date(meeting.date).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
              {meeting.venue && ` · ${meeting.venue}`}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white shrink-0"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : (
        <>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: CheckCircle2, color: "#388E3C", label: "Present",      value: presentCount },
              { icon: XCircle,      color: "#D32F2F", label: "Absent",       value: absentCount  },
              { icon: IndianRupee,  color: "#F57C00", label: "Total Fines",  value: `₹${totalFines}` },
              { icon: AlertCircle,  color: "#6A1B9A", label: "Unpaid Fines", value: `₹${unpaidFines}` },
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

          {/* Progress bar */}
          {rows.length > 0 && (
            <div className="bg-white border border-border/60 rounded-xl px-4 py-3 mb-6 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Attendance progress</span>
                <span className="font-medium text-[#C2185B]">
                  {rows.length ? Math.round((presentCount / rows.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-full transition-all duration-500"
                  style={{ width: `${rows.length ? (presentCount / rows.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Attendance Table */}
          {sortedRows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-white rounded-xl border border-dashed border-gray-300">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No members found for this SHG.</p>
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C2185B]" />
                  Member Attendance — {rows.length} members
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left">
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Member</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Present</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Late (min)</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Fine (₹)</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Fine Status</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Task Assigned</th>
                        <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map(row => (
                        <tr
                          key={row.member_id}
                          className={cn(
                            "border-b transition-colors",
                            row.attended
                              ? "hover:bg-green-50/30"
                              : "bg-red-50/20 hover:bg-red-50/40"
                          )}
                        >
                          {/* Member */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {row.member_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{row.member_name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{row.member_role}</p>
                              </div>
                            </div>
                          </td>

                          {/* Present toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggle(row.member_id)}
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all mx-auto",
                                row.attended
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : "bg-red-100 text-red-500 hover:bg-red-200"
                              )}
                            >
                              {row.attended
                                ? <CheckCircle2 className="w-5 h-5" />
                                : <XCircle className="w-5 h-5" />
                              }
                            </button>
                          </td>

                          {/* Late minutes */}
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              value={row.late_minutes || ""}
                              onChange={e => setField(row.member_id, "late_minutes", Number(e.target.value))}
                              placeholder="0"
                              disabled={!row.attended}
                              className="w-20 h-8 text-sm disabled:opacity-40"
                            />
                          </td>

                          {/* Fine amount */}
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={0}
                              value={row.fine_amount || ""}
                              onChange={e => setField(row.member_id, "fine_amount", Number(e.target.value))}
                              placeholder="0"
                              disabled={row.attended}
                              className="w-24 h-8 text-sm disabled:opacity-40"
                            />
                          </td>

                          {/* Fine paid */}
                          <td className="px-4 py-3">
                            {!row.attended && Number(row.fine_amount) > 0 ? (
                              row.fine_paid ? (
                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  <CheckCircle2 className="w-3 h-3" /> Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => row.id && markFinePaid(row.id, row.member_id)}
                                  disabled={!row.id || markingFine === row.member_id}
                                  className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50"
                                >
                                  {markingFine === row.member_id ? "..." : "Mark Paid"}
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Task assigned */}
                          <td className="px-4 py-3">
                            <Input
                              value={row.tasks_assigned}
                              onChange={e => setField(row.member_id, "tasks_assigned", e.target.value)}
                              placeholder="e.g. Bring passbook"
                              className="w-44 h-8 text-sm"
                            />
                          </td>

                          {/* Notes */}
                          <td className="px-4 py-3">
                            <Input
                              value={row.notes}
                              onChange={e => setField(row.member_id, "notes", e.target.value)}
                              placeholder="Optional note"
                              className="w-44 h-8 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {presentCount} present · {absentCount} absent
                  </span>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#C2185B] hover:bg-[#AD1457] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Attendance"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </>
      )}
    </DashboardLayout>
  );
}