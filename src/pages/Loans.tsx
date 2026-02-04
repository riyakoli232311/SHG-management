import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Landmark, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { loans, calculateEMI, getActiveLoans, getTotalDisbursed, getRepaymentPercentage } from "@/data/loans";
import { members } from "@/data/members";

export default function Loans() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const activeLoans = getActiveLoans();
  const totalDisbursed = getTotalDisbursed();
  const completedLoans = loans.filter((l) => l.status === "Completed").length;

  return (
    <DashboardLayout>
      <PageHeader title="Loans" description="Manage loan disbursements and tracking">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Loan</DialogTitle>
            </DialogHeader>
            <CreateLoanForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Disbursed"
          value={`₹${totalDisbursed.toLocaleString()}`}
          subtitle={`${loans.length} loans`}
          icon={Landmark}
          variant="primary"
        />
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Completed"
          value={completedLoans}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="At Risk"
          value={0}
          subtitle="No defaults"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Loan Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {loans.map((loan) => {
          const member = members.find((m) => m.member_id === loan.member_id);
          const progress = getRepaymentPercentage(loan);
          return (
            <div
              key={loan.loan_id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {member?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member?.name}</h3>
                    <p className="text-sm text-muted-foreground">{loan.loan_id}</p>
                  </div>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium">{loan.purpose}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">₹{loan.loan_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">EMI</span>
                  <span>₹{loan.emi.toLocaleString()}/month</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span>{loan.interest_rate}% p.a.</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tenure</span>
                  <span>{loan.tenure} months</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Repayment Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <ProgressBar
                  value={progress}
                  variant={loan.status === "Completed" ? "success" : progress >= 50 ? "default" : "warning"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  ₹{loan.total_paid.toLocaleString()} paid of ₹{(loan.emi * loan.tenure).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

function CreateLoanForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    interestRate: "12",
    tenure: "",
    purpose: "",
  });

  const emi = formData.amount && formData.tenure
    ? calculateEMI(Number(formData.amount), Number(formData.interestRate), Number(formData.tenure))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Member</Label>
        <Select value={formData.memberId} onValueChange={(v) => setFormData((p) => ({ ...p, memberId: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Choose member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.member_id} value={m.member_id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Loan Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="₹ 10,000"
            value={formData.amount}
            onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            placeholder="12"
            value={formData.interestRate}
            onChange={(e) => setFormData((p) => ({ ...p, interestRate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenure">Tenure (Months)</Label>
        <Select value={formData.tenure} onValueChange={(v) => setFormData((p) => ({ ...p, tenure: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select tenure" />
          </SelectTrigger>
          <SelectContent>
            {[6, 12, 18, 24, 36].map((t) => (
              <SelectItem key={t} value={String(t)}>
                {t} months
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Input
          id="purpose"
          placeholder="e.g., Small Business, Education"
          value={formData.purpose}
          onChange={(e) => setFormData((p) => ({ ...p, purpose: e.target.value }))}
        />
      </div>

      {emi > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Calculated EMI</p>
          <p className="text-2xl font-bold text-success">₹{emi.toLocaleString()}/month</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total payable: ₹{(emi * Number(formData.tenure)).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Loan</Button>
      </div>
    </form>
  );
}
