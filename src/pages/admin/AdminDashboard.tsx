// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  Users, AlertCircle, Calendar, MapPin, Loader2,
  IndianRupee, Landmark, TrendingUp, Activity,
  FileText, Bell, Download, PiggyBank, Clock,
  CheckCircle2, AlertTriangle, ChevronRight, UserCheck,
  BarChart3, Sparkles, XCircle,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Types ─────────────────────────────────────────────────────
interface SHG {
  id: string;
  name: string;
  village: string;
  block: string;
  district: string;
  state: string;
  formation_date: string;
  member_count: number;
}

interface SHGDetails {
  shg: any;
  total_members: number;
  office_bearers: { president: any | null; secretary: any | null; treasurer: any | null };
  financials: { total_savings: number; active_loans_count: number; active_loans_total: number };
}

interface DistrictStats {
  totalShgs: number;
  totalMembers: number;
  totalSavings: number;
  activeLoans: number;
  activeLoansAmount: number;
  inactiveShgs: { id: string; name: string; daysSinceActivity: number }[];
}

interface ActivityItem {
  type: 'savings' | 'loan' | 'overdue' | 'member' | 'meeting';
  title: string;
  subtitle: string;
  time: string;
}

// ── Helpers ───────────────────────────────────────────────────
function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function activityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'savings':  return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    case 'loan':     return <Landmark className="w-3.5 h-3.5 text-blue-500" />;
    case 'overdue':  return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    case 'member':   return <UserCheck className="w-3.5 h-3.5 text-purple-500" />;
    case 'meeting':  return <Calendar className="w-3.5 h-3.5 text-pink-500" />;
  }
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: any; label: string; value: string | number; sub: string; color: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color }}>{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Mini horizontal bar ────────────────────────────────────────
function BarRow({
  label, value, max, formatted, warn,
}: {
  label: string; value: number; max: number; formatted: string; warn?: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-2.5 last:mb-0">
      <span className={`text-xs w-28 truncate shrink-0 ${warn ? 'text-red-500' : 'text-muted-foreground'}`}>{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: warn ? '#ef4444' : '#0288D1' }}
        />
      </div>
      <span className={`text-xs w-12 text-right font-medium shrink-0 ${warn ? 'text-red-500' : 'text-gray-700'}`}>{formatted}</span>
    </div>
  );
}

