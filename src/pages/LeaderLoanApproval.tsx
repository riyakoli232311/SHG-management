// src/pages/LeaderLoanApproval.tsx — Dark Theme
import { useEffect, useState } from "react";
import { loanRequestsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  DCard, PageHeader, DBtn, DSpinner, DEmpty, fadeUp, stagger,
} from "@/components/ui/dark";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

// ── Info row ──────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function LeaderLoanApproval() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { loadPending(); }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const res = await loanRequestsApi.getLeaderReview();
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally { setLoading(false); }
  }

  async function handleApprove(loanId: string, status: "approved" | "rejected") {
    setProcessing(loanId);
    try {
      await loanRequestsApi.approveLoan({ loan_id: loanId, status });
      toast.success(`Loan ${status} successfully`);
      loadPending();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status} loan`);
    } finally { setProcessing(null); }
  }

  async function handleVerifyDoc(docId: string, status: "approved" | "rejected" | "request_reupload") {
    let remarks = "";
    if (status !== "approved") {
      const reason = window.prompt(`Enter reason to ${status} document:`);
      if (reason === null) return;
      remarks = reason;
    }
    setProcessing(docId);
    try {
      await loanRequestsApi.verifyDocument(docId, { status, remarks });
      toast.success(`Document marked as ${status}`);
      loadPending();
    } catch (err: any) {
      toast.error(err.message || "Failed to update document");
    } finally { setProcessing(null); }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      auto_verified:    ["Auto Verified",    "rgba(16,185,129,0.15)"],
      flagged:          ["Flagged",          "rgba(239,68,68,0.15)"],
      approved:         ["Approved",         "rgba(59,130,246,0.15)"],
      rejected:         ["Rejected",         "rgba(239,68,68,0.15)"],
      request_reupload: ["Re-upload Req",    "rgba(245,158,11,0.15)"],
      pending:          ["Pending Review",   "rgba(255,255,255,0.08)"],
    };
    const [label, bg] = map[s] || ["Unknown", "rgba(255,255,255,0.06)"];
    const textColor = s === "flagged" || s === "rejected" ? "#f87171" : s === "auto_verified" || s === "approved" ? "#34d399" : s === "request_reupload" ? "#fbbf24" : "#94a3b8";
    return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: bg, color: textColor }}>{label}</span>;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Verify Loan Requests"
        subtitle="Review and approve pending loan requests from SHG members."
      />

      {loading ? (
        <DSpinner />
      ) : requests.length === 0 ? (
        <DCard className="py-4">
          <DEmpty icon={ShieldCheck} title="No Pending Requests" subtitle="All loan requests have been reviewed." />
        </DCard>
      ) : (
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid lg:grid-cols-2 gap-5">
          {requests.map((req) => (
            <motion.div key={req.loan_id} variants={fadeUp}>
              <DCard className="flex flex-col h-full">
                {/* Top accent bar */}
                <div className="h-1 w-full rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg,#C2185B,#6A1B9A)", boxShadow: "0 0 12px rgba(194,24,91,0.4)" }} />

                <div className="p-6 flex-1 flex flex-col gap-4">
                  {/* Member header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0"
                        style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 14px rgba(194,24,91,0.3)" }}>
                        {req.member_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{req.member_name}</h3>
                        <p className="text-xs text-white/40">Phone: {req.phone || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right px-4 py-2 rounded-xl shrink-0"
                      style={{ background: "rgba(194,24,91,0.12)", border: "1px solid rgba(194,24,91,0.2)" }}>
                      <p className="text-base font-black text-white">₹{Number(req.amount).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-[#C2185B] uppercase tracking-widest">Requested</p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <InfoRow label="Purpose" value={req.purpose} />
                    <InfoRow label="Duration" value={`${req.duration} Months`} />
                    <div className="col-span-2">
                      <InfoRow label="Aadhaar Card Number" value={
                        <span className="font-mono tracking-[0.2em] text-purple-300">{req.aadhar_number || "N/A"}</span>
                      } />
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`w-5 h-5 shrink-0 ${req.trust_score > 70 ? "text-emerald-400" : req.trust_score > 40 ? "text-amber-400" : "text-red-400"}`} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-bold text-white/70">Internal Trust Score</span>
                          <span className="text-xs font-black text-indigo-300">{req.trust_score}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${req.trust_score}%`, background: req.trust_score > 70 ? "#10B981" : req.trust_score > 40 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <p className="text-[10px] text-indigo-300/70 font-medium">
                          Total Savings: ₹{Number(req.total_savings).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {req.documents?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Attached Documents</p>
                      <div className="flex flex-col gap-2">
                        {req.documents.map((d: any) => {
                          const base = import.meta.env.VITE_API_URL || "http://localhost:3001";
                          let ext = null;
                          if (d.extracted_data) {
                            try { ext = typeof d.extracted_data === "string" ? JSON.parse(d.extracted_data) : d.extracted_data; } catch {}
                          }
                          return (
                            <div key={d.doc_id} className="rounded-xl p-3 flex flex-col gap-2.5"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <a href={`${base}${d.file_path}`} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[#C2185B] hover:text-pink-300 font-semibold text-sm transition-colors">
                                  <img src={`${base}${d.file_path}`} alt="thumb" className="w-8 h-8 object-cover rounded opacity-70"
                                    onError={e => (e.currentTarget.style.display = "none")} />
                                  {d.document_type}
                                </a>
                                {statusBadge(d.status)}
                              </div>

                              {ext && (
                                <div className="grid grid-cols-2 gap-2 text-xs rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                                  {ext.aadhaar_number && <div className="text-white/40">Aadhaar: <span className="text-white/80">XXXX XXXX {ext.aadhaar_number.slice(-4)}</span></div>}
                                  {ext.ifsc_code && <div className="text-white/40">IFSC: <span className="text-white/80">{ext.ifsc_code}</span></div>}
                                  {ext.account_number && <div className="text-white/40">A/C: <span className="text-white/80">{ext.account_number}</span></div>}
                                  {ext.matched_name && <div className="col-span-2 text-white/40">Name Match: <span className="text-emerald-400 font-semibold">{ext.matched_name}</span></div>}
                                  {ext.flags?.length > 0 && <div className="col-span-2 text-red-400 font-medium">⚠️ {ext.flags.join(", ")}</div>}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <button className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                                  style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                                  onClick={() => handleVerifyDoc(d.doc_id, "approved")}>Approve</button>
                                <button className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                                  style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" }}
                                  onClick={() => handleVerifyDoc(d.doc_id, "rejected")}>Reject</button>
                                <button className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                                  style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.18)" }}
                                  onClick={() => handleVerifyDoc(d.doc_id, "request_reupload")}>Re-upload</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Final Approve/Reject */}
                  <div className="grid grid-cols-2 gap-3 mt-auto pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <DBtn
                      variant="danger"
                      className="w-full justify-center"
                      disabled={processing === req.loan_id}
                      onClick={() => handleApprove(req.loan_id, "rejected")}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </DBtn>
                    <DBtn
                      variant="success"
                      className="w-full justify-center"
                      disabled={processing === req.loan_id}
                      onClick={() => handleApprove(req.loan_id, "approved")}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Loan
                    </DBtn>
                  </div>
                </div>
              </DCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
