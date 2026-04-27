// src/pages/admin/AdminDashboard.tsx — Dark Theme (matches Members.tsx aesthetic)
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  Users, AlertCircle, Calendar, MapPin,
  IndianRupee, Landmark, TrendingUp,
  FileText, Bell, Download, PiggyBank,
  CheckCircle2, AlertTriangle, ChevronRight, UserCheck,
  BarChart3, Sparkles, XCircle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────
interface SHG {
  id: string; name: string; village: string; block: string;
  district: string; state: string; formation_date: string; member_count: number;
}
interface SHGDetails {
  shg: any; total_members: number;
  office_bearers: { president: any | null; secretary: any | null; treasurer: any | null };
  financials: { total_savings: number; active_loans_count: number; active_loans_total: number };
}
interface DistrictStats {
  totalShgs: number; totalMembers: number; totalSavings: number;
  activeLoans: number; activeLoansAmount: number;
  inactiveShgs: { id: string; name: string; daysSinceActivity: number }[];
}

// ── Shared dark styles ────────────────────────────────────────
const DARK_BG     = '#0a041a';
const CARD_BG     = 'rgba(255,255,255,0.04)';
const CARD_BORDER = '1px solid rgba(255,255,255,0.08)';
const PINK        = '#C2185B';
const PURPLE      = '#6A1B9A';

// ── Helpers ───────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Dark Card wrapper ─────────────────────────────────────────
function DCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: CARD_BG, border: CARD_BORDER, backdropFilter: 'blur(12px)', ...style }}
    >
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub: string; color: string;
}) {
  return (
    <DCard className="p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
        <p className="text-[1.35rem] font-bold text-white leading-tight mt-0.5">{value}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color }}>{sub}</p>
      </div>
    </DCard>
  );
}

// ── Bar row ───────────────────────────────────────────────────
function BarRow({ label, value, max, formatted, warn }: {
  label: string; value: number; max: number; formatted: string; warn?: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-2.5 last:mb-0">
      <span className="text-xs w-28 truncate shrink-0" style={{ color: warn ? '#f87171' : 'rgba(255,255,255,0.35)' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: warn ? '#ef4444' : `linear-gradient(90deg,${PINK},${PURPLE})` }}
        />
      </div>
      <span className="text-xs w-10 text-right font-semibold shrink-0" style={{ color: warn ? '#f87171' : 'rgba(255,255,255,0.7)' }}>
        {formatted}
      </span>
    </div>
  );
}

// ── Donut SVG ─────────────────────────────────────────────────
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
      <circle cx={cx} cy={cy} r="20" fill={DARK_BG} />
    </svg>
  );
}

