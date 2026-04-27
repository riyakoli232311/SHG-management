// src/pages/MemberProfile.tsx — Dark Theme (matches app-wide aesthetic)
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, PiggyBank, Landmark, User, Phone, MapPin, Calendar,
  IndianRupee, Pencil, CheckCircle2, AlertCircle, Clock,
  Building2, Home, Shield, TrendingUp, BadgeCheck,
} from "lucide-react";
import { membersApi, savingsApi, loansApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────
const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ROLES = ["member","president","secretary","treasurer"] as const;
const CASTE_CATEGORIES = ["general","obc","sc","st"] as const;
const ROLE_LABELS: Record<string,string> = {
  member:"Member", president:"President", secretary:"Secretary", treasurer:"Treasurer",
};

// Role badge styles — all dark-theme
const ROLE_BADGE: Record<string,{ bg:string; color:string }> = {
  president: { bg:"rgba(251,191,36,0.13)",  color:"#fcd34d" },
  secretary: { bg:"rgba(96,216,255,0.12)",  color:"#60d8ff" },
  treasurer: { bg:"rgba(167,139,250,0.15)", color:"#c4b5fd" },
  member:    { bg:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.55)" },
};

type Tab = "overview" | "savings" | "loans";

const EMPTY_EDIT = {
  name:"", phone:"", age:"", income:"", aadhar:"",
  husband_name:"", occupation:"",
  village:"", gram_panchayat:"", block:"", district:"", state:"", pin_code:"",
  role:"member" as typeof ROLES[number],
  joined_date:"", status:"active" as "active"|"inactive",
  bank_account:"", bank_ifsc:"",
  caste_category:"" as typeof CASTE_CATEGORIES[number]|"",
  bpl_status:false,
};
type EditForm = typeof EMPTY_EDIT;

// ── Shared dark primitives ────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
};

const INPUT_BASE =
  "w-full rounded-xl px-3 py-2.5 text-sm text-white font-medium placeholder:text-white/20 outline-none transition-all";
const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function DInput({ value, onChange, placeholder, type="text", maxLength, min, max, required }: any) {
  return (
    <input
      value={value} onChange={onChange} placeholder={placeholder}
      type={type} maxLength={maxLength} min={min} max={max} required={required}
      className={INPUT_BASE} style={INPUT_STYLE}
      onFocus={e=>(e.currentTarget.style.borderColor="rgba(194,24,91,0.5)")}
      onBlur={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.08)")}
    />
  );
}

function DLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{children}</p>;
}

function DField({ label, children }: { label:string; children:React.ReactNode }) {
  return <div className="space-y-1"><DLabel>{label}</DLabel>{children}</div>;
}

// Section heading inside forms
function FSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-3">{children}</p>
  );
}

// Dark row inside info cards
function InfoRow({ label, value, mono=false }: { label:string; value:string; mono?:boolean }) {
  return (
    <div
      className="flex justify-between items-center py-2.5 text-sm"
      style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-white/35 w-36 shrink-0">{label}</span>
      <span className={`text-white/85 font-medium text-right ${mono?"font-mono":""}`}>{value}</span>
    </div>
  );
}

