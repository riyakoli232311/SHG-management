import { useEffect, useState } from "react";
import { loanRequestsApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Landmark, ArrowRight, ShieldCheck, UserCheck, CalendarDays, CheckCircle2, Clock, XCircle, FilePlus } from "lucide-react";

const PURPOSES = [
  "Dairy Farming", "Vegetable Trading", "Tailoring", "Poultry",
  "Goat Rearing", "Pickle Making", "Small Business", "Medical Emergency", 
  "Child Education", "Agriculture", "Other"
];

const EMPTY_FORM = {
  amount: "",
  purpose: "",
  duration: "12",
  aadhar_number: "",
  aadhar_image: null as File | null,
  passbook_image: null as File | null
};

export default function MemberLoanDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [user]);

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

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.purpose || !form.aadhar_number) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!form.aadhar_image || !form.passbook_image) {
      toast.error("Please upload both Aadhaar and Passbook images");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (user?.id) formData.append('member_id', user.id);
      formData.append('amount', form.amount);
      formData.append('purpose', form.purpose);
      formData.append('duration', form.duration);
      formData.append('aadhar_number', form.aadhar_number);
      formData.append('aadhar_image', form.aadhar_image);
      formData.append('passbook_image', form.passbook_image);

      await loanRequestsApi.apply(formData);
      
      toast.success("Loan requested successfully!");
      setShowApply(false);
      setForm({ ...EMPTY_FORM });
      loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
            My Loan Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Apply for new loans and track your active requests seamlessly.</p>
        </div>
        <Button 
          onClick={() => setShowApply(true)}
          className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] hover:bg-opacity-90 transition-all text-white shadow-md rounded-full px-6"
        >
          <FilePlus className="w-4 h-4 mr-2" /> Request New Loan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 bg-gray-50/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Landmark className="w-16 h-16 opacity-30 mb-4" />
              <p className="text-lg font-medium text-gray-700">No Loan Requests Found</p>
              <p className="text-sm max-w-sm mt-1">You haven't made any loan requests yet. Click the button above to apply for a new loan based on your savings.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map(req => (
            <Card key={req.loan_id} className="border border-gray-100 shadow-sm hover:shadow transition-all group overflow-hidden">
              <div className={`h-1.5 w-full ${req.status === 'approved' ? 'bg-green-500' : req.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} w-10 h-10 rounded-full flex justify-center items-center`}>
                      {req.status === 'approved' && <CheckCircle2 className="w-5 h-5" />}
                      {req.status === 'rejected' && <XCircle className="w-5 h-5" />}
                      {req.status === 'pending' && <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize text-lg">{req.status}</p>
                      <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">₹{Number(req.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Requested Amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase">Purpose</p>
                      <p className="text-sm font-medium">{req.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase">Duration</p>
                      <p className="text-sm font-medium">{req.duration} Months</p>
                    </div>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2.5 rounded-lg flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-gray-700">Internal Trust Score</p>
                        <span className="text-xs font-bold text-indigo-600">{req.trust_score}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, req.trust_score)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Request a Loan</DialogTitle>
          </DialogHeader>
          <div className="p-1 mb-2">
            <p className="text-xs text-muted-foreground bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-lg text-blue-800 font-medium">
              💡 Maximum eligible loan is 3x your total savings. Your internal Trust Score will be calculated automatically based on past repayments and savings regularity.
            </p>
          </div>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Loan Amount (₹) *</Label>
              <Input 
                type="number" 
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Purpose *</Label>
              <Select value={form.purpose} onValueChange={v => setForm({...form, purpose: v})}>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>
                  {PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Duration (Months) *</Label>
              <Input 
                type="number" 
                placeholder="e.g. 12"
                value={form.duration}
                onChange={e => setForm({...form, duration: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Aadhaar Card Number *</Label>
              <Input 
                type="text" 
                placeholder="0000 0000 0000"
                value={form.aadhar_number}
                onChange={e => setForm({...form, aadhar_number: e.target.value})}
                required
              />
            </div>

            <div className="pt-2 border-t mt-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">Upload Documents *</Label>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Aadhaar Card Image</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setForm({...form, aadhar_image: e.target.files?.[0] || null})}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bank Passbook (Front Page)</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setForm({...form, passbook_image: e.target.files?.[0] || null})}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white mt-4" disabled={submitting}>
              {submitting ? "Submitting Request..." : "Submit Application"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
