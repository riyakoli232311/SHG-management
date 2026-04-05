// src/pages/member/MemberSavings.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { savingsApi } from "@/lib/api";
import { toast } from "sonner";

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MemberSavings() {
  const { user } = useAuth();
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        const res = await savingsApi.list({ member_id: user!.id });
        setSavings(res.data || []);
      } catch {
        toast.error("Failed to load savings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const total = savings.reduce((s, r) => s + Number(r.amount), 0);
  const avg = savings.length ? Math.round(total / savings.length) : 0;
  const thisYear = new Date().getFullYear();
  const thisYearSavings = savings.filter((s) => s.year === thisYear).reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Savings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your monthly contribution history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: PiggyBank,  color: "#C2185B", label: "Total Savings",  value: `₹${total.toLocaleString("en-IN")}`,        sub: `${savings.length} contributions` },
          { icon: Calendar,   color: "#6A1B9A", label: "This Year",      value: `₹${thisYearSavings.toLocaleString("en-IN")}`, sub: `${thisYear}` },
          { icon: TrendingUp, color: "#388E3C", label: "Monthly Average", value: `₹${avg.toLocaleString("en-IN")}`,           sub: "per month" },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart (CSS only) */}
      {savings.length > 0 && (
        <Card className="border-border/60 shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Monthly Contributions (last 12)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-20">
              {savings.slice(-12).map((s, i) => {
                const max = Math.max(...savings.slice(-12).map((x: any) => Number(x.amount)));
                const pct = max ? (Number(s.amount) / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full rounded-t bg-gradient-to-t from-[#C2185B] to-[#6A1B9A]" style={{ height: `${Math.max(pct, 6)}%` }} />
                    <span className="text-[9px] text-muted-foreground">{MONTH_NAMES[s.month]}</span>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                      ₹{Number(s.amount).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-[#C2185B]" /> All Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No savings recorded yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savings.map((s) => (
                      <TableRow key={s.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{MONTH_NAMES[s.month]} {s.year}</TableCell>
                        <TableCell><span className="font-semibold text-green-700">₹{Number(s.amount).toLocaleString("en-IN")}</span></TableCell>
                        <TableCell><span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.payment_mode}</span></TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 bg-[#C2185B]/5 rounded-xl flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-[#C2185B]">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}