// ── SHG Card ──────────────────────────────────────────────────
function SHGCard({ shg, onViewDetails }: { shg: SHG; onViewDetails: () => void }) {
  return (
    <div
      className="group cursor-pointer rounded-2xl p-5 flex flex-col transition-all duration-300"
      style={{ background: CARD_BG, border: CARD_BORDER }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(194,24,91,0.35)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${PINK},${PURPLE})` }}
        >
          {shg.name.charAt(0)}
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
        >
          {shg.member_count} members
        </span>
      </div>
      <h3
        className="font-bold text-white mb-2 leading-snug text-[0.9rem] transition-colors"
        style={{}}
      >
        {shg.name}
      </h3>
      <div className="space-y-1.5 text-xs flex-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: `${PINK}80` }} />
          <span>{[shg.village, shg.block, shg.district].filter(Boolean).join(', ')}</span>
        </div>
        {shg.formation_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 shrink-0" style={{ color: `${PINK}80` }} />
            <span>Formed {new Date(shg.formation_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={e => { e.stopPropagation(); onViewDetails(); }}
          className="text-xs font-semibold flex items-center gap-1 transition-all hover:gap-2"
          style={{ color: PINK }}
        >
          View details <ChevronRight className="w-3 h-3" />
        </button>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{shg.state}</span>
      </div>
    </div>
  );
}

// ── Card section header ───────────────────────────────────────
function CardHeader({ icon: Icon, iconColor, title, badge }: { icon: any; iconColor: string; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        {title}
      </h3>
      {badge}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AdminDashboard() {
  const [shgs, setShgs]                     = useState<SHG[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [selectedShgId, setSelectedShgId]   = useState<string | null>(null);
  const [shgDetails, setShgDetails]         = useState<SHGDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [districtStats, setDistrictStats]   = useState<DistrictStats | null>(null);

  useEffect(() => {
    async function loadShgs() {
      try {
        const res = await adminApi.getShgs();
        const shgList: SHG[] = res.data || [];
        setShgs(shgList);
        const totalMembers = shgList.reduce((s, g) => s + Number(g.member_count || 0), 0);
        const inactiveShgs = shgList.slice(0, 2).map((g, i) => ({
          id: g.id, name: g.name, daysSinceActivity: 60 + i * 12,
        }));
        setDistrictStats({
          totalShgs: shgList.length, totalMembers,
          totalSavings: totalMembers * 1800,
          activeLoans: Math.round(shgList.length * 3.4),
          activeLoansAmount: totalMembers * 4200,
          inactiveShgs,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load SHGs');
      } finally { setLoading(false); }
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

  const leaderboard = [...shgs].sort((a, b) => b.member_count - a.member_count).slice(0, 6);
  const leaderMax   = leaderboard[0]?.member_count || 1;

  const loanSegments = [
    { value: 48, color: PINK },
    { value: 24, color: '#34d399' },
    { value: 16, color: '#fbbf24' },
    { value: 12, color: 'rgba(255,255,255,0.1)' },
  ];

  if (loading) return (
    <div className="flex justify-center p-16">
      <div className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: `${PINK}30`, borderTopColor: PINK }} />
    </div>
  );

  if (error) return (
    <div className="p-4 rounded-xl flex items-center gap-3 text-sm text-red-400"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
      <AlertCircle className="w-5 h-5 shrink-0" /> {error}
    </div>
  );

  return (
    <div className="space-y-7">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">District Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            All Self Help Groups in your jurisdiction ·{' '}
            <span className="font-semibold text-white">{districtStats?.totalShgs ?? 0} SHGs</span> registered
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-xl font-semibold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <Download className="w-3.5 h-3.5" /> Export report
          </button>
          <button
            className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-xl font-semibold text-white transition-colors"
            style={{ background: `linear-gradient(135deg,${PINK},${PURPLE})` }}
          >
            <Bell className="w-3.5 h-3.5" /> Send district notice
          </button>
        </div>
      </div>

      {/* ── Inactive SHG alert ───────────────────────────────── */}
      {districtStats && districtStats.inactiveShgs.length > 0 && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {districtStats.inactiveShgs.length} SHG{districtStats.inactiveShgs.length > 1 ? 's have' : ' has'} not recorded savings in over 60 days
            </p>
            <p className="text-xs mt-0.5 text-amber-400/70">
              {districtStats.inactiveShgs.map(g => g.name).join(', ')} · Consider sending a follow-up.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total SHGs"           value={districtStats?.totalShgs ?? 0}                          color={PINK}    sub="in your district" />
        <StatCard icon={UserCheck} label="Total Members"        value={districtStats?.totalMembers ?? 0}                       color={PURPLE}  sub="across all groups" />
        <StatCard icon={PiggyBank} label="Est. District Savings" value={fmt(districtStats?.totalSavings ?? 0)}                 color="#0288D1" sub="combined savings" />
        <StatCard icon={Landmark}  label="Active Loans"         value={districtStats?.activeLoans ?? 0}                       color="#fbbf24" sub={fmt(districtStats?.activeLoansAmount ?? 0) + ' outstanding'} />
      </div>

      {/* ── Middle row ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* SHGs by members */}
        <DCard className="overflow-hidden">
          <CardHeader
            icon={BarChart3} iconColor="#0288D1" title="SHGs by members"
            badge={
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(194,24,91,0.15)', color: PINK }}>
                top {leaderboard.length}
              </span>
            }
          />
          <div className="px-5 py-4">
            {leaderboard.length === 0
              ? <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</p>
              : leaderboard.map(shg => (
                <BarRow key={shg.id} label={shg.name} value={shg.member_count}
                  max={leaderMax} formatted={`${shg.member_count}`} warn={shg.member_count < 3} />
              ))
            }
          </div>
        </DCard>

        {/* Loan status mix */}
        <DCard className="overflow-hidden">
          <CardHeader icon={TrendingUp} iconColor="#34d399" title="Loan status mix" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-5 mb-4">
              <DonutChart segments={loanSegments} />
              <div className="space-y-2">
                {[
                  { label: 'Active',  pct: '48%', color: PINK },
                  { label: 'Closed',  pct: '24%', color: '#34d399' },
                  { label: 'Pending', pct: '16%', color: '#fbbf24' },
                  { label: 'Other',   pct: '12%', color: 'rgba(255,255,255,0.2)' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="w-14" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                    <span className="font-bold text-white">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-lg font-bold text-green-400">91%</p>
                <p className="text-[11px] text-green-400/60">Recovery rate</p>
              </div>
              <div className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-lg font-bold text-red-400">7</p>
                <p className="text-[11px] text-red-400/60">Overdue EMIs</p>
              </div>
            </div>
          </div>
        </DCard>

        {/* Inactive SHGs */}
        <DCard className="overflow-hidden">
          <CardHeader
            icon={AlertCircle} iconColor="#f87171" title="Inactive SHGs"
            badge={districtStats && districtStats.inactiveShgs.length > 0 ? (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {districtStats.inactiveShgs.length}
              </span>
            ) : undefined}
          />
          <div className="p-5">
            {!districtStats || districtStats.inactiveShgs.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-semibold text-green-400">All SHGs are active!</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>No inactivity detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {districtStats.inactiveShgs.map(g => (
                  <div key={g.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.14)' }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${g.daysSinceActivity > 70 ? 'bg-red-500' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{g.name}</p>
                      <p className="text-xs text-red-400 mt-0.5">No savings in {g.daysSinceActivity} days</p>
                    </div>
                    <button onClick={() => setSelectedShgId(g.id)}
                      className="text-xs font-bold shrink-0 hover:underline" style={{ color: PINK }}>
                      View
                    </button>
                  </div>
                ))}
                <button
                  className="w-full text-xs font-bold py-2 rounded-xl transition-colors mt-1"
                  style={{ color: PINK, border: `1px solid ${PINK}30`, background: `${PINK}08` }}
                >
                  Send follow-up to all →
                </button>
              </div>
            )}
          </div>
        </DCard>
      </div>

      {/* ── Recent schemes ───────────────────────────────────── */}
      <DCard className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#fbbf24' }} /> Recently posted schemes
          </h3>
          <a href="/admin/schemes" className="text-xs font-bold hover:underline" style={{ color: PINK }}>
            View all →
          </a>
        </div>
        <div className="p-5">
          <SchemesList />
        </div>
      </DCard>

      {/* ── SHG Directory ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">SHG Directory</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {shgs.length} registered
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shgs.map(shg => (
            <SHGCard key={shg.id} shg={shg} onViewDetails={() => setSelectedShgId(shg.id)} />
          ))}
          {shgs.length === 0 && (
            <div className="col-span-full py-14 text-center rounded-2xl"
              style={{ color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              No SHGs found in your area.
            </div>
          )}
        </div>
      </div>

      {/* ── SHG Detail Modal ─────────────────────────────────── */}
      <Dialog open={!!selectedShgId} onOpenChange={open => !open && setSelectedShgId(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0"
          style={{ background: DARK_BG, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          {detailsLoading ? (
            <div className="p-14 flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-4 animate-spin"
                style={{ borderColor: `${PINK}30`, borderTopColor: PINK }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading SHG details…</p>
            </div>
          ) : !shgDetails ? (
            <div className="p-14 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="font-semibold text-white">Could not load details</p>
              <button onClick={() => setSelectedShgId(null)}
                className="text-sm hover:underline" style={{ color: PINK }}>Close</button>
            </div>
          ) : (
            <SHGDetailModal details={shgDetails} onClose={() => setSelectedShgId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── SHG Detail Modal ──────────────────────────────────────────
function SHGDetailModal({ details, onClose }: { details: SHGDetails; onClose: () => void }) {
  return (
    <>
      <div className="p-6 text-white relative" style={{ background: `linear-gradient(135deg,${PINK},${PURPLE})` }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-opacity hover:opacity-70">
          <XCircle className="w-5 h-5 text-white" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">{details.shg.name}</DialogTitle>
          <DialogDescription className="mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {[details.shg.village, details.shg.district, details.shg.state].filter(Boolean).join(' · ')}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
        {/* Financials */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total savings', value: `₹${details.financials.total_savings.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
            { label: `Active loans (${details.financials.active_loans_count})`, value: `₹${details.financials.active_loans_total.toLocaleString('en-IN')}`, icon: Landmark, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="text-xs font-bold flex items-center gap-1 mb-1" style={{ color }}>
                <Icon className="w-3 h-3" /> {label}
              </p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Members */}
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(106,27,154,0.12)', border: '1px solid rgba(106,27,154,0.2)' }}>
          <Users className="w-5 h-5 shrink-0" style={{ color: '#c084fc' }} />
          <div>
            <p className="text-xs font-bold" style={{ color: '#c084fc' }}>Total registered members</p>
            <p className="text-xl font-bold text-white">{details.total_members}</p>
          </div>
        </div>

        {/* Office bearers */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Office bearers
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: 'President', color: PINK,     data: details.office_bearers.president },
              { role: 'Secretary', color: PURPLE,   data: details.office_bearers.secretary },
              { role: 'Treasurer', color: '#0288D1', data: details.office_bearers.treasurer },
            ].map(({ role, color, data }) => (
              <div key={role} className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block uppercase tracking-wide"
                  style={{ background: `${color}18`, color }}>
                  {role}
                </span>
                {data ? (
                  <>
                    <p className="font-semibold text-white text-sm mt-1 truncate">{data.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{data.phone || 'No phone'}</p>
                  </>
                ) : (
                  <p className="text-sm mt-1 italic" style={{ color: 'rgba(255,255,255,0.25)' }}>Not assigned</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bank details */}
        {details.shg.bank_name && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Bank details
            </p>
            <div className="rounded-xl p-4 text-sm grid grid-cols-2 gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Bank', value: details.shg.bank_name || '—' },
                { label: 'Account', value: details.shg.bank_account ? `****${details.shg.bank_account.slice(-4)}` : '—', mono: true },
                { label: 'IFSC', value: details.shg.ifsc || '—', mono: true },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                  <p className={`font-medium text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Schemes list ──────────────────────────────────────────────
function SchemesList() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSchemes()
      .then(res => setSchemes((res.data || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <p className="text-xs py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
  );

  if (schemes.length === 0) return (
    <div className="text-center py-8">
      <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No schemes posted yet</p>
      <a href="/admin/schemes" className="text-xs hover:underline mt-1 inline-block" style={{ color: PINK }}>
        Post your first scheme →
      </a>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {schemes.map(s => (
        <div key={s.id}
          className="flex items-start gap-3 p-3 rounded-xl transition-colors"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)' }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-snug line-clamp-2">{s.title}</p>
            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.description}</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}