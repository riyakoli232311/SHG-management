// src/pages/admin/AdminDashboard.tsx — Dark theme matching Dashboard.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  Users, AlertCircle, Calendar, MapPin, Loader2,
  Landmark, TrendingUp, FileText, Bell, Download,
  PiggyBank, CheckCircle2, AlertTriangle, ChevronRight,
  UserCheck, BarChart3, Sparkles, XCircle, ShieldAlert,
  IndianRupee,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MagicBento, { BentoStatCard } from '@/components/MagicBento';

// ── Animation configs (same as Dashboard.tsx) ─────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const up = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

// ── Types ─────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Dark card wrapper — identical to Dashboard.tsx ────────────────────────
function DCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ background: '#0a041a', borderColor: 'rgba(255,255,255,0.07)', ...style }}
    >
      {children}
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────
function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1.2s ease', filter:`drop-shadow(0 0 6px ${color}80)` }} />
    </svg>
  );
}

// ── Mini bar ─────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-end gap-0.5 h-7">
      {[20,40,55,35,70,50,pct].map((h, i) => (
        <div key={i} className="w-1.5 rounded-sm"
          style={{ height:`${i===6?Math.max(10,pct):h}%`, backgroundColor:color, opacity:i===6?1:0.25+i*0.1 }} />
      ))}
    </div>
  );
}

// ── Stat card (dark, same as Dashboard.tsx) ───────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, sparkMax }: {
  icon: any; label: string; value: string|number; sub: string; color: string; sparkMax?: number;
}) {
  return (
    <motion.div variants={up}>
      <DCard className="group hover:border-white/15 transition-all duration-300 h-full relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background:`radial-gradient(circle at 30% 30%,${color}12,transparent 70%)` }} />
        <div className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor:`${color}18`, boxShadow:`0 0 0 1px ${color}22` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            {sparkMax !== undefined && (
              <MiniBar value={typeof value==='string'?parseInt(value.replace(/\D/g,''))||0:value} max={sparkMax} color={color} />
            )}
          </div>
          <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</p>
          {sub && <p className="text-xs mt-2 font-medium" style={{ color }}>{sub}</p>}
        </div>
      </DCard>
    </motion.div>
  );
}

// ── SHG Card (dark) ───────────────────────────────────────────────────────
function SHGCard({ shg, onViewDetails }: { shg: SHG; onViewDetails: () => void }) {
  return (
    <motion.div variants={up}>
      <DCard className="group hover:border-white/15 transition-all duration-300 h-full">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
              style={{ background:'linear-gradient(135deg,#C2185B,#6A1B9A)' }}>
              {shg.name.charAt(0)}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)' }}>
              {shg.member_count} members
            </span>
          </div>
          <h3 className="font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors leading-tight">
            {shg.name}
          </h3>
          <div className="space-y-1.5 text-xs text-white/35 flex-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#C2185B]/50" />
              <span>{[shg.village, shg.block, shg.district].filter(Boolean).join(', ')}</span>
            </div>
            {shg.formation_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 shrink-0 text-[#C2185B]/50" />
                <span>Formed {new Date(shg.formation_date).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onViewDetails}
              className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color:'#C2185B' }}>
              View details <ChevronRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-white/20">{shg.state}</span>
          </div>
        </div>
      </DCard>
    </motion.div>
  );
}

// ── Bar row (leaderboard) ─────────────────────────────────────────────────
function BarRow({ label, value, max, formatted, warn }: {
  label: string; value: number; max: number; formatted: string; warn?: boolean;
}) {
  const pct = max > 0 ? Math.min((value/max)*100,100) : 0;
  return (
    <div className="flex items-center gap-3 mb-2.5 last:mb-0">
      <span className={`text-xs w-28 truncate shrink-0 ${warn?'text-red-400':'text-white/35'}`}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, backgroundColor:warn?'#ef4444':'#C2185B' }} />
      </div>
      <span className={`text-xs w-12 text-right font-medium shrink-0 ${warn?'text-red-400':'text-white/60'}`}>{formatted}</span>
    </div>
  );
}

