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

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Purpose</p>
                    <p className="text-sm font-medium text-gray-800">{req.purpose}</p>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Duration</p>
                    <p className="text-sm font-medium text-gray-800">{req.duration} Months</p>
                  </div>
                  
                  {/* Trust Score & Savings */}
                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-3 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-centershrink-0 border border-blue-100 flex-shrink-0">
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
                  <div className="flex gap-2">
                    {req.documents && req.documents.length > 0 ? (
                      req.documents.map((d: any) => (
                        <div key={d.doc_id} className="text-xs border px-2.5 py-1.5 rounded-md bg-white flex items-center gap-1.5 text-gray-600">
                          <FileText className="w-3.5 h-3.5 text-[#C2185B]" /> {d.document_type}
                        </div>
                      ))
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
