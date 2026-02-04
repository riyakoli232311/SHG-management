import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarCheck, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { repayments, getTotalCollected, getOverdueRepayments, getPendingRepayments } from "@/data/repayments";
import { loans } from "@/data/loans";
import { members } from "@/data/members";
import { cn } from "@/lib/utils";

export default function Repayments() {
  const totalCollected = getTotalCollected();
  const overdueRepayments = getOverdueRepayments();
  const pendingRepayments = getPendingRepayments();
  const paidRepayments = repayments.filter((r) => r.status === "Paid");

  return (
    <DashboardLayout>
      <PageHeader
        title="Repayments"
        description="Track EMI payments and due collections"
      >
        <Button>Record Payment</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          subtitle="All repayments"
          icon={CalendarCheck}
          variant="success"
        />
        <StatCard
          title="Paid This Month"
          value={paidRepayments.length}
          subtitle="On-time payments"
          icon={CheckCircle}
          variant="primary"
        />
        <StatCard
          title="Pending"
          value={pendingRepayments.length}
          subtitle="Due this month"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Overdue"
          value={overdueRepayments.length}
          subtitle="Needs attention"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Repayments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">All Repayments</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repayment ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Loan ID</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repayments.map((rep) => {
                const loan = loans.find((l) => l.loan_id === rep.loan_id);
                const member = members.find((m) => m.member_id === loan?.member_id);
                const isOverdue = rep.status === "Overdue";

                return (
                  <TableRow
                    key={rep.repayment_id}
                    className={cn(
                      "table-row-hover",
                      isOverdue && "bg-destructive/5"
                    )}
                  >
                    <TableCell className="font-mono text-sm">{rep.repayment_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                          {member?.name.charAt(0)}
                        </div>
                        <span className="font-medium">{member?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{rep.loan_id}</TableCell>
                    <TableCell>{new Date(rep.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {rep.payment_date
                        ? new Date(rep.payment_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {rep.amount_paid > 0 ? `₹${rep.amount_paid.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>₹{rep.remaining_balance.toLocaleString()}</TableCell>
                    <TableCell>
                      {rep.penalty > 0 ? (
                        <span className="text-destructive font-medium">₹{rep.penalty}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
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