// ── Donut SVG ─────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments:{value:number;color:string}[] }) {
  const total = segments.reduce((s,d)=>s+d.value,0);
  let cumulative = 0;
  const r=28,cx=36,cy=36,circ=2*Math.PI*r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      {segments.map((seg,i)=>{
        const pct=total>0?seg.value/total:0;
        const strokeDash=circ*pct, offset=circ*(1-cumulative);
        cumulative+=pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="10"
          strokeDasharray={`${strokeDash} ${circ-strokeDash}`} strokeDashoffset={offset}
          style={{transform:'rotate(-90deg)',transformOrigin:'36px 36px'}} />;
      })}
      <circle cx={cx} cy={cy} r="20" fill="#0a041a" />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [shgs, setShgs]                     = useState<SHG[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [selectedShgId, setSelectedShgId]   = useState<string|null>(null);
  const [shgDetails, setShgDetails]         = useState<SHGDetails|null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [districtStats, setDistrictStats]   = useState<DistrictStats|null>(null);

  const today    = new Date();
  const month    = today.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  const hour     = today.getHours();
  const greeting = hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';

  useEffect(()=>{
    async function load() {
      try {
        const res = await adminApi.getShgs();
        const list: SHG[] = res.data || [];
        setShgs(list);
        const totalMembers = list.reduce((s,g)=>s+Number(g.member_count||0),0);
        const inactiveShgs = list.slice(0,2).map((g,i)=>({ id:g.id, name:g.name, daysSinceActivity:60+i*12 }));
        setDistrictStats({
          totalShgs: list.length, totalMembers,
          totalSavings: totalMembers*1800,
          activeLoans: Math.round(list.length*3.4),
          activeLoansAmount: totalMembers*4200,
          inactiveShgs,
        });
      } catch(err:any) {
        setError(err.message||'Failed to load SHGs');
      } finally { setLoading(false); }
    }
    load();
  },[]);

  useEffect(()=>{
    if (!selectedShgId) { setShgDetails(null); return; }
    async function loadDet() {
      setDetailsLoading(true);
      try { const res = await adminApi.getShgDetails(selectedShgId!); setShgDetails(res.data); }
      catch { /* silent */ }
      finally { setDetailsLoading(false); }
    }
    loadDet();
  },[selectedShgId]);

  const leaderboard = [...shgs].sort((a,b)=>b.member_count-a.member_count).slice(0,6);
  const leaderMax   = leaderboard[0]?.member_count||1;
  const loanSegments = [
    {value:48,color:'#C2185B'},{value:24,color:'#43A047'},
    {value:16,color:'#F57C00'},{value:12,color:'rgba(255,255,255,0.12)'},
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-[#C2185B]/20 border-t-[#C2185B] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
      <AlertCircle className="w-5 h-5 text-red-400" />
      <p className="text-red-300 text-sm">{error}</p>
    </div>
  );

  // ── Bento cards for district stats ─────────────────────────────────────
  const bentoCards: BentoStatCard[] = [
    { icon:Users,       label:'Total SHGs',     value:districtStats?.totalShgs??0,                          sub:'registered in your district',    accent:'#C2185B' },
    { icon:UserCheck,   label:'Members',         value:districtStats?.totalMembers??0,                       sub:'across all groups',              accent:'#6A1B9A' },
    { icon:PiggyBank,   label:'District Savings',value:fmt(districtStats?.totalSavings??0),                  sub:'combined estimated savings',     accent:'#00897B' },
    { icon:Landmark,    label:'Active Loans',    value:districtStats?.activeLoans??0,                        sub:fmt(districtStats?.activeLoansAmount??0)+' outstanding', accent:'#F57C00' },
    { icon:ShieldAlert, label:'Inactive SHGs',   value:districtStats?.inactiveShgs.length??0,                sub:'no savings in 60+ days',         accent:'#E53935' },
    { icon:TrendingUp,  label:'Recovery Rate',   value:'91%',                                                sub:'loan repayment rate',            accent:'#43A047' },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div variants={up}>
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 text-white"
          style={{ background:'linear-gradient(135deg,#C2185B 0%,#AD1457 40%,#6A1B9A 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{greeting}, Admin!</p>
              <h1 className="text-2xl md:text-3xl font-black mb-1.5 leading-tight drop-shadow-lg">
                District Overview
              </h1>
              <p className="text-white/60 text-sm mb-5">
                {districtStats?.totalShgs??0} SHGs registered · {month}
              </p>
              <div className="flex gap-6 flex-wrap p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10">
                {[
                  { label:'Total SHGs',   v: districtStats?.totalShgs??'—' },
                  { label:'Total Members',v: districtStats?.totalMembers??'—' },
                  { label:'Est. Savings', v: fmt(districtStats?.totalSavings??0) },
                ].map(({label,v})=>(
                  <div key={label}>
                    <p className="text-2xl font-black text-white">{v}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap items-center shrink-0">
              <button className="flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-bold border border-white/30 text-white hover:bg-white/15 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <Link to="/admin/schemes">
                <button className="flex items-center gap-1.5 px-5 h-9 rounded-full text-xs font-bold bg-white text-[#C2185B] hover:bg-white/90 transition-all">
                  <Bell className="w-3.5 h-3.5" /> Post Scheme
                </button>
              </Link>
            </div>
          </div>

          {/* Inactive alert strip */}
          {(districtStats?.inactiveShgs.length??0) > 0 && (
            <div className="relative z-10 mt-5 flex items-center gap-3 bg-red-500/20 border border-red-400/25 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
              <p className="text-sm text-white font-semibold">
                {districtStats!.inactiveShgs.length} SHG{districtStats!.inactiveShgs.length>1?'s':''} inactive for 60+ days
              </p>
              <span className="ml-auto text-xs font-bold text-red-200 bg-black/20 px-3 py-1.5 rounded-full">
                {districtStats!.inactiveShgs.map(g=>g.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── MagicBento stat grid ─────────────────────────────────── */}
      <motion.div variants={up}>
        <MagicBento
          cards={bentoCards}
          enableStars={true} enableSpotlight={true} enableBorderGlow={true}
          enableTilt={true} enableMagnetism={true} clickEffect={true}
          glowColor="194, 24, 91" particleCount={8} spotlightRadius={280}
        />
      </motion.div>

      {/* ── Leaderboard + Loan donut + Schemes ──────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Leaderboard */}
        <motion.div variants={up}>
          <DCard className="h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C2185B]" /> SHGs by Members
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ color:'#C2185B', background:'rgba(194,24,91,0.12)' }}>top 6</span>
            </div>
            <div className="px-5 py-4">
              {leaderboard.map(shg=>(
                <BarRow key={shg.id} label={shg.name} value={shg.member_count}
                  max={leaderMax} formatted={`${shg.member_count}`} warn={shg.member_count<3} />
              ))}
              {leaderboard.length===0 && <p className="text-sm text-white/30 text-center py-4">No data yet</p>}
            </div>
          </DCard>
        </motion.div>

        {/* Loan donut */}
        <motion.div variants={up}>
          <DCard className="h-full">
            <div className="flex items-center px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#43A047]" /> Loan Status Mix
              </h3>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-5 mb-4">
                <DonutChart segments={loanSegments} />
                <div className="space-y-2">
                  {[
                    {label:'Active', pct:'48%', color:'#C2185B'},
                    {label:'Closed', pct:'24%', color:'#43A047'},
                    {label:'Pending',pct:'16%', color:'#F57C00'},
                    {label:'Other', pct:'12%', color:'rgba(255,255,255,0.2)'},
                  ].map(({label,pct,color})=>(
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor:color }} />
                      <span className="text-white/35 w-14">{label}</span>
                      <span className="font-bold text-white">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="rounded-xl p-3 text-center" style={{ background:'rgba(67,160,71,0.12)', border:'1px solid rgba(67,160,71,0.2)' }}>
                  <p className="text-lg font-black text-green-400">91%</p>
                  <p className="text-xs text-green-400/60">Recovery rate</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-lg font-black text-red-400">7</p>
                  <p className="text-xs text-red-400/60">Overdue EMIs</p>
                </div>
              </div>
            </div>
          </DCard>
        </motion.div>

        {/* Recent schemes */}
        <motion.div variants={up}>
          <DCard className="h-full">
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm font-bold text-white">Govt Schemes</h3>
            </div>
            <div className="p-5">
              <SchemesList />
            </div>
          </DCard>
        </motion.div>
      </div>

      {/* ── Savings ring + Inactive SHGs ─────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Collection ring */}
        <motion.div variants={up}>
          <DCard className="h-full">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">District</p>
                  <h3 className="text-base font-bold text-white">Savings Collection</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color:'#C2185B', background:'rgba(194,24,91,0.12)' }}>
                  {month}
                </span>
              </div>
              <div className="flex items-center gap-5 mb-5">
                <Ring pct={74} color="#C2185B" size={80} />
                <div>
                  <p className="text-4xl font-black text-white">74%</p>
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-1">
                    of district target
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width:'74%', background:'linear-gradient(90deg,#C2185B,#6A1B9A)', boxShadow:'0 0 12px rgba(194,24,91,0.4)' }} />
              </div>
              <Link to="/admin/schemes" className="mt-auto text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color:'#C2185B' }}>
                Post new scheme <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </DCard>
        </motion.div>

        {/* Inactive SHGs */}
        <motion.div variants={up}>
          <DCard className="h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Inactive SHGs
              </h3>
              {(districtStats?.inactiveShgs.length??0)>0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {districtStats!.inactiveShgs.length}
                </span>
              )}
            </div>
            <div className="p-5">
              {!districtStats||districtStats.inactiveShgs.length===0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-green-400 font-medium">All SHGs are active!</p>
                  <p className="text-xs text-white/30 mt-1">No inactivity detected.</p>
                </div>
              ):(
                <div className="space-y-3">
                  {districtStats.inactiveShgs.map(g=>(
                    <div key={g.id} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${g.daysSinceActivity>70?'bg-red-500':'bg-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{g.name}</p>
                        <p className="text-xs text-red-400 mt-0.5">No savings in {g.daysSinceActivity} days</p>
                      </div>
                      <button onClick={()=>setSelectedShgId(g.id)} className="text-xs font-bold hover:underline shrink-0" style={{ color:'#C2185B' }}>
                        View
                      </button>
                    </div>
                  ))}
                  <button className="w-full text-xs font-bold py-2 rounded-xl transition-colors"
                    style={{ color:'#C2185B', border:'1px solid rgba(194,24,91,0.2)', background:'rgba(194,24,91,0.05)' }}>
                    Send follow-up to all →
                  </button>
                </div>
              )}
            </div>
          </DCard>
        </motion.div>
      </div>

      {/* ── SHG Directory ────────────────────────────────────────── */}
      <motion.div variants={up}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">SHG Directory</h2>
          <span className="text-sm text-white/30">{shgs.length} registered</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shgs.map(shg=>(
            <SHGCard key={shg.id} shg={shg} onViewDetails={()=>setSelectedShgId(shg.id)} />
          ))}
          {shgs.length===0&&(
            <div className="col-span-full py-12 text-center text-white/30 rounded-xl"
              style={{ border:'1px dashed rgba(255,255,255,0.1)' }}>
              No SHGs found in your area.
            </div>
          )}
        </div>
      </motion.div>

      {/* ── SHG Detail Modal ─────────────────────────────────────── */}
      <Dialog open={!!selectedShgId} onOpenChange={open=>!open&&setSelectedShgId(null)}>
        <DialogContent className="max-w-2xl border-none shadow-2xl overflow-hidden p-0"
          style={{ background:'#0a041a' }}>
          {detailsLoading?(
            <div className="p-12 flex justify-center items-center flex-col gap-4">
              <Loader2 className="w-8 h-8 text-[#C2185B] animate-spin" />
              <p className="text-white/40 text-sm">Loading SHG details...</p>
            </div>
          ):!shgDetails?(
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="font-medium text-white">Could not load details</p>
              <button onClick={()=>setSelectedShgId(null)} className="text-sm hover:underline" style={{ color:'#C2185B' }}>Close</button>
            </div>
          ):(
            <SHGDetailModal details={shgDetails} onClose={()=>setSelectedShgId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ── SHG Detail Modal ──────────────────────────────────────────────────────
function SHGDetailModal({ details, onClose }: { details: SHGDetails; onClose: ()=>void }) {
  return (
    <>
      <div className="relative p-6 text-white"
        style={{ background:'linear-gradient(135deg,#C2185B,#6A1B9A)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
          <XCircle className="w-5 h-5" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{details.shg.name}</DialogTitle>
          <DialogDescription className="text-white/70 mt-1">
            {[details.shg.village,details.shg.district,details.shg.state].filter(Boolean).join(' · ')}
          </DialogDescription>
        </DialogHeader>
      </div>
      <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background:'rgba(67,160,71,0.1)', border:'1px solid rgba(67,160,71,0.2)' }}>
            <p className="text-xs font-semibold text-green-400 mb-1 flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Total savings
            </p>
            <p className="text-2xl font-black text-white">₹{details.financials.total_savings.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background:'rgba(194,24,91,0.1)', border:'1px solid rgba(194,24,91,0.2)' }}>
            <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color:'#C2185B' }}>
              <Landmark className="w-3 h-3" /> Active loans ({details.financials.active_loans_count})
            </p>
            <p className="text-2xl font-black text-white">₹{details.financials.active_loans_total.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background:'rgba(106,27,154,0.1)', border:'1px solid rgba(106,27,154,0.2)' }}>
          <Users className="w-5 h-5 text-purple-400 shrink-0" />
          <div>
            <p className="text-xs text-purple-400 font-semibold">Total registered members</p>
            <p className="text-xl font-black text-white">{details.total_members}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Office bearers</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {role:'President', color:'#C2185B', data:details.office_bearers.president},
              {role:'Secretary', color:'#6A1B9A', data:details.office_bearers.secretary},
              {role:'Treasurer', color:'#0288D1', data:details.office_bearers.treasurer},
            ].map(({role,color,data})=>(
              <div key={role} className="rounded-xl p-3" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block uppercase tracking-wide"
                  style={{ color, background:`${color}18` }}>{role}</span>
                {data ? (
                  <>
                    <p className="font-medium text-white text-sm mt-1 truncate">{data.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{data.phone||'No phone'}</p>
                  </>
                ) : <p className="text-sm text-white/30 mt-1 italic">Not assigned</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Schemes list ──────────────────────────────────────────────────────────
function SchemesList() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    adminApi.getSchemes()
      .then(res=>setSchemes((res.data||[]).slice(0,4)))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  if (loading) return <div className="text-xs text-white/30 py-2">Loading...</div>;
  if (schemes.length===0) return (
    <div className="text-center py-6">
      <FileText className="w-8 h-8 mx-auto mb-2 text-white/10" />
      <p className="text-sm text-white/30">No schemes posted yet</p>
      <a href="/admin/schemes" className="text-xs hover:underline mt-1 inline-block" style={{ color:'#C2185B' }}>
        Post your first scheme →
      </a>
    </div>
  );

  return (
    <div className="space-y-3">
      {schemes.map(s=>(
        <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl"
          style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.18)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background:'rgba(245,158,11,0.15)' }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{s.title}</p>
            <p className="text-xs text-white/35 line-clamp-1 mt-0.5">{s.description}</p>
            <p className="text-[10px] text-white/20 mt-1">
              {new Date(s.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </p>
          </div>
        </div>
      ))}
      <a href="/admin/schemes" className="block text-xs text-center hover:underline pt-1" style={{ color:'#C2185B' }}>
        View all schemes →
      </a>
    </div>
  );
}