// Dark stat card
function StatCard({
  icon: Icon, color, label, value, sub,
}: { icon:any; color:string; label:string; value:string|number; sub:string }) {
  return (
    <div style={CARD_STYLE} className="p-5">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor:`${color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-black text-white leading-tight">{value}</p>
          <p className="text-xs text-white/30 mt-0.5">{sub}</p>
        </div>
      </div>
    </div>
  );
}

// Dark section card with header
function SectionCard({
  icon: Icon, iconColor, title, children,
}: { icon:any; iconColor:string; title:string; children:React.ReactNode }) {
  return (
    <div style={CARD_STYLE} className="overflow-hidden">
      {/* top accent */}
      <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg,#C2185B,#6A1B9A)" }} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor:`${iconColor}18` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color:iconColor }} />
          </div>
          <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Edit form ─────────────────────────────────────────────────
function EditMemberForm({
  form, setForm,
}: { form:EditForm; setForm:React.Dispatch<React.SetStateAction<EditForm>> }) {
  const f = (key: keyof EditForm) => (e: any) => setForm(p=>({...p,[key]:e.target.value}));
  return (
    <div className="space-y-5">
      <div>
        <FSectionLabel>Personal Details</FSectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">
            <DField label="Full Name *">
              <DInput value={form.name} onChange={f("name")} placeholder="e.g. Sunita Devi" required />
            </DField>
          </div>
          <DField label="Husband's Name">
            <DInput value={form.husband_name} onChange={f("husband_name")} placeholder="W/O" />
          </DField>
          <DField label="Phone">
            <DInput value={form.phone} onChange={f("phone")} placeholder="10-digit" maxLength={10} />
          </DField>
          <DField label="Age">
            <DInput value={form.age} onChange={f("age")} type="number" placeholder="Age" min={18} max={80} />
          </DField>
          <DField label="Aadhaar">
            <DInput value={form.aadhar} onChange={f("aadhar")} placeholder="12-digit" maxLength={12} />
          </DField>
          <DField label="Occupation">
            <DInput value={form.occupation} onChange={f("occupation")} placeholder="e.g. Dairy" />
          </DField>
          <DField label="Monthly Income (₹)">
            <DInput value={form.income} onChange={f("income")} type="number" placeholder="e.g. 5000" />
          </DField>
        </div>
      </div>

      <div>
        <FSectionLabel>Address</FSectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <DField label="Village"><DInput value={form.village} onChange={f("village")} /></DField>
          <DField label="Gram Panchayat"><DInput value={form.gram_panchayat} onChange={f("gram_panchayat")} /></DField>
          <DField label="Block / Tehsil"><DInput value={form.block} onChange={f("block")} /></DField>
          <DField label="District"><DInput value={form.district} onChange={f("district")} /></DField>
          <DField label="State"><DInput value={form.state} onChange={f("state")} /></DField>
          <DField label="PIN Code"><DInput value={form.pin_code} onChange={f("pin_code")} maxLength={6} /></DField>
        </div>
      </div>

      <div>
        <FSectionLabel>Group &amp; Bank</FSectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <DField label="Role in Group">
            <Select value={form.role} onValueChange={v=>setForm(p=>({...p,role:v as any}))}>
              <SelectTrigger
                className="text-sm rounded-xl h-10 text-white font-medium outline-none"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background:"#120828", border:"1px solid rgba(255,255,255,0.10)", borderRadius:"12px", color:"#fff" }}>
                {ROLES.map(r=><SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </DField>
          <DField label="Joining Date">
            <DInput value={form.joined_date} onChange={f("joined_date")} type="date" />
          </DField>
          <DField label="Bank Account No.">
            <DInput value={form.bank_account} onChange={f("bank_account")} placeholder="PMJDY account" />
          </DField>
          <DField label="Bank IFSC">
            <DInput value={form.bank_ifsc} onChange={f("bank_ifsc")} />
          </DField>
          <DField label="Caste Category">
            <Select value={form.caste_category} onValueChange={v=>setForm(p=>({...p,caste_category:v as any}))}>
              <SelectTrigger
                className="text-sm rounded-xl h-10 text-white font-medium outline-none"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent style={{ background:"#120828", border:"1px solid rgba(255,255,255,0.10)", borderRadius:"12px", color:"#fff" }}>
                {CASTE_CATEGORIES.map(c=><SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </DField>
          <DField label="BPL Status">
            <div className="flex gap-2 mt-1">
              {[true,false].map(val=>(
                <button key={String(val)} type="button" onClick={()=>setForm(p=>({...p,bpl_status:val}))}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: form.bpl_status===val ? (val?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.07)") : "rgba(255,255,255,0.03)",
                    color: form.bpl_status===val ? (val?"#fbbf24":"#fff") : "rgba(255,255,255,0.3)",
                    border: `1px solid ${form.bpl_status===val ? (val?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.15)") : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {val?"BPL":"Non-BPL"}
                </button>
              ))}
            </div>
          </DField>
          <div className="col-span-2">
            <DLabel>Member Status</DLabel>
            <div className="flex gap-2 mt-1">
              {(["active","inactive"] as const).map(s=>(
                <button key={s} type="button" onClick={()=>setForm(p=>({...p,status:s}))}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize"
                  style={{
                    background: form.status===s ? (s==="active"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.12)") : "rgba(255,255,255,0.03)",
                    color: form.status===s ? (s==="active"?"#34d399":"#f87171") : "rgba(255,255,255,0.3)",
                    border: `1px solid ${form.status===s ? (s==="active"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.2)") : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MemberProfile() {
  const { memberId } = useParams<{ memberId:string }>();
  const [member, setMember]                 = useState<any>(null);
  const [savings, setSavings]               = useState<any[]>([]);
  const [loans, setLoans]                   = useState<any[]>([]);
  const [loanRepayments, setLoanRepayments] = useState<Record<string,any[]>>({});
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState<Tab>("overview");
  const [showEdit, setShowEdit]             = useState(false);
  const [editForm, setEditForm]             = useState<EditForm>({...EMPTY_EDIT});
  const [editSaving, setEditSaving]         = useState(false);

  useEffect(()=>{ if(memberId) loadAll(memberId); },[memberId]);

  async function loadAll(id:string) {
    setLoading(true);
    try {
      const [mRes,sRes,lRes] = await Promise.all([
        membersApi.get(id), savingsApi.list({member_id:id}), loansApi.list({member_id:id}),
      ]);
      setMember(mRes.data);
      setSavings(sRes.data||[]);
      const ml=lRes.data||[];
      setLoans(ml);
      const repMap:Record<string,any[]>={};
      await Promise.all(ml.map(async(loan:any)=>{
        try { const r=await repaymentsApi.list({loan_id:loan.id}); repMap[loan.id]=r.data||[]; }
        catch { repMap[loan.id]=[]; }
      }));
      setLoanRepayments(repMap);
    } catch(err:any){ toast.error(err.message||"Failed to load member"); }
    finally { setLoading(false); }
  }

  function openEdit() {
    if(!member) return;
    setEditForm({
      name:member.name||"", phone:member.phone||"",
      age:member.age?String(member.age):"",
      income:member.income?String(member.income):"",
      aadhar:member.aadhar||"", husband_name:member.husband_name||"",
      occupation:member.occupation||"", village:member.village||"",
      gram_panchayat:member.gram_panchayat||"", block:member.block||"",
      district:member.district||"", state:member.state||"",
      pin_code:member.pin_code||"", role:member.role||"member",
      joined_date:member.joined_date?member.joined_date.split("T")[0]:"",
      status:member.status||"active", bank_account:member.bank_account||"",
      bank_ifsc:member.bank_ifsc||"", caste_category:member.caste_category||"",
      bpl_status:member.bpl_status||false,
    });
    setShowEdit(true);
  }

  async function handleEdit(e:React.FormEvent) {
    e.preventDefault();
    if(!member) return;
    setEditSaving(true);
    try {
      await membersApi.update(member.id,{
        ...editForm,
        age:editForm.age?Number(editForm.age):null,
        income:editForm.income?Number(editForm.income):null,
      });
      toast.success("Profile updated!");
      setShowEdit(false);
      loadAll(member.id);
    } catch(err:any){ toast.error(err.message||"Failed to update"); }
    finally { setEditSaving(false); }
  }

  const totalSavings     = savings.reduce((s,r)=>s+Number(r.amount),0);
  const activeLoans      = loans.filter(l=>l.status==="active");
  const totalOutstanding = activeLoans.reduce((s,l)=>s+Number(l.loan_amount),0);
  const loanEligibility  = totalSavings*5;

  function getRepStats(loanId:string) {
    const reps=loanRepayments[loanId]||[];
    const paid=reps.filter(r=>r.status==="paid").length;
    const total=reps.length;
    const overdue=reps.filter(r=>r.status==="overdue").length;
    return { paid, total, overdue, pct:total?Math.round((paid/total)*100):0 };
  }

  // ── Loading ───────────────────────────────────────────────────
  if(loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin"/>
      </div>
    </DashboardLayout>
  );

  if(!member) return (
    <DashboardLayout>
      <div className="text-center py-24">
        <User className="w-12 h-12 mx-auto text-white/20 mb-4"/>
        <p className="text-white/40 font-medium">Member not found</p>
        <Link to="/members"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white/70 transition-all"
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}
        >
          <ArrowLeft className="w-4 h-4"/> Back to Members
        </Link>
      </div>
    </DashboardLayout>
  );

  const roleBadge = ROLE_BADGE[member.role] ?? ROLE_BADGE.member;

  return (
    <DashboardLayout>

      {/* Back link */}
      <Link to="/members"
        className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4"/> Back to Members
      </Link>

      {/* ── Hero Header ────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
        {/* gradient banner */}
        <div className="h-24" style={{ background:"linear-gradient(135deg,#C2185B,#6A1B9A)" }}/>

        {/* dark body */}
        <div style={{ background:"#0a041a" }} className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center shrink-0"
              style={{
                background:"linear-gradient(135deg,#C2185B,#6A1B9A)",
                borderColor:"#0a041a",
              }}
            >
              <span className="text-white text-3xl font-bold">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{member.name}</h1>
                {/* Role badge */}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ background:roleBadge.bg, color:roleBadge.color }}
                >
                  {ROLE_LABELS[member.role]||"Member"}
                </span>
                {/* Status badge */}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    background: member.status==="active" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)",
                    color: member.status==="active" ? "#6ee7b7" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {member.status==="active" ? "● Active" : "○ Inactive"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-white/35">
                {member.husband_name && <span>W/O {member.husband_name}</span>}
                {member.village && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5"/>
                    {[member.village,member.block,member.district].filter(Boolean).join(", ")}
                  </span>
                )}
                {member.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/>{member.phone}</span>
                )}
                {member.joined_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5"/>
                    Joined {new Date(member.joined_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {member.occupation && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ background:"rgba(194,24,91,0.12)", color:"#f48fb1" }}>
                    {member.occupation}
                  </span>
                )}
                {member.caste_category && (
                  <span className="text-xs uppercase px-2.5 py-0.5 rounded-full"
                    style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.45)" }}>
                    {member.caste_category}
                  </span>
                )}
                {member.bpl_status && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ background:"rgba(245,158,11,0.13)", color:"#fcd34d" }}>
                    BPL
                  </span>
                )}
                {member.age && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.45)" }}>
                    Age {member.age}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
              style={{
                background:"rgba(194,24,91,0.12)",
                color:"#f48fb1",
                border:"1px solid rgba(194,24,91,0.25)",
              }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(194,24,91,0.2)")}
              onMouseLeave={e=>(e.currentTarget.style.background="rgba(194,24,91,0.12)")}
            >
              <Pencil className="w-4 h-4"/> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={PiggyBank}  color="#C2185B" label="Total Savings"    value={`₹${totalSavings.toLocaleString("en-IN")}`}   sub={`${savings.length} contributions`} />
        <StatCard icon={TrendingUp} color="#6A1B9A" label="Loan Eligibility" value={`₹${loanEligibility.toLocaleString("en-IN")}`} sub="5× total savings" />
        <StatCard icon={Landmark}   color="#0288D1" label="Active Loans"     value={activeLoans.length}                            sub={activeLoans.length?`₹${totalOutstanding.toLocaleString("en-IN")} outstanding`:"No active loans"} />
        <StatCard icon={BadgeCheck} color="#10B981" label="Loans Taken"      value={loans.length}                                  sub={`${loans.filter(l=>l.status==="closed").length} fully repaid`} />
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div
        className="flex gap-1 rounded-xl p-1 mb-6 w-fit"
        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}
      >
        {(["overview","savings","loans"] as Tab[]).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all"
            style={{
              background: activeTab===tab ? "linear-gradient(135deg,#C2185B,#6A1B9A)" : "transparent",
              color: activeTab===tab ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────── */}
      {activeTab==="overview" && (
        <div className="grid lg:grid-cols-2 gap-5">

          <SectionCard icon={User} iconColor="#C2185B" title="Personal Information">
            {[
              { label:"Full Name",      value:member.name },
              { label:"W/O (Husband)",  value:member.husband_name||"—" },
              { label:"Age",            value:member.age?`${member.age} years`:"—" },
              { label:"Aadhaar",        value:member.aadhar?`XXXX XXXX ${member.aadhar.slice(-4)}`:"—" },
              { label:"Occupation",     value:member.occupation||"—" },
              { label:"Monthly Income", value:member.income?`₹${Number(member.income).toLocaleString("en-IN")}`:"—" },
              { label:"Caste Category", value:member.caste_category?member.caste_category.toUpperCase():"—" },
              { label:"BPL Status",     value:member.bpl_status?"Yes (BPL)":"No" },
            ].map(r=><InfoRow key={r.label} label={r.label} value={r.value}/>)}
          </SectionCard>

          <SectionCard icon={Home} iconColor="#6A1B9A" title="Address Details">
            {[
              { label:"Village",         value:member.village||"—" },
              { label:"Gram Panchayat",  value:member.gram_panchayat||"—" },
              { label:"Block / Tehsil",  value:member.block||"—" },
              { label:"District",        value:member.district||"—" },
              { label:"State",           value:member.state||"—" },
              { label:"PIN Code",        value:member.pin_code||"—" },
            ].map(r=><InfoRow key={r.label} label={r.label} value={r.value}/>)}
            {(member.village||member.block||member.district) && (
              <div className="mt-3 p-3 rounded-xl text-sm text-white/40 leading-relaxed"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#C2185B]"/>
                {[member.village,member.gram_panchayat,member.block,member.district,member.state,member.pin_code].filter(Boolean).join(", ")}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Shield} iconColor="#10B981" title="Group Details">
            {[
              { label:"Role",    value:ROLE_LABELS[member.role]||"Member" },
              { label:"Status",  value:member.status==="active"?"Active":"Inactive" },
              { label:"Joined",  value:member.joined_date?new Date(member.joined_date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"—" },
              { label:"Tenure",  value:member.joined_date?(()=>{
                  const months=Math.floor((Date.now()-new Date(member.joined_date).getTime())/(1000*60*60*24*30));
                  return months>=12?`${Math.floor(months/12)} yr ${months%12} mo`:`${months} months`;
                })():"—" },
            ].map(r=><InfoRow key={r.label} label={r.label} value={r.value}/>)}
          </SectionCard>

          <SectionCard icon={Building2} iconColor="#0288D1" title="Bank Details (PMJDY)">
            <InfoRow label="Account No." value={member.bank_account?`XXXX XXXX ${member.bank_account.slice(-4)}`:"—"} mono />
            <InfoRow label="IFSC Code"   value={member.bank_ifsc||"—"} mono />
            {/* Eligibility highlight */}
            <div className="mt-4 rounded-xl p-4"
              style={{ background:"linear-gradient(135deg,rgba(194,24,91,0.08),rgba(106,27,154,0.08))", border:"1px solid rgba(194,24,91,0.15)" }}>
              <p className="text-xs text-white/35 mb-0.5">Maximum Loan Eligibility</p>
              <p className="text-2xl font-black text-[#f48fb1]">₹{loanEligibility.toLocaleString("en-IN")}</p>
              <p className="text-xs text-white/30 mt-1">
                Based on ₹{totalSavings.toLocaleString("en-IN")} savings × 5
                {activeLoans.length>0 && ` · ₹${totalOutstanding.toLocaleString("en-IN")} currently borrowed`}
              </p>
            </div>
          </SectionCard>

        </div>
      )}

      {/* ── SAVINGS ────────────────────────────────────────── */}
      {activeTab==="savings" && (
        <div style={CARD_STYLE} className="overflow-hidden">
          <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg,#C2185B,#6A1B9A)" }}/>
          <div className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#C2185B]"/>
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">Savings History</h3>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/35">{savings.length} entries</span>
                <span className="font-bold text-[#f48fb1]">Total: ₹{totalSavings.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {savings.length===0 ? (
              <div className="text-center py-16 text-white/20">
                <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p>No savings recorded yet</p>
              </div>
            ) : (
              <>
                {/* Mini bar chart */}
                <div className="mb-5 p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs text-white/30 mb-3">Monthly Contributions (last 12)</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {savings.slice(-12).map((s:any,i:number)=>{
                      const max=Math.max(...savings.slice(-12).map((x:any)=>Number(x.amount)));
                      const pct=max?(Number(s.amount)/max)*100:0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full rounded-t" style={{ height:`${Math.max(pct,6)}%`, background:"linear-gradient(to top,#C2185B,#6A1B9A)" }}/>
                          <span className="text-[9px] text-white/25">{MONTH_NAMES[s.month]}</span>
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none"
                            style={{ background:"#1a0733", color:"#f48fb1", border:"1px solid rgba(194,24,91,0.3)" }}>
                            ₹{Number(s.amount).toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl" style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                        {["Month","Amount","Mode","Date"].map(h=>(
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {savings.map((s:any)=>(
                        <tr key={s.id} className="border-b transition-colors"
                          style={{ borderColor:"rgba(255,255,255,0.05)" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                        >
                          <td className="px-4 py-3 font-medium text-white/80">{MONTH_NAMES[s.month]} {s.year}</td>
                          <td className="px-4 py-3 font-bold text-[#6ee7b7]">₹{Number(s.amount).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                              style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)" }}>
                              {s.payment_mode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/35">
                            {s.date?new Date(s.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Running total */}
                <div className="mt-4 p-3 rounded-xl flex justify-between items-center"
                  style={{ background:"rgba(194,24,91,0.07)", border:"1px solid rgba(194,24,91,0.15)" }}>
                  <span className="text-sm text-white/40">Running Total</span>
                  <span className="text-lg font-black text-[#f48fb1]">₹{totalSavings.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── LOANS ──────────────────────────────────────────── */}
      {activeTab==="loans" && (
        <div className="space-y-4">
          {loans.length===0 ? (
            <div style={CARD_STYLE} className="py-16 text-center text-white/20">
              <Landmark className="w-10 h-10 mx-auto mb-2 opacity-30"/>
              <p>No loans taken yet</p>
            </div>
          ) : loans.map(loan=>{
            const { paid, total, overdue, pct } = getRepStats(loan.id);
            const reps = loanRepayments[loan.id]||[];
            const loanStatusStyle = loan.status==="active"
              ? { bg:"rgba(96,216,255,0.12)", color:"#60d8ff" }
              : loan.status==="closed"
              ? { bg:"rgba(16,185,129,0.15)", color:"#6ee7b7" }
              : { bg:"rgba(239,68,68,0.12)", color:"#fca5a5" };

            return (
              <div key={loan.id} style={CARD_STYLE} className="overflow-hidden">
                <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg,#C2185B,#6A1B9A)" }}/>
                <div className="p-5">
                  {/* Loan header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-white text-base">{loan.purpose||"General Purpose"}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-white/35">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3"/>₹{Number(loan.loan_amount).toLocaleString("en-IN")}
                        </span>
                        <span>{loan.interest_rate}% p.m.</span>
                        <span>{loan.tenure_months} months</span>
                        {loan.disbursed_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3"/>
                            {new Date(loan.disbursed_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                      style={{ background:loanStatusStyle.bg, color:loanStatusStyle.color }}>
                      {loan.status.charAt(0).toUpperCase()+loan.status.slice(1)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/35 mb-1.5">
                      <span>{paid} of {total} EMIs paid</span>
                      <span className="font-bold text-white/50">{pct}% repaid</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:`${pct}%`,
                          background: loan.status==="closed"
                            ? "linear-gradient(90deg,#10B981,#059669)"
                            : "linear-gradient(90deg,#C2185B,#6A1B9A)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Overdue alert */}
                  {overdue>0 && (
                    <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 mb-4"
                      style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5" }}>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
                      {overdue} overdue EMI{overdue>1?"s":""} — immediate attention required
                    </div>
                  )}

                  {/* EMI schedule */}
                  {reps.length>0 && (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }} className="pt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">EMI Schedule</p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {reps.map((r:any)=>(
                          <div key={r.id}
                            className="flex items-center justify-between py-2 px-3 rounded-xl text-sm"
                            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}
                          >
                            <div className="flex items-center gap-2">
                              {r.status==="paid"    && <CheckCircle2 className="w-4 h-4 text-[#6ee7b7] shrink-0"/>}
                              {r.status==="overdue" && <AlertCircle  className="w-4 h-4 text-red-400 shrink-0"/>}
                              {r.status==="pending" && <Clock        className="w-4 h-4 text-amber-400 shrink-0"/>}
                              <span className="text-white/35">
                                Due {new Date(r.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white/80">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                              {r.paid_date && (
                                <span className="text-xs text-[#6ee7b7]">
                                  Paid {new Date(r.paid_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={showEdit} onOpenChange={o=>!o&&setShowEdit(false)}>
        <DialogContent
          className="max-w-xl max-h-[90vh] overflow-y-auto"
          style={{ background:"#0a041a", border:"1px solid rgba(255,255,255,0.08)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]"/> Edit Profile — {member.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <EditMemberForm form={editForm} setForm={setEditForm}/>
            <div className="flex gap-3 justify-end pt-5 mt-2"
              style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <button type="button" onClick={()=>setShowEdit(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button type="submit" disabled={editSaving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background:"linear-gradient(135deg,#C2185B,#6A1B9A)" }}>
                {editSaving?"Saving…":"Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}