// ── Donut SVG ──────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 28, cx = 36, cy = 36, circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const strokeDash = circ * pct;
        const offset = circ * (1 - cumulative);
        cumulative += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circ - strokeDash}`}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px' }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="20" fill="white" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [shgs, setShgs]                   = useState<SHG[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedShgId, setSelectedShgId] = useState<string | null>(null);
  const [shgDetails, setShgDetails]       = useState<SHGDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [districtStats, setDistrictStats]   = useState<DistrictStats | null>(null);

  // ── Mock activity feed (replace with real API later) ──────────
  const activityFeed: ActivityItem[] = [
    { type: 'savings',  title: 'Asha Mandal — savings recorded',    subtitle: '₹2,400 collected',         time: '2h ago' },
    { type: 'loan',     title: 'Shakti Mahila — loan approved',     subtitle: '₹15,000 to Sunita Devi',   time: '4h ago' },
    { type: 'overdue',  title: 'Ujjwala SHG — EMI overdue',        subtitle: '₹850 · Priya Sharma',       time: '1d ago' },
    { type: 'member',   title: 'New member joined Jyoti Group',     subtitle: 'Meena Bai added',           time: '2d ago' },
    { type: 'meeting',  title: 'Prerna SHG — meeting scheduled',    subtitle: 'Monthly review · Apr 10',   time: '2d ago' },
    { type: 'savings',  title: 'Jyoti Group — savings recorded',   subtitle: '₹3,100 collected',          time: '3d ago' },
  ];

  useEffect(() => {
    async function loadShgs() {
      try {
        const res = await adminApi.getShgs();
        const shgList: SHG[] = res.data || [];
        setShgs(shgList);

        // Aggregate district-level stats from SHG list + detail calls
        // In a real implementation, you'd have a dedicated /api/admin/district-stats endpoint.
        // For now we compute what we can from the list.
        const totalMembers = shgList.reduce((s, g) => s + Number(g.member_count || 0), 0);

        // Simulate which SHGs are "inactive" (no savings in 60d) — replace with real data
        const inactiveShgs = shgList.slice(0, 2).map((g, i) => ({
          id: g.id,
          name: g.name,
          daysSinceActivity: 60 + i * 12,
        }));

        setDistrictStats({
          totalShgs: shgList.length,
          totalMembers,
          totalSavings: totalMembers * 1800,        // placeholder until real API
          activeLoans: Math.round(shgList.length * 3.4),
          activeLoansAmount: totalMembers * 4200,   // placeholder
          inactiveShgs,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load SHGs');
      } finally {
        setLoading(false);
      }
    }
    loadShgs();
  }, []);

  useEffect(() => {
    if (!selectedShgId) { setShgDetails(null); return; }
    async function loadDetails() {
      setDetailsLoading(true);
      try {
        const res = await adminApi.getShgDetails(selectedShgId!);
        setShgDetails(res.data);
      } catch { /* silent */ }
      finally { setDetailsLoading(false); }
    }
    loadDetails();
  }, [selectedShgId]);

  // ── Leaderboard: sort by member_count as proxy for activity ───
  const leaderboard = [...shgs].sort((a, b) => b.member_count - a.member_count).slice(0, 6);
  const leaderMax = leaderboard[0]?.member_count || 1;

  // ── Loan donut segments (mock; replace with real aggregated data) ─
  const loanSegments = [
    { value: 48, color: '#0288D1' },
    { value: 24, color: '#388E3C' },
    { value: 16, color: '#F57C00' },
    { value: 12, color: '#e5e7eb' },
  ];

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
      <AlertCircle className="w-5 h-5" />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">District Overview</h1>
          <p className="text-gray-500 text-sm">
            All Self Help Groups in your jurisdiction · {districtStats?.totalShgs ?? 0} SHGs registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export report
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-[#C2185B] hover:bg-[#AD1457] text-white">
            <Bell className="w-3.5 h-3.5" /> Send district notice
          </Button>
        </div>
      </div>

      {/* ── Inactive SHG alert ──────────────────────────────────── */}
      {districtStats && districtStats.inactiveShgs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {districtStats.inactiveShgs.length} SHG{districtStats.inactiveShgs.length > 1 ? 's' : ''} have not recorded savings in over 60 days
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {districtStats.inactiveShgs.map(g => g.name).join(', ')} · Consider sending a follow-up.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total SHGs"       value={districtStats?.totalShgs ?? 0}                              color="#C2185B" sub={`in your district`} />
        <StatCard icon={UserCheck}   label="Total members"    value={districtStats?.totalMembers ?? 0}                           color="#6A1B9A" sub={`across all groups`} />
        <StatCard icon={PiggyBank}   label="Est. district savings" value={formatCurrency(districtStats?.totalSavings ?? 0)}     color="#0288D1" sub="combined savings" />
        <StatCard icon={Landmark}    label="Active loans"     value={districtStats?.activeLoans ?? 0}                           color="#F57C00" sub={formatCurrency(districtStats?.activeLoansAmount ?? 0) + ' outstanding'} />
      </div>

      {/* ── Row: Leaderboard + Loan donut + Inactive ───────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Savings leaderboard */}
        <Card className="border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0288D1]" /> SHGs by members
            </CardTitle>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">top 6</span>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : leaderboard.map((shg, i) => (
              <BarRow
                key={shg.id}
                label={shg.name}
                value={shg.member_count}
                max={leaderMax}
                formatted={`${shg.member_count}`}
                warn={shg.member_count < 3}
              />
            ))}
          </CardContent>
        </Card>

        {/* Loan status */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#388E3C]" /> Loan status mix
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-5">
              <DonutChart segments={loanSegments} />
              <div className="space-y-2">
                {[
                  { label: 'Active',   pct: '48%', color: '#0288D1' },
                  { label: 'Closed',   pct: '24%', color: '#388E3C' },
                  { label: 'Pending',  pct: '16%', color: '#F57C00' },
                  { label: 'Other',    pct: '12%', color: '#e5e7eb' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-muted-foreground w-14">{label}</span>
                    <span className="font-medium">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">91%</p>
                <p className="text-xs text-green-600">Recovery rate</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-red-600">7</p>
                <p className="text-xs text-red-500">Overdue EMIs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive SHGs */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Inactive SHGs
            </CardTitle>
            {districtStats && districtStats.inactiveShgs.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {districtStats.inactiveShgs.length}
              </span>
            )}
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {!districtStats || districtStats.inactiveShgs.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-green-700 font-medium">All SHGs are active!</p>
                <p className="text-xs text-muted-foreground mt-1">No inactivity detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {districtStats.inactiveShgs.map((g) => (
                  <div key={g.id} className="flex items-start gap-3 p-3 bg-red-50/60 border border-red-100 rounded-xl">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${g.daysSinceActivity > 70 ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                      <p className="text-xs text-red-500 mt-0.5">No savings in {g.daysSinceActivity} days</p>
                    </div>
                    <button
                      onClick={() => setSelectedShgId(g.id)}
                      className="text-xs text-[#C2185B] hover:underline shrink-0"
                    >
                      View
                    </button>
                  </div>
                ))}
                <button className="w-full text-xs text-[#C2185B] hover:bg-[#C2185B]/5 py-2 rounded-lg border border-[#C2185B]/20 font-medium transition-colors mt-1">
                  Send follow-up to all →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

     
      <div className="grid lg:grid-cols-3 gap-5">


       

        
        <div className="lg:col-span-2 flex flex-col gap-5">

        

          {/* Recent schemes */}
          <Card className="border-border/60 shadow-sm flex-1">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C2185B]" /> Recently posted schemes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <SchemesList />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SHG directory ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">SHG directory</h2>
          <span className="text-sm text-muted-foreground">{shgs.length} registered</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shgs.map((shg) => (
            <SHGCard key={shg.id} shg={shg} onViewDetails={() => setSelectedShgId(shg.id)} />
          ))}
          {shgs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl">
              No SHGs found in your area.
            </div>
          )}
        </div>
      </div>

      {/* ── SHG Detail Modal ─────────────────────────────────────── */}
      <Dialog open={!!selectedShgId} onOpenChange={(open) => !open && setSelectedShgId(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl overflow-hidden p-0">
          {detailsLoading ? (
            <div className="p-12 flex justify-center items-center flex-col gap-4">
              <Loader2 className="w-8 h-8 text-[#C2185B] animate-spin" />
              <p className="text-gray-500 text-sm">Loading SHG details...</p>
            </div>
          ) : !shgDetails ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="font-medium text-gray-800">Could not load details</p>
              <button onClick={() => setSelectedShgId(null)} className="text-sm text-[#C2185B] hover:underline">Close</button>
            </div>
          ) : (
            <SHGDetailModal details={shgDetails} onClose={() => setSelectedShgId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── SHG Card ──────────────────────────────────────────────────
function SHGCard({ shg, onViewDetails }: { shg: SHG; onViewDetails: () => void }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C2185B]/20 transition-all flex flex-col group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2185B]/15 to-[#6A1B9A]/15 flex items-center justify-center shrink-0 text-[#C2185B] font-bold text-sm">
          {shg.name.charAt(0)}
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium shrink-0">
          {shg.member_count} members
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#C2185B] transition-colors leading-tight">{shg.name}</h3>

      <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#C2185B]/50" />
          <span>{[shg.village, shg.block, shg.district].filter(Boolean).join(', ')}</span>
        </div>
        {shg.formation_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 shrink-0 text-[#C2185B]/50" />
            <span>Formed {new Date(shg.formation_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={onViewDetails}
          className="text-xs font-semibold text-[#C2185B] hover:underline flex items-center gap-1"
        >
          View details <ChevronRight className="w-3 h-3" />
        </button>
        <span className="text-[10px] text-muted-foreground">{shg.state}</span>
      </div>
    </div>
  );
}

// ── SHG Detail Modal content ──────────────────────────────────
function SHGDetailModal({ details, onClose }: { details: SHGDetails; onClose: () => void }) {
  return (
    <>
      <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-6 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <XCircle className="w-5 h-5" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{details.shg.name}</DialogTitle>
          <DialogDescription className="text-white/75 mt-1">
            {[details.shg.village, details.shg.district, details.shg.state].filter(Boolean).join(' · ')}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
        {/* Financials */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Total savings</p>
            <p className="text-2xl font-bold text-gray-900">₹{details.financials.total_savings.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1"><Landmark className="w-3 h-3" /> Active loans ({details.financials.active_loans_count})</p>
            <p className="text-2xl font-bold text-gray-900">₹{details.financials.active_loans_total.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Members stat */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-center gap-3">
          <Users className="w-5 h-5 text-purple-500 shrink-0" />
          <div>
            <p className="text-xs text-purple-600 font-semibold">Total registered members</p>
            <p className="text-xl font-bold text-gray-900">{details.total_members}</p>
          </div>
        </div>

        {/* Office bearers */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Office bearers</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: 'President', color: 'bg-pink-100 text-[#C2185B]', data: details.office_bearers.president },
              { role: 'Secretary', color: 'bg-purple-100 text-[#6A1B9A]', data: details.office_bearers.secretary },
              { role: 'Treasurer', color: 'bg-blue-100 text-[#0288D1]', data: details.office_bearers.treasurer },
            ].map(({ role, color, data }) => (
              <div key={role} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color} mb-2 inline-block uppercase tracking-wide`}>{role}</span>
                {data ? (
                  <>
                    <p className="font-medium text-gray-900 text-sm mt-1 truncate">{data.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{data.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 italic">Not assigned</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bank details */}
        {details.shg.bank_name && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bank details</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <p className="font-medium">{details.shg.bank_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="font-medium font-mono">{details.shg.bank_account ? `****${details.shg.bank_account.slice(-4)}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IFSC</p>
                <p className="font-medium font-mono">{details.shg.ifsc || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Schemes list (fetches from adminApi) ──────────────────────
function SchemesList() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSchemes()
      .then((res) => setSchemes((res.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-muted-foreground py-2">Loading...</div>;

  if (schemes.length === 0) return (
    <div className="text-center py-6 text-muted-foreground">
      <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
      <p className="text-sm">No schemes posted yet</p>
      <a href="/admin/schemes" className="text-xs text-[#C2185B] hover:underline mt-1 inline-block">Post your first scheme →</a>
    </div>
  );

  return (
    <div className="space-y-3">
      {schemes.map((s) => (
        <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100/60">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      ))}
      <a href="/admin/schemes" className="block text-xs text-center text-[#C2185B] hover:underline pt-1">
        View all schemes →
      </a>
    </div>
  );
}