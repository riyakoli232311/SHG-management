import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, PiggyBank, Landmark, Calendar, Phone, MapPin, User } from "lucide-react";
import { members } from "@/data/members";
import { getSavingsByMember, getMemberTotalSavings } from "@/data/savings";
import { getLoansByMember, getRepaymentPercentage } from "@/data/loans";
import { getRepaymentsByLoan } from "@/data/repayments";

export default function MemberProfile() {
  const { memberId } = useParams();
  const member = members.find((m) => m.member_id === memberId);

  if (!member) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Member not found</p>
          <Button asChild className="mt-4">
            <Link to="/members">Back to Members</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const memberSavings = getSavingsByMember(member.member_id);
  const totalSavings = getMemberTotalSavings(member.member_id);
  const memberLoans = getLoansByMember(member.member_id);
  const activeLoans = memberLoans.filter((l) => l.status === "Active");

  return (
    <DashboardLayout>
      <Link
        to="/members"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Link>

      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{member.name}</h1>
            <p className="text-muted-foreground">Member ID: {member.member_id}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {member.village}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {member.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(member.join_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Edit Profile</Button>
            <Button>Record Saving</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          subtitle={`${memberSavings.length} contributions`}
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle={`₹${activeLoans.reduce((s, l) => s + l.loan_amount, 0).toLocaleString()} outstanding`}
          icon={Landmark}
          variant="info"
        />
        <StatCard
          title="Monthly Income"
          value={`₹${member.income.toLocaleString()}`}
          subtitle={`Age: ${member.age} years`}
          icon={User}
        />
      </div>

      {/* Savings History */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Savings History</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberSavings.slice(0, 6).map((saving) => (
                <TableRow key={saving.saving_id}>
                  <TableCell>
                    {saving.month} {saving.year}
                  </TableCell>
                  <TableCell className="font-medium">₹{saving.amount.toLocaleString()}</TableCell>
                  <TableCell>{saving.payment_mode}</TableCell>
                  <TableCell>{new Date(saving.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Loan Status */}
      {memberLoans.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-4">Loan History</h3>
          <div className="space-y-4">
            {memberLoans.map((loan) => {
              const progress = getRepaymentPercentage(loan);
              return (
                <div key={loan.loan_id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{loan.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{loan.loan_amount.toLocaleString()} • {loan.tenure} months • {loan.interest_rate}% interest
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar
                        value={progress}
                        variant={loan.status === "Completed" ? "success" : "default"}
                      />
                    </div>
                    <span className="text-sm font-medium">{progress}% repaid</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    EMI: ₹{loan.emi.toLocaleString()}/month • Paid: ₹{loan.total_paid.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
