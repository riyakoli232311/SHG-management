// src/pages/member/MemberSHG.tsx — Dark Theme
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DCard, DCardHeader, PageHeader, DSpinner, DBadge } from "@/components/ui/dark";
import { Users, MapPin, Building2, Calendar, Phone, Shield, Landmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { membersApi, shgApi } from "@/lib/api";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = { president:"President", secretary:"Secretary", treasurer:"Treasurer", member:"Member" };
const ROLE_VARIANT: Record<string, "amber" | "blue" | "purple" | "gray"> = { president:"amber", secretary:"blue", treasurer:"purple", member:"gray" };

export default function MemberSHG() {
  const { user } = useAuth();
  const [shg, setShg]         = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([shgApi.get(), membersApi.list()])
      .then(([shgRes, membersRes]) => { setShg(shgRes.data||null); setMembers(membersRes.data||[]); })
      .catch(() => toast.error("Failed to load SHG information"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><DSpinner /></DashboardLayout>;

  const officeBearer = members.filter(m => m.role !== "member");
  const myProfile    = members.find(m => m.name === user?.name);

  function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
    return (
      <div className="flex justify-between items-center py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-white/35 flex items-center gap-1.5 shrink-0 w-36">{Icon && <Icon className="w-3.5 h-3.5" />}{label}</span>
        <span className="font-bold text-white text-right break-all">{value}</span>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="My SHG" subtitle="Your Self Help Group information" />

      <div className="grid lg:grid-cols-2 gap-5">
        {/* SHG Info */}
        <DCard>
          <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(194,24,91,0.12)" }}><Building2 className="w-3.5 h-3.5 text-[#C2185B]" /></div>Group Information</h3></DCardHeader>
          <div className="p-5">
            {shg ? (
              <div>
                <InfoRow label="SHG Name" value={shg.name} icon={Building2} />
                <InfoRow label="Registration No." value={shg.registration_number||"—"} icon={Building2} />
                <InfoRow label="Village" value={shg.village||"—"} icon={MapPin} />
                <InfoRow label="Block / Tehsil" value={shg.block||"—"} icon={MapPin} />
                <InfoRow label="District" value={shg.district||"—"} icon={MapPin} />
                <InfoRow label="State" value={shg.state||"—"} icon={MapPin} />
                <InfoRow label="Formation Date" value={shg.formation_date ? new Date(shg.formation_date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}):"—"} icon={Calendar} />
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-white/35 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Total Members</span>
                  <span className="font-bold text-white">{members.length} members</span>
                </div>
              </div>
            ) : <p className="text-sm text-white/30 text-center py-6">SHG information not available</p>}
          </div>
        </DCard>

        {/* Bank + My Profile */}
        <DCard>
          <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.12)" }}><Landmark className="w-3.5 h-3.5 text-[#7C3AED]" /></div>Bank Details</h3></DCardHeader>
          <div className="p-5 space-y-0">
            <InfoRow label="Bank Name"   value={shg?.bank_name||"—"} />
            <InfoRow label="Account No." value={shg?.bank_account?`****${String(shg.bank_account).slice(-4)}`:"—"} />
            <InfoRow label="IFSC Code"   value={shg?.ifsc||"—"} />
          </div>
          <div className="mx-5 mb-5 p-4 rounded-xl" style={{ background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.15)" }}>
            <p className="text-xs font-bold text-[#C2185B] uppercase tracking-wider mb-2">My Profile</p>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-white/40 mt-0.5">{myProfile ? ROLE_LABELS[myProfile.role]||"Member" : "Member"}</p>
          </div>
        </DCard>

        {/* Office Bearers */}
        {officeBearer.length > 0 && (
          <DCard>
            <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}><Shield className="w-3.5 h-3.5 text-amber-400" /></div>Office Bearers</h3></DCardHeader>
            <div className="p-5 space-y-3">
              {officeBearer.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}>{m.name.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{m.name}</p>
                    {m.phone && <p className="text-xs text-white/35 flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</p>}
                  </div>
                  <DBadge variant={ROLE_VARIANT[m.role]||"gray"}>{ROLE_LABELS[m.role]||"Member"}</DBadge>
                </div>
              ))}
            </div>
          </DCard>
        )}

        {/* All Members */}
        <DCard>
          <DCardHeader><h3 className="text-sm font-bold text-white flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(2,136,209,0.12)" }}><Users className="w-3.5 h-3.5 text-[#0288D1]" /></div>All Members ({members.length})</h3></DCardHeader>
          <div className="p-5">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,rgba(194,24,91,0.6),rgba(106,27,154,0.6))" }}>{m.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-bold">{m.name}</p>
                    {m.village && <p className="text-xs text-white/30 truncate">{m.village}</p>}
                  </div>
                  <DBadge variant={ROLE_VARIANT[m.role]||"gray"}>{ROLE_LABELS[m.role]}</DBadge>
                </div>
              ))}
            </div>
          </div>
        </DCard>
      </div>
    </DashboardLayout>
  );
}