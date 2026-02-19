import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { BarChart3, TrendingUp, PiggyBank, Users, Sparkles, Heart } from "lucide-react";
import { members } from "@/data/members";
import { getTotalSavings, savings } from "@/data/savings";
import { loans, getTotalDisbursed } from "@/data/loans";
import { getTotalCollected, repayments } from "@/data/repayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock chart data
const savingsData = [
  { month: "Jan", amount: 6000 },
  { month: "Feb", amount: 6100 },
  { month: "Mar", amount: 6200 },
  { month: "Apr", amount: 5300 },
];

const loanDistribution = [
  { purpose: "Business", count: 4 },
  { purpose: "Education", count: 1 },
  { purpose: "Medical", count: 1 },
  { purpose: "Farming", count: 2 },
];

export default function Reports() {
  const totalSavings = getTotalSavings();
  const totalDisbursed = getTotalDisbursed();
  const totalCollected = getTotalCollected();

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports & Insights"
        description="Financial overview and analytics for your SHG"
      />

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={members.length}
          subtitle="Active members"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          subtitle="Group savings"
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Loans Disbursed"
          value={`₹${totalDisbursed.toLocaleString()}`}
          subtitle="Total disbursed"
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title="Repayments Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          subtitle="Total collected"
          icon={BarChart3}
          variant="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Savings Growth Chart */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#C2185B]" />
              </div>
              Savings Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsData.map((item, index) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-10 text-sm text-muted-foreground font-medium">{item.month}</span>
                  <div className="flex-1 h-8 bg-[#C2185B]/10 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-lg flex items-center justify-end px-3 transition-all duration-500"
                      style={{ width: `${(item.amount / 7000) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Monthly savings collection trend (2024)
            </p>
          </CardContent>
        </Card>

        {/* Loan Distribution */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#6A1B9A]" />
              </div>
              Loan Distribution by Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loanDistribution.map((item) => (
                <div key={item.purpose} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A]"></div>
                    <span className="font-medium">{item.purpose}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-[#C2185B]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-full"
                        style={{ width: `${(item.count / loans.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Total loans: {loans.length}
            </p>
          </CardContent>
        </Card>

        {/* Repayment Success Rate */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-emerald-600" />
              </div>
              Repayment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(194, 24, 91, 0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeDasharray={`${(repayments.filter((r) => r.status === "Paid").length / repayments.length) * 440} 440`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C2185B" />
                      <stop offset="100%" stopColor="#6A1B9A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gradient">
                    {Math.round((repayments.filter((r) => r.status === "Paid").length / repayments.length) * 100)}%
                  </span>
                  <span className="text-sm text-muted-foreground">On-time</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-emerald-50">
                <p className="text-2xl font-bold text-emerald-600">
                  {repayments.filter((r) => r.status === "Paid").length}
                </p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FBC02D]/10">
                <p className="text-2xl font-bold text-[#F57F17]">
                  {repayments.filter((r) => r.status === "Pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <p className="text-2xl font-bold text-red-500">
                  {repayments.filter((r) => r.status === "Overdue").length}
                </p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Village-wise Members */}
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#C2185B]" />
              </div>
              Members by Village
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Rampur", "Gopalnagar", "Shivpuri"].map((village) => {
                const count = members.filter((m) => m.village === village).length;
                return (
                  <div key={village} className="flex items-center justify-between p-3 rounded-xl bg-[#C2185B]/5 hover:bg-[#C2185B]/10 transition-colors">
                    <span className="font-medium">{village}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {members
                          .filter((m) => m.village === village)
                          .slice(0, 3)
                          .map((m, i) => (
                            <div
                              key={m.member_id}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                        {count > 3 && (
                          <div className="w-8 h-8 rounded-full bg-[#C2185B]/20 border-2 border-white flex items-center justify-center text-xs font-medium text-[#C2185B]">
                            +{count - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#C2185B]">{count} members</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
