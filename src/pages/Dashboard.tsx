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
  Sparkles,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  CheckCircle,
  Plus,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const totalSavings = getTotalSavings();
  const activeLoans = getActiveLoans();
  const overdueRepayments = getOverdueRepayments();
  const pendingRepayments = getPendingRepayments();

  // Mock recent activities
  const recentActivities = [
    { type: "savings", message: "Priya Sharma deposited ₹2,000", time: "2 hours ago", icon: PiggyBank },
    { type: "loan", message: "New loan approved for Anjali Patel", time: "4 hours ago", icon: Landmark },
    { type: "member", message: "Sunita Devi joined the SHG", time: "1 day ago", icon: Users },
    { type: "repayment", message: "EMI received from Meera Kumari", time: "1 day ago", icon: CheckCircle },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 fill-[#FBC02D] text-[#FBC02D]" />
              <span className="text-white/80 text-sm font-medium">Welcome back, Sakhi!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Empowering Women. Enabling Growth.
            </h1>
            <p className="text-white/80">
              Here's how {shgInfo.name} is performing today
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0" asChild>
              <Link to="/members">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Link>
            </Button>
            <Button className="bg-[#FBC02D] text-[#F57F17] hover:bg-[#F9A825] border-0" asChild>
              <Link to="/savings">
                Record Savings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total SHGs"
          value="1"
          subtitle="Active groups"
          icon={Users}
          variant="primary"
          trend={{ value: 0, positive: true }}
        />
        <StatCard
          title="Total Members"
          value={members.length}
          subtitle="Active members"
          icon={Users}
          variant="success"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Total Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          subtitle="Group savings"
          icon={PiggyBank}
          variant="info"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Active Loans"
          value={`₹${activeLoans.reduce((s, l) => s + l.loan_amount, 0).toLocaleString()}`}
          subtitle={`${activeLoans.length} loans disbursed`}
          icon={Landmark}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#C2185B]" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-[#C2185B]/20 hover:bg-[#C2185B]/5 hover:border-[#C2185B]" asChild>
              <Link to="/members">
                <Users className="w-4 h-4 mr-3 text-[#C2185B]" />
                Add New Member
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#C2185B]/20 hover:bg-[#C2185B]/5 hover:border-[#C2185B]" asChild>
              <Link to="/savings">
                <PiggyBank className="w-4 h-4 mr-3 text-[#C2185B]" />
                Record Savings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#C2185B]/20 hover:bg-[#C2185B]/5 hover:border-[#C2185B]" asChild>
              <Link to="/loans">
                <Landmark className="w-4 h-4 mr-3 text-[#C2185B]" />
                Create New Loan
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start border-[#C2185B]/20 hover:bg-[#C2185B]/5 hover:border-[#C2185B]" asChild>
              <Link to="/repayments">
                <Calendar className="w-4 h-4 mr-3 text-[#C2185B]" />
                Record Repayment
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#6A1B9A]" />
              </div>
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B]/10 to-[#6A1B9A]/10 flex items-center justify-center flex-shrink-0">
                    <activity.icon className="w-5 h-5 text-[#C2185B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FBC02D]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F57F17]" />
              </div>
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Savings Target</span>
                  <span className="text-sm text-[#C2185B] font-semibold">78%</span>
                </div>
                <div className="h-2 bg-[#C2185B]/10 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Loan Recovery</span>
                  <span className="text-sm text-[#6A1B9A] font-semibold">92%</span>
                </div>
                <div className="h-2 bg-[#6A1B9A]/10 rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-gradient-to-r from-[#6A1B9A] to-[#C2185B] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Member Growth</span>
                  <span className="text-sm text-[#F57F17] font-semibold">+15%</span>
                </div>
                <div className="h-2 bg-[#FBC02D]/20 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-[#FBC02D] to-[#F57F17] rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Loans */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <Landmark className="w-4 h-4 text-[#C2185B]" />
              </div>
              Active Loans
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#C2185B] hover:bg-[#C2185B]/5" asChild>
              <Link to="/loans">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeLoans.slice(0, 4).map((loan) => {
                const member = members.find((m) => m.member_id === loan.member_id);
                const progress = getRepaymentPercentage(loan);
                return (
                  <div key={loan.loan_id} className="flex items-center gap-4 p-3 rounded-xl bg-[#C2185B]/5 hover:bg-[#C2185B]/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-semibold text-sm">
                      {member?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{member?.name}</p>
                        <span className="text-sm font-semibold text-[#C2185B]">
                          ₹{loan.loan_amount.toLocaleString()}
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        size="sm"
                        variant={progress >= 50 ? "success" : "default"}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#6A1B9A]">{progress}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Repayments */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#6A1B9A]" />
              </div>
              Recent Repayments
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#6A1B9A] hover:bg-[#6A1B9A]/5" asChild>
              <Link to="/repayments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#C2185B]/10">
                    <TableHead className="text-[#C2185B]">Member</TableHead>
                    <TableHead className="text-[#C2185B]">Due Date</TableHead>
                    <TableHead className="text-[#C2185B]">Amount</TableHead>
                    <TableHead className="text-[#C2185B]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...overdueRepayments, ...pendingRepayments].slice(0, 5).map((rep) => {
                    const loan = loans.find((l) => l.loan_id === rep.loan_id);
                    const member = members.find((m) => m.member_id === loan?.member_id);
                    return (
                      <TableRow key={rep.repayment_id} className="border-[#C2185B]/5 hover:bg-[#C2185B]/5">
                        <TableCell className="font-medium">{member?.name}</TableCell>
                        <TableCell>{new Date(rep.due_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-[#C2185B]">₹{loan?.emi.toLocaleString()}</TableCell>
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
      </div>
    </DashboardLayout>
  );
}
