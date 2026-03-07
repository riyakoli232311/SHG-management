// src/pages/MemberProfile.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, PiggyBank, Landmark, User, Phone, MapPin, Calendar,
  IndianRupee, Pencil, CheckCircle2, AlertCircle, Clock,
  Building2, Home, Shield, TrendingUp, BadgeCheck,
} from "lucide-react";
import { membersApi, savingsApi, loansApi, repaymentsApi } from "@/lib/api";
import { toast } from "sonner";

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ROLES = ["member","president","secretary","treasurer"] as const;
const CASTE_CATEGORIES = ["general","obc","sc","st"] as const;
const ROLE_LABELS: Record<string,string> = { member:"Member", president:"President", secretary:"Secretary", treasurer:"Treasurer" };
const ROLE_COLORS: Record<string,string> = {
  president: "bg-amber-100 text-amber-700 border-amber-200",
  secretary:  "bg-blue-100 text-blue-700 border-blue-200",
  treasurer:  "bg-purple-100 text-purple-700 border-purple-200",
  member:     "bg-gray-100 text-gray-600 border-gray-200",
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

// EditMemberForm — outside main component to prevent focus loss
function EditMemberForm({ form, setForm }: { form: EditForm; setForm: React.Dispatch<React.SetStateAction<EditForm>> }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">Personal Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><Label>Full Name *</Label>
            <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
          <div className="space-y-1"><Label>Husband's Name</Label>
            <Input value={form.husband_name} onChange={e=>setForm(f=>({...f,husband_name:e.target.value}))} placeholder="W/O" /></div>
          <div className="space-y-1"><Label>Phone</Label>
            <Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} maxLength={10} /></div>
          <div className="space-y-1"><Label>Age</Label>
            <Input type="number" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} min={18} max={80} /></div>
          <div className="space-y-1"><Label>Aadhaar</Label>
            <Input value={form.aadhar} onChange={e=>setForm(f=>({...f,aadhar:e.target.value}))} maxLength={12} /></div>
          <div className="space-y-1"><Label>Occupation</Label>
            <Input value={form.occupation} onChange={e=>setForm(f=>({...f,occupation:e.target.value}))} placeholder="e.g. Dairy, Tailoring" /></div>
          <div className="space-y-1"><Label>Monthly Income (₹)</Label>
            <Input type="number" value={form.income} onChange={e=>setForm(f=>({...f,income:e.target.value}))} /></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">Address</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Village</Label>
            <Input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))} /></div>
          <div className="space-y-1"><Label>Gram Panchayat</Label>
            <Input value={form.gram_panchayat} onChange={e=>setForm(f=>({...f,gram_panchayat:e.target.value}))} /></div>
          <div className="space-y-1"><Label>Block / Tehsil</Label>
            <Input value={form.block} onChange={e=>setForm(f=>({...f,block:e.target.value}))} /></div>
          <div className="space-y-1"><Label>District</Label>
            <Input value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))} /></div>
          <div className="space-y-1"><Label>State</Label>
            <Input value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} /></div>
          <div className="space-y-1"><Label>PIN Code</Label>
            <Input value={form.pin_code} onChange={e=>setForm(f=>({...f,pin_code:e.target.value}))} maxLength={6} /></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wider mb-3">Group & Bank</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Role in Group</Label>
            <Select value={form.role} onValueChange={v=>setForm(f=>({...f,role:v as any}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map(r=><SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1"><Label>Joining Date</Label>
            <Input type="date" value={form.joined_date} onChange={e=>setForm(f=>({...f,joined_date:e.target.value}))} /></div>
          <div className="space-y-1"><Label>Bank Account No.</Label>
            <Input value={form.bank_account} onChange={e=>setForm(f=>({...f,bank_account:e.target.value}))} placeholder="PMJDY account" /></div>
          <div className="space-y-1"><Label>Bank IFSC</Label>
            <Input value={form.bank_ifsc} onChange={e=>setForm(f=>({...f,bank_ifsc:e.target.value}))} /></div>
          <div className="space-y-1"><Label>Caste Category</Label>
            <Select value={form.caste_category} onValueChange={v=>setForm(f=>({...f,caste_category:v as any}))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CASTE_CATEGORIES.map(c=><SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}</SelectContent>
            </Select></div>
          <div className="space-y-1"><Label>BPL Status</Label>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setForm(f=>({...f,bpl_status:true}))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.bpl_status?"bg-orange-50 border-orange-300 text-orange-700":"border-gray-200 text-gray-500"}`}>BPL</button>
              <button type="button" onClick={()=>setForm(f=>({...f,bpl_status:false}))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${!form.bpl_status?"bg-gray-50 border-gray-300 text-gray-700":"border-gray-200 text-gray-500"}`}>Non-BPL</button>
            </div></div>
          <div className="col-span-2 space-y-1"><Label>Member Status</Label>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setForm(f=>({...f,status:"active"}))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.status==="active"?"bg-green-50 border-green-300 text-green-700":"border-gray-200 text-gray-500"}`}>Active</button>
              <button type="button" onClick={()=>setForm(f=>({...f,status:"inactive"}))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${form.status==="inactive"?"bg-red-50 border-red-300 text-red-600":"border-gray-200 text-gray-500"}`}>Inactive</button>
            </div></div>
        </div>
      </div>
    </div>
  );
}

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>();
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
      const [mRes, sRes, lRes] = await Promise.all([
        membersApi.get(id), savingsApi.list({member_id:id}), loansApi.list({member_id:id}),
      ]);
      setMember(mRes.data);
      setSavings(sRes.data||[]);
      const ml = lRes.data||[];
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
      name:member.name||"", phone:member.phone||"", age:member.age?String(member.age):"",
      income:member.income?String(member.income):"", aadhar:member.aadhar||"",
      husband_name:member.husband_name||"", occupation:member.occupation||"",
      village:member.village||"", gram_panchayat:member.gram_panchayat||"",
      block:member.block||"", district:member.district||"", state:member.state||"", pin_code:member.pin_code||"",
      role:member.role||"member", joined_date:member.joined_date?member.joined_date.split("T")[0]:"",
      status:member.status||"active", bank_account:member.bank_account||"", bank_ifsc:member.bank_ifsc||"",
      caste_category:member.caste_category||"", bpl_status:member.bpl_status||false,
    });
    setShowEdit(true);
  }

  async function handleEdit(e:React.FormEvent) {
    e.preventDefault();
    if(!member) return;
    setEditSaving(true);
    try {
      await membersApi.update(member.id, {
        ...editForm, age:editForm.age?Number(editForm.age):null, income:editForm.income?Number(editForm.income):null,
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
  const loanEligibility  = totalSavings * 5;

  function getRepStats(loanId:string) {
    const reps = loanRepayments[loanId]||[];
    const paid = reps.filter(r=>r.status==="paid").length;
    const total = reps.length;
    const overdue = reps.filter(r=>r.status==="overdue").length;
    return { paid, total, overdue, pct: total?Math.round((paid/total)*100):0 };
  }

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
        <User className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4"/>
        <p className="text-muted-foreground font-medium">Member not found</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/members">← Back to Members</Link></Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <Link to="/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to Members
      </Link>

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-[#C2185B]/10 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]"/>
        <div className="bg-white px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] border-4 border-white shadow-md flex items-center justify-center shrink-0">
              <span className="text-white text-3xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${ROLE_COLORS[member.role]||ROLE_COLORS.member}`}>
                  {ROLE_LABELS[member.role]||"Member"}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${member.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                  {member.status==="active"?"● Active":"○ Inactive"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                {member.husband_name && <span>W/O {member.husband_name}</span>}
                {member.village && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{[member.village,member.block,member.district].filter(Boolean).join(", ")}</span>}
                {member.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/>{member.phone}</span>}
                {member.joined_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>Joined {new Date(member.joined_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {member.occupation && <span className="text-xs bg-[#C2185B]/5 text-[#C2185B] px-2.5 py-0.5 rounded-full">{member.occupation}</span>}
                {member.caste_category && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full uppercase">{member.caste_category}</span>}
                {member.bpl_status && <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">BPL</span>}
                {member.age && <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">Age {member.age}</span>}
              </div>
            </div>
            <Button onClick={openEdit} variant="outline" className="border-[#C2185B]/30 text-[#C2185B] hover:bg-[#C2185B]/5 shrink-0">
              <Pencil className="w-4 h-4 mr-1.5"/> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon:PiggyBank, color:"#C2185B", label:"Total Savings", value:`₹${totalSavings.toLocaleString("en-IN")}`, sub:`${savings.length} contributions` },
          { icon:TrendingUp, color:"#6A1B9A", label:"Loan Eligibility", value:`₹${loanEligibility.toLocaleString("en-IN")}`, sub:"5× total savings" },
          { icon:Landmark, color:"#0288D1", label:"Active Loans", value:activeLoans.length, sub:activeLoans.length?`₹${totalOutstanding.toLocaleString("en-IN")} outstanding`:"No active loans" },
          { icon:BadgeCheck, color:"#388E3C", label:"Loans Taken", value:loans.length, sub:`${loans.filter(l=>l.status==="closed").length} fully repaid` },
        ].map(({icon:Icon,color,label,value,sub})=>(
          <Card key={label} className="border-border/60 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor:`${color}15`}}>
                  <Icon className="w-4 h-4" style={{color}}/>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["overview","savings","loans"] as Tab[]).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab===tab?"bg-white shadow text-[#C2185B]":"text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab==="overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Personal Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C2185B]/10 flex items-center justify-center"><User className="w-3.5 h-3.5 text-[#C2185B]"/></div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                {label:"Full Name", value:member.name},
                {label:"W/O (Husband)", value:member.husband_name||"—"},
                {label:"Age", value:member.age?`${member.age} years`:"—"},
                {label:"Aadhaar", value:member.aadhar?`XXXX XXXX ${member.aadhar.slice(-4)}`:"—"},
                {label:"Occupation", value:member.occupation||"—"},
                {label:"Monthly Income", value:member.income?`₹${Number(member.income).toLocaleString("en-IN")}`:"—"},
                {label:"Caste Category", value:member.caste_category?member.caste_category.toUpperCase():"—"},
                {label:"BPL Status", value:member.bpl_status?"Yes (BPL)":"No"},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center"><Home className="w-3.5 h-3.5 text-[#6A1B9A]"/></div>
                Address Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {[
                {label:"Village", value:member.village||"—"},
                {label:"Gram Panchayat", value:member.gram_panchayat||"—"},
                {label:"Block / Tehsil", value:member.block||"—"},
                {label:"District", value:member.district||"—"},
                {label:"State", value:member.state||"—"},
                {label:"PIN Code", value:member.pin_code||"—"},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
              {(member.village||member.block||member.district) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#C2185B]"/>
                  {[member.village,member.gram_panchayat,member.block,member.district,member.state,member.pin_code].filter(Boolean).join(", ")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center"><Shield className="w-3.5 h-3.5 text-green-600"/></div>
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {[
                {label:"Role", value:ROLE_LABELS[member.role]||"Member"},
                {label:"Status", value:member.status==="active"?"Active":"Inactive"},
                {label:"Joined", value:member.joined_date?new Date(member.joined_date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"—"},
                {label:"Tenure", value:member.joined_date?(()=>{
                  const months=Math.floor((Date.now()-new Date(member.joined_date).getTime())/(1000*60*60*24*30));
                  return months>=12?`${Math.floor(months/12)} yr ${months%12} mo`:`${months} months`;
                })():"—"},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bank + Eligibility */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 className="w-3.5 h-3.5 text-blue-600"/></div>
                Bank Details (PMJDY)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {[
                {label:"Account No.", value:member.bank_account?`XXXX XXXX ${member.bank_account.slice(-4)}`:"—"},
                {label:"IFSC Code", value:member.bank_ifsc||"—"},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 text-sm">
                  <span className="text-muted-foreground w-36 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800 font-mono text-right">{value}</span>
                </div>
              ))}
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#C2185B]/5 to-[#6A1B9A]/5 border border-[#C2185B]/10 p-4">
                <p className="text-xs text-muted-foreground mb-0.5">Maximum Loan Eligibility</p>
                <p className="text-2xl font-bold text-[#C2185B]">₹{loanEligibility.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on ₹{totalSavings.toLocaleString("en-IN")} savings × 5
                  {activeLoans.length>0&&` · ₹${totalOutstanding.toLocaleString("en-IN")} currently borrowed`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SAVINGS */}
      {activeTab==="savings" && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#C2185B]"/> Savings History
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{savings.length} entries</span>
                <span className="font-semibold text-[#C2185B]">Total: ₹{totalSavings.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {savings.length===0?(
              <div className="text-center py-16 text-muted-foreground">
                <PiggyBank className="w-10 h-10 mx-auto mb-2 opacity-20"/><p>No savings recorded yet</p>
              </div>
            ):(
              <>
                {/* Bar chart */}
                <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-3">Monthly Contributions (last 12)</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {savings.slice(-12).map((s,i)=>{
                      const max=Math.max(...savings.slice(-12).map((x:any)=>Number(x.amount)));
                      const pct=max?(Number(s.amount)/max)*100:0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full rounded-t bg-gradient-to-t from-[#C2185B] to-[#6A1B9A]" style={{height:`${Math.max(pct,6)}%`}}/>
                          <span className="text-[9px] text-muted-foreground">{MONTH_NAMES[s.month]}</span>
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                            ₹{Number(s.amount).toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Month</TableHead><TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead><TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savings.map(s=>(
                        <TableRow key={s.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">{MONTH_NAMES[s.month]} {s.year}</TableCell>
                          <TableCell><span className="font-semibold text-green-700">₹{Number(s.amount).toLocaleString("en-IN")}</span></TableCell>
                          <TableCell><span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.payment_mode}</span></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{s.date?new Date(s.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-3 bg-[#C2185B]/5 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Running Total</span>
                  <span className="text-lg font-bold text-[#C2185B]">₹{totalSavings.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* LOANS */}
      {activeTab==="loans" && (
        <div className="space-y-4">
          {loans.length===0?(
            <Card className="border-border/60">
              <CardContent className="py-16 text-center text-muted-foreground">
                <Landmark className="w-10 h-10 mx-auto mb-2 opacity-20"/><p>No loans taken yet</p>
              </CardContent>
            </Card>
          ):loans.map(loan=>{
            const {paid,total,overdue,pct}=getRepStats(loan.id);
            const reps=loanRepayments[loan.id]||[];
            return (
              <Card key={loan.id} className="border-border/60">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-base">{loan.purpose||"General Purpose"}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3"/>₹{Number(loan.loan_amount).toLocaleString("en-IN")}</span>
                        <span>{loan.interest_rate}% p.m.</span>
                        <span>{loan.tenure_months} months</span>
                        {loan.disbursed_date&&<span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(loan.disbursed_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${loan.status==="active"?"bg-blue-100 text-blue-700":loan.status==="closed"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>
                      {loan.status.charAt(0).toUpperCase()+loan.status.slice(1)}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{paid} of {total} EMIs paid</span>
                      <span className="font-medium">{pct}% repaid</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${loan.status==="closed"?"bg-green-500":"bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]"}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                  {overdue>0&&(
                    <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
                      {overdue} overdue EMI{overdue>1?"s":""} — immediate attention required
                    </div>
                  )}
                  {reps.length>0&&(
                    <div className="border-t pt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3">EMI Schedule</p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {reps.map(r=>(
                          <div key={r.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50/80 text-sm">
                            <div className="flex items-center gap-2">
                              {r.status==="paid"&&<CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>}
                              {r.status==="overdue"&&<AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>}
                              {r.status==="pending"&&<Clock className="w-4 h-4 text-amber-500 shrink-0"/>}
                              <span className="text-muted-foreground">Due {new Date(r.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">₹{Number(r.emi_amount).toLocaleString("en-IN")}</span>
                              {r.paid_date&&<span className="text-xs text-green-600">Paid {new Date(r.paid_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={o=>!o&&setShowEdit(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#C2185B]"/> Edit Profile — {member.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="mt-2">
            <EditMemberForm form={editForm} setForm={setEditForm}/>
            <div className="flex gap-3 justify-end pt-5 mt-2 border-t">
              <Button type="button" variant="outline" onClick={()=>setShowEdit(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={editSaving}>
                {editSaving?"Saving...":"Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}