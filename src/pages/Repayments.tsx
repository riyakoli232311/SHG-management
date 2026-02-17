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
import { CalendarCheck, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";
import { repayments, getTotalCollected, getOverdueRepayments, getPendingRepayments } from "@/data/repayments";
import { loans } from "@/data/loans";
import { members } from "@/data/members";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Button className="btn-gradient text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <Card className="border-[#C2185B]/10 shadow-soft">
        <CardHeader className="pb-4 border-b border-[#C2185B]/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-[#C2185B]" />
            </div>
            All Repayments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#C2185B]/10 bg-gradient-to-r from-[#C2185B]/5 to-transparent">
                  <TableHead className="text-[#C2185B] font-semibold">Repayment ID</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Member</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Loan ID</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Due Date</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Payment Date</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Amount</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Balance</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Penalty</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Status</TableHead>
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
                        "border-[#C2185B]/5 hover:bg-[#C2185B]/5 transition-colors",
                        isOverdue && "bg-red-50"
                      )}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">{rep.repayment_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-semibold text-xs">
                            {member?.name.charAt(0)}
                          </div>
                          <span className="font-medium">{member?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{rep.loan_id}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(rep.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {rep.payment_date
                          ? new Date(rep.payment_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="font-semibold text-[#C2185B]">
                        {rep.amount_paid > 0 ? `₹${rep.amount_paid.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="font-medium">₹{rep.remaining_balance.toLocaleString()}</TableCell>
                      <TableCell>
                        {rep.penalty > 0 ? (
                          <span className="text-red-500 font-medium">₹{rep.penalty}</span>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
