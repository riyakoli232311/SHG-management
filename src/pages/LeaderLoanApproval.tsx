import { useEffect, useState } from "react";
import { loanRequestsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Landmark, ShieldCheck, UserCheck, CalendarDays, CheckCircle2, Clock, XCircle, ChevronRight, FileText } from "lucide-react";

export default function LeaderLoanApproval() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const res = await loanRequestsApi.getLeaderReview();
      setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(loanId: string, status: 'approved' | 'rejected') {
    setProcessing(loanId);
    try {
      await loanRequestsApi.approveLoan({ loan_id: loanId, status });
      toast.success(`Loan ${status} successfully`);
      loadPending();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status} loan`);
    } finally {
      setProcessing(null);
    }
  }

  async function handleVerifyDoc(docId: string, status: 'approved' | 'rejected' | 'request_reupload') {
    let remarks = '';
    if (status !== 'approved') {
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
      toast.error(err.message || `Failed to update document status`);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
            Verify Loan Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve pending loan requests from SHG members.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 bg-gray-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <ShieldCheck className="w-16 h-16 opacity-30 mb-4" />
              <p className="text-lg font-medium text-gray-700">No Pending Requests</p>
              <p className="text-sm mt-1">All loan requests have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map(req => (
            <Card key={req.loan_id} className="border border-gray-100 shadow-sm hover:shadow transition-all group overflow-hidden flex flex-col">
              <div className="h-1 w-full bg-amber-400" />
              <CardContent className="p-5 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] text-white flex items-center justify-center font-bold text-lg">
                      {req.member_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{req.member_name}</h3>
                      <p className="text-xs text-muted-foreground">Phone: {req.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                    <p className="text-sm font-semibold text-rose-700">₹{Number(req.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-rose-600/80 uppercase font-bold text-right tracking-wider">Requested</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Purpose</p>
                    <p className="text-sm font-medium text-gray-800">{req.purpose}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Duration</p>
                    <p className="text-sm font-medium text-gray-800">{req.duration} Months</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Aadhaar Card Number</p>
                    <p className="text-sm font-mono font-medium tracking-widest text-[#6A1B9A]">{req.aadhar_number || 'N/A'}</p>
                  </div>

                  {/* Trust Score & Savings */}
                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-3 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-blue-100">
                      <ShieldCheck className={`w-5 h-5 ${req.trust_score > 70 ? 'text-green-500' : req.trust_score > 40 ? 'text-amber-500' : 'text-red-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-700">Internal Trust Score</span>
                        <span className="text-xs font-black text-indigo-700">{req.trust_score}/100</span>
                      </div>
                      <div className="h-1.5 bg-blue-200/50 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full ${req.trust_score > 70 ? 'bg-green-500' : req.trust_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${req.trust_score}%` }} />
                      </div>
                      <p className="text-[10px] text-indigo-700/80 font-medium">
                        Total Member Savings: ₹{Number(req.total_savings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents preview */}
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">Attached Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {req.documents && req.documents.length > 0 ? (
                      <div className="flex flex-col gap-3 w-full">
                      {req.documents.map((d: any) => {
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                        let extData = null;
                        if (d.extracted_data) {
                          try { extData = typeof d.extracted_data === 'string' ? JSON.parse(d.extracted_data) : d.extracted_data; } catch(e){}
                        }

                        return (
                          <div key={d.doc_id} className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <a
                                href={`${baseUrl}${d.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#C2185B] font-semibold hover:underline"
                              >
                                <img src={`${baseUrl}${d.file_path}`} alt="doc thumb" className="w-8 h-8 object-cover rounded opacity-80" onError={(e) => e.currentTarget.style.display='none'} />
                                {d.document_type}
                              </a>
                              <div className="flex gap-2 items-center">
                                {d.status === 'auto_verified' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-bold">Auto Verified</span>}
                                {d.status === 'flagged' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-bold">Flagged Mismatch</span>}
                                {d.status === 'approved' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">Approved</span>}
                                {d.status === 'rejected' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase font-bold">Rejected</span>}
                                {d.status === 'request_reupload' && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase font-bold">Re-upload Req</span>}
                                {d.status === 'pending' && <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase font-bold">Pending Review</span>}
                              </div>
                            </div>

                            {extData && (
                              <div className="bg-gray-50 border border-gray-100 rounded p-2 text-xs grid grid-cols-2 gap-2 mt-1">
                                {extData.aadhaar_number && <div><span className="text-gray-500 font-medium">Aadhaar:</span> XXXX XXXX {extData.aadhaar_number.slice(-4)}</div>}
                                {extData.ifsc_code && <div><span className="text-gray-500 font-medium">IFSC:</span> {extData.ifsc_code}</div>}
                                {extData.account_number && <div><span className="text-gray-500 font-medium">A/C:</span> {extData.account_number}</div>}
                                {extData.matched_name && <div className="col-span-2"><span className="text-gray-500 font-medium">Name Match:</span> <span className="text-green-600 font-semibold">{extData.matched_name}</span></div>}
                                {extData.flags && extData.flags.length > 0 && (
                                  <div className="col-span-2 text-red-600 font-medium">
                                    ⚠️ {extData.flags.join(", ")}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 mt-2">
                               <Button size="sm" variant="outline" className="h-7 text-[10px] py-0 bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => handleVerifyDoc(d.doc_id, 'approved')}>Approve</Button>
                               <Button size="sm" variant="outline" className="h-7 text-[10px] py-0 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleVerifyDoc(d.doc_id, 'rejected')}>Reject</Button>
                               <Button size="sm" variant="outline" className="h-7 text-[10px] py-0 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" onClick={() => handleVerifyDoc(d.doc_id, 'request_reupload')}>Req Re-upload</Button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Basic KYC verified automatically</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={processing === req.loan_id}
                    onClick={() => handleApprove(req.loan_id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    disabled={processing === req.loan_id}
                    onClick={() => handleApprove(req.loan_id, 'approved')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Loan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
