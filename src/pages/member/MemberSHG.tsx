// src/pages/member/MemberSHG.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Building2, Calendar, Phone, Shield, Landmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { membersApi } from "@/lib/api";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  president: "President", secretary: "Secretary", treasurer: "Treasurer", member: "Member",
};
const ROLE_COLORS: Record<string, string> = {
  president: "bg-amber-100 text-amber-700",
  secretary: "bg-blue-100 text-blue-700",
  treasurer: "bg-purple-100 text-purple-700",
  member: "bg-gray-100 text-gray-600",
};

export default function MemberSHG() {
  const { user, shg } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await membersApi.list();
        setMembers(res.data || []);
      } catch {
        toast.error("Failed to load SHG members");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const officeBearer = members.filter((m) => m.role !== "member");
  const regularMembers = members.filter((m) => m.role === "member");

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
        <h1 className="text-2xl font-bold text-gray-900">My SHG</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your Self Help Group information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* SHG Info */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-[#C2185B]" />
              </div>
              Group Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shg ? (
              <div className="space-y-0">
                {[
                  { label: "SHG Name",    value: shg.name,         icon: Building2 },
                  { label: "Village",     value: shg.village || "—", icon: MapPin },
                  { label: "District",    value: shg.district || "—", icon: MapPin },
                  { label: "State",       value: (shg as any).state || "—", icon: MapPin },
                  { label: "Total Members", value: `${members.length} members`, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </span>
                    <span className="font-medium text-gray-800">{value as string}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">SHG information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                <Landmark className="w-3.5 h-3.5 text-[#6A1B9A]" />
              </div>
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {[
              { label: "Bank Name",    value: (shg as any)?.bank_name    || "—" },
              { label: "Account No.", value: (shg as any)?.bank_account  || "—" },
              { label: "IFSC Code",   value: (shg as any)?.ifsc          || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium font-mono text-gray-800">{value}</span>
              </div>
            ))}

            {/* My own info */}
            <div className="mt-4 p-3 bg-[#C2185B]/5 rounded-xl border border-[#C2185B]/10">
              <p className="text-xs font-semibold text-[#C2185B] mb-2">My Profile</p>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {members.find((m) => m.name === user?.name)
                  ? ROLE_LABELS[members.find((m) => m.name === user?.name)?.role] || "Member"
                  : "Member"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Office Bearers */}
        {officeBearer.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                </div>
                Office Bearers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {officeBearer.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    {m.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {m.phone}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role] || ROLE_COLORS.member}`}>
                    {ROLE_LABELS[m.role] || "Member"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Members */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0288D1]/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#0288D1]" />
              </div>
              All Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C2185B]/60 to-[#6A1B9A]/60 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate font-medium">{m.name}</p>
                    {m.village && <p className="text-xs text-muted-foreground truncate">{m.village}</p>}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ROLE_COLORS[m.role] || ROLE_COLORS.member}`}>
                    {ROLE_LABELS[m.role]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}