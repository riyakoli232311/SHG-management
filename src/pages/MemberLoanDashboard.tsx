// src/pages/MemberLoanDashboard.tsx — Dark Theme
import { useEffect, useState } from "react";
import { loanRequestsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  DCard, PageHeader, DBtn, DSpinner, DEmpty, fadeUp, stagger,
} from "@/components/ui/dark";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Landmark, ArrowRight, ShieldCheck, UserCheck, CalendarDays,
  CheckCircle2, Clock, XCircle, FilePlus, AlertCircle, Upload,
} from "lucide-react";
import { motion } from "framer-motion";

const PURPOSES = [
  "Dairy Farming", "Vegetable Trading", "Tailoring", "Poultry",
  "Goat Rearing", "Pickle Making", "Small Business", "Medical Emergency",
  "Child Education", "Agriculture", "Other",
];

const EMPTY_FORM = {
  amount: "",
  purpose: "",
  duration: "12",
  aadhar_number: "",
  aadhar_image: null as File | null,
  passbook_image: null as File | null,
};

// ── Outside component to prevent focus loss ────────────────────
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

function statusConfig(status: string) {
  switch (status) {
    case "approved": return { icon: CheckCircle2, color: "#10B981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.2)", label: "Approved" };
    case "rejected": return { icon: XCircle, color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.2)", label: "Rejected" };
    default:         return { icon: Clock, color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.2)", label: "Pending" };
  }
}

export default function MemberLoanDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [reuploadingDoc, setReuploadingDoc] = useState<string | null>(null);

  useEffect(() => { loadRequests(); }, [user]);

  async function loadRequests() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await loanRequestsApi.getMemberLoans(user.id);
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleReupload(docId: string, file: File) {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) { toast.error("Please select a valid JPG/PNG image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File exceeds 5MB limit"); return; }
    setReuploadingDoc(docId);
    try {
      const formData = new FormData();
      formData.append("new_document", file);
      await loanRequestsApi.reuploadDocument(docId, formData);
      toast.success("Document re-uploaded successfully for verification");
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to re-upload document");
    } finally { setReuploadingDoc(null); }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.purpose || !form.aadhar_number) {
      toast.error("Please fill all required fields"); return;
    }
    if (!form.aadhar_image || !form.passbook_image) {
      toast.error("Please upload both Aadhaar and Passbook images"); return;
    }
    const isValidImage = (file: File) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) { toast.error(`${file.name} is not a valid JPG/PNG image`); return false; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB size limit`); return false; }
      return true;
    };
    if (!isValidImage(form.aadhar_image) || !isValidImage(form.passbook_image)) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (user?.id) formData.append("member_id", user.id);
      formData.append("amount", form.amount);
      formData.append("purpose", form.purpose);
      formData.append("duration", form.duration);
      formData.append("aadhar_number", form.aadhar_number);
      formData.append("aadhar_image", form.aadhar_image);
      formData.append("passbook_image", form.passbook_image);
      await loanRequestsApi.apply(formData);
      toast.success("Loan requested successfully!");
      setShowApply(false);
      setForm({ ...EMPTY_FORM });
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally { setSubmitting(false); }
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Loans" subtitle="Apply for new loans and track your active requests.">
        <DBtn variant="primary" onClick={() => setShowApply(true)}>
          <FilePlus className="w-5 h-5" /> Request New Loan
        </DBtn>
      </PageHeader>

      {loading ? (
        <DSpinner />
      ) : requests.length === 0 ? (
        <DCard className="py-4">
          <DEmpty
            icon={Landmark}
            title="No Loan Requests Found"
            subtitle="You haven't made any loan requests yet. Click the button above to apply."
          />
        </DCard>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid md:grid-cols-2 gap-5">
          {requests.map((req) => {
            const { icon: StatusIcon, color, bg, border, label } = statusConfig(req.status);
            return (
              <motion.div key={req.loan_id} variants={fadeUp}>
                <DCard className="group hover:border-white/15 transition-all duration-300 h-full flex flex-col">
                  {/* Top accent bar */}
                  <div className="h-1 w-full rounded-t-2xl"
                    style={{
                      background: req.status === "approved"
                        ? "linear-gradient(90deg,#10B981,#059669)"
                        : req.status === "rejected"
                        ? "linear-gradient(90deg,#ef4444,#dc2626)"
                        : "linear-gradient(90deg,#C2185B,#6A1B9A)",
                    }} />

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: bg, border: `1px solid ${border}` }}>
                          <StatusIcon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <p className="font-bold text-white capitalize">{label}</p>
                          <p className="text-xs text-white/35">
                            {new Date(req.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">₹{Number(req.amount).toLocaleString("en-IN")}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Requested</p>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Purpose
                        </p>
                        <p className="text-sm font-semibold text-white">{req.purpose}</p>
                      </div>
                      <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Duration
                        </p>
                        <p className="text-sm font-semibold text-white">{req.duration} Months</p>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <div className="flex items-center gap-3">
                        <ShieldCheck className={`w-5 h-5 shrink-0 ${req.trust_score > 70 ? "text-emerald-400" : req.trust_score > 40 ? "text-amber-400" : "text-red-400"}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold text-white/70">Internal Trust Score</span>
                            <span className="text-xs font-black text-indigo-300">{req.trust_score}/100</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(100, req.trust_score)}%`,
                                background: req.trust_score > 70 ? "#10B981" : req.trust_score > 40 ? "#F59E0B" : "#EF4444",
                              }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    {req.documents && req.documents.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Submitted Documents</p>
                        <div className="flex flex-col gap-2">
                          {req.documents.map((d: any) => (
                            <div key={d.doc_id}
                              className="rounded-xl p-3 flex items-center justify-between gap-3"
                              style={{
                                background: d.status === "request_reupload" ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${d.status === "request_reupload" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                              }}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {d.status === "request_reupload" && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <p className="text-sm font-semibold text-white capitalize truncate">{d.document_type}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: d.status === "approved" ? "#34d399" : d.status === "rejected" ? "#f87171" : d.status === "request_reupload" ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>
                                    {d.status.replace("_", " ")}
                                  </span>
                                  {d.status === "request_reupload" && d.remarks && (
                                    <span className="text-[10px] text-amber-300/70 truncate max-w-[160px]" title={d.remarks}>
                                      Reason: {d.remarks}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {d.status === "request_reupload" && (
                                <div className="shrink-0">
                                  <input
                                    type="file"
                                    id={`reupload-${d.doc_id}`}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={e => {
                                      if (e.target.files?.[0]) {
                                        handleReupload(d.doc_id, e.target.files[0]);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  <DBtn
                                    size="sm"
                                    variant="outline"
                                    disabled={reuploadingDoc === d.doc_id}
                                    onClick={() => document.getElementById(`reupload-${d.doc_id}`)?.click()}
                                  >
                                    {reuploadingDoc === d.doc_id
                                      ? "Uploading…"
                                      : <><Upload className="w-3.5 h-3.5" /> Re-upload</>}
                                  </DBtn>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Apply Dialog ──────────────────────────────────────── */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto"
          style={{ background: "#0a041a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                <Landmark className="w-4 h-4 text-white" />
              </div>
              Request a Loan
            </DialogTitle>
          </DialogHeader>

          {/* Info banner */}
          <div className="rounded-xl px-4 py-3 text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            💡 Maximum eligible loan is <strong>3× your total savings</strong>. Your Internal Trust Score is auto-calculated based on past repayments and savings regularity.
          </div>

          <form onSubmit={handleApply} className="space-y-4 mt-1">
            <div>
              <DLabel>Loan Amount (₹) *</DLabel>
              <DFormInput
                type="number"
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={(e: any) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <DLabel>Purpose *</DLabel>
              <Select value={form.purpose} onValueChange={v => setForm({ ...form, purpose: v })}>
                <SelectTrigger className="bg-white/5 border-white/8 text-white text-sm rounded-xl h-10">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <DLabel>Duration (Months) *</DLabel>
              <DFormInput
                type="number"
                placeholder="e.g. 12"
                value={form.duration}
                onChange={(e: any) => setForm({ ...form, duration: e.target.value })}
                required
              />
            </div>

            <div>
              <DLabel>Aadhaar Card Number *</DLabel>
              <DFormInput
                placeholder="0000 0000 0000"
                value={form.aadhar_number}
                onChange={(e: any) => setForm({ ...form, aadhar_number: e.target.value })}
                required
              />
            </div>

            {/* Document uploads */}
            <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">Upload Documents *</p>
              <div className="space-y-3">
                {[
                  { label: "Aadhaar Card Image", key: "aadhar_image" },
                  { label: "Bank Passbook (Front Page)", key: "passbook_image" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <DLabel>{label}</DLabel>
                    <label
                      className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all hover:border-[#C2185B]/40"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)" }}>
                      <Upload className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-sm text-white/40">
                        {(form as any)[key]
                          ? <span className="text-[#C2185B] font-semibold">{((form as any)[key] as File).name}</span>
                          : "Click to upload JPG/PNG (max 5MB)"}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={e => setForm({ ...form, [key]: e.target.files?.[0] || null })}
                        required
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <DBtn variant="ghost" onClick={() => setShowApply(false)}>Cancel</DBtn>
              <DBtn variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : <><ArrowRight className="w-4 h-4" /> Submit Application</>}
              </DBtn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}