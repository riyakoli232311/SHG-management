import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Users,
  PiggyBank,
  Landmark,
  AlertCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { members } from "@/data/members";
import { getTotalSavings } from "@/data/savings";
import { loans, getActiveLoans, getRepaymentPercentage } from "@/data/loans";
import { getOverdueRepayments, getPendingRepayments } from "@/data/repayments";
import { shgInfo } from "@/data/users";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const totalSavings = getTotalSavings();
  const activeLoans = getActiveLoans();
  const overdueRepayments = getOverdueRepayments();
  const pendingRepayments = getPendingRepayments();

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome, ${shgInfo.name}`}
        description="Here's an overview of your group's financial health"
      />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={members.length}
          subtitle="Active members"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Group Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          subtitle="Total collected"
          icon={PiggyBank}
          variant="success"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle={`₹${activeLoans.reduce((s, l) => s + l.loan_amount, 0).toLocaleString()} disbursed`}
          icon={Landmark}
          variant="info"
        />
        <StatCard
          title="Overdue EMIs"
          value={overdueRepayments.length}
          subtitle={`${pendingRepayments.length} pending`}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Quick Actions & Active Loans */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/members">
                <Users className="w-4 h-4 mr-2" />
                Add New Member
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/savings">
                <PiggyBank className="w-4 h-4 mr-2" />
                Record Savings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/loans">
                <Landmark className="w-4 h-4 mr-2" />
                Create New Loan
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/repayments">
                <Calendar className="w-4 h-4 mr-2" />
                Record Repayment
              </Link>
            </Button>
          </div>
        </div>

        {/* Active Loans */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Active Loans</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/loans">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {activeLoans.slice(0, 4).map((loan) => {
              const member = members.find((m) => m.member_id === loan.member_id);
              const progress = getRepaymentPercentage(loan);
              return (
                <div key={loan.loan_id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {member?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{member?.name}</p>
                      <span className="text-sm text-muted-foreground">
                        ₹{loan.loan_amount.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      size="sm"
                      variant={progress >= 50 ? "success" : "default"}
                    />
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Repayments */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Recent Repayments</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/repayments">View All</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...overdueRepayments, ...pendingRepayments].slice(0, 5).map((rep) => {
                const loan = loans.find((l) => l.loan_id === rep.loan_id);
                const member = members.find((m) => m.member_id === loan?.member_id);
                return (
                  <TableRow key={rep.repayment_id} className="table-row-hover">
                    <TableCell className="font-medium">{member?.name}</TableCell>
                    <TableCell>{new Date(rep.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{loan?.emi.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={rep.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
