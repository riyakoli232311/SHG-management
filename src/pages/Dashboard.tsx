// src/pages/Dashboard.tsx  (REPLACE your existing Dashboard.tsx)
// This version fetches real data from the DB via the API.
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import {
  Users, PiggyBank, Landmark, AlertCircle,
  TrendingUp, Heart, CheckCircle, Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, loansApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, shg } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, loansRes] = await Promise.all([
          dashboardApi.get(),
          loansApi.list({ status: 'active' }),
        ]);
        setStats(dashRes.data);
        setRecentLoans(loansRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 fill-[#FBC02D] text-[#FBC02D]" />
              <span className="text-white/80 text-sm font-medium">Welcome back, Sakhi!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {shg?.name || user?.name}
            </h1>
            <p className="text-white/70 text-sm">
              {shg?.village && `${shg.village} · `}Empowering Women. Enabling Growth.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/members">
              <Button variant="secondary" size="sm" className="gap-1">
                <Plus className="w-3 h-3" /> Add Member
              </Button>
            </Link>
            <Link to="/loans">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                New Loan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          subtitle={`${stats?.activeMembers ?? 0} active`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Savings"
          value={`₹${(stats?.totalSavings ?? 0).toLocaleString()}`}
          subtitle="Group savings"
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="Loans Disbursed"
          value={`₹${(stats?.totalLoansDisbursed ?? 0).toLocaleString()}`}
          subtitle={`${stats?.activeLoansCount ?? 0} active`}
          icon={Landmark}
          variant="info"
        />
        <StatCard
          title="Overdue EMIs"
          value={stats?.overdueRepayments ?? 0}
          subtitle={`${stats?.pendingRepayments ?? 0} pending`}
          icon={AlertCircle}
          variant={stats?.overdueRepayments > 0 ? 'danger' : 'primary'}
        />
      </div>

      {/* Active Loans Table */}
      {recentLoans.length > 0 && (
        <Card className="border-[#C2185B]/10">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C2185B]" />
              Active Loans
            </CardTitle>
            <Link to="/loans" className="text-xs text-[#C2185B] hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Member</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">Purpose</th>
                    <th className="text-center py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.map(loan => (
                    <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 font-medium">{loan.member_name}</td>
                      <td className="py-2 text-right">₹{Number(loan.loan_amount).toLocaleString()}</td>
                      <td className="py-2 text-right text-muted-foreground">{loan.purpose || '—'}</td>
                      <td className="py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {recentLoans.length === 0 && stats?.totalMembers === 0 && (
        <Card className="border-dashed border-2 border-[#C2185B]/30">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-[#C2185B]/40 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Get Started!</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first member to begin managing your SHG.</p>
            <Link to="/members">
              <Button className="bg-[#C2185B] hover:bg-[#AD1457] text-white">
                <Plus className="w-4 h-4 mr-1" /> Add First Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}