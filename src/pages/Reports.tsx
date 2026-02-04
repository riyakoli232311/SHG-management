import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { BarChart3, TrendingUp, PiggyBank, Users } from "lucide-react";
import { members } from "@/data/members";
import { getTotalSavings, savings } from "@/data/savings";
import { loans, getTotalDisbursed } from "@/data/loans";
import { getTotalCollected, repayments } from "@/data/repayments";

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
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={members.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Loans Disbursed"
          value={`₹${totalDisbursed.toLocaleString()}`}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title="Repayments Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          icon={BarChart3}
          variant="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Savings Growth Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-6">Savings Growth</h3>
          <div className="space-y-4">
            {savingsData.map((item, index) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-10 text-sm text-muted-foreground">{item.month}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-success rounded-lg flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${(item.amount / 7000) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-success-foreground">
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
        </div>

        {/* Loan Distribution */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-6">Loan Distribution by Purpose</h3>
          <div className="space-y-4">
            {loanDistribution.map((item) => (
              <div key={item.purpose} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>{item.purpose}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
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
        </div>

        {/* Repayment Success Rate */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-6">Repayment Performance</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--success))"
                  strokeWidth="12"
                  strokeDasharray={`${(repayments.filter((r) => r.status === "Paid").length / repayments.length) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">
                  {Math.round((repayments.filter((r) => r.status === "Paid").length / repayments.length) * 100)}%
                </span>
                <span className="text-sm text-muted-foreground">On-time</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">
                {repayments.filter((r) => r.status === "Paid").length}
              </p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {repayments.filter((r) => r.status === "Pending").length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {repayments.filter((r) => r.status === "Overdue").length}
              </p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>

        {/* Village-wise Members */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg mb-6">Members by Village</h3>
          <div className="space-y-4">
            {["Rampur", "Gopalnagar", "Shivpuri"].map((village) => {
              const count = members.filter((m) => m.village === village).length;
              return (
                <div key={village} className="flex items-center justify-between">
                  <span>{village}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members
                        .filter((m) => m.village === village)
                        .slice(0, 3)
                        .map((m, i) => (
                          <div
                            key={m.member_id}
                            className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-primary text-xs font-semibold"
                          >
                            {m.name.charAt(0)}
                          </div>
                        ))}
                      {count > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                          +{count - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{count} members</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
