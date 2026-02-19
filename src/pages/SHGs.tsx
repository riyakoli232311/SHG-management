import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Landmark,
  BadgeCheck,
  Building2,
  Users,
  Star,
  ShieldCheck,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Scale,
  BookOpen,
  HandCoins,
  HeartHandshake,
  Clock,
  Banknote,
} from "lucide-react";
import { shgInfo } from "@/data/users";
import { members } from "@/data/members";
import { getTotalSavings } from "@/data/savings";
import { getActiveLoans } from "@/data/loans";

const today = new Date();
const formationDate = new Date(shgInfo.formation_date);
const ageYears = Math.floor(
  (today.getTime() - formationDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
);
const ageMonths =
  Math.floor(
    (today.getTime() - formationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  ) % 12;

const panchSutra = [
  { icon: Users, title: "Regular Meetings", desc: "Group meets on fixed schedule", status: true },
  { icon: HandCoins, title: "Regular Savings", desc: "All members save each month", status: true },
  { icon: BookOpen, title: "Internal Lending", desc: "Savings lent to members in need", status: true },
  { icon: ClipboardList, title: "Timely Repayment", desc: "Loan repayments on schedule", status: true },
  { icon: FileText, title: "Proper Bookkeeping", desc: "Passbooks & records maintained", status: true },
];

export default function SHGs() {
  const totalSavings = getTotalSavings();
  const activeLoans = getActiveLoans();
  const villages = [...new Set(members.map((m: any) => m.village))];

  const gradingCriteria = [
    { label: "Age > 6 months", met: ageYears * 12 + ageMonths >= 6 },
    { label: "All members saving regularly", met: true },
    { label: "Bank account opened", met: !!shgInfo.bank_account },
    { label: "Internal loans disbursed", met: activeLoans.length > 0 },
    { label: "Meeting records maintained", met: true },
    { label: "Linked to CIF/NRLM", met: false },
  ];
  const gradeMet = gradingCriteria.filter((g) => g.met).length;
  const grade = gradeMet >= 6 ? "A" : gradeMet >= 4 ? "B" : "C";
  const gradeColors = { A: "from-emerald-500 to-emerald-600", B: "from-amber-400 to-amber-500", C: "from-red-400 to-red-500" };
  const gradeLabels = {
    A: "Excellent — Eligible for bank linkage",
    B: "Good — Minor improvements needed",
    C: "Developing — Requires attention",
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Group Profile"
        description="SHG identity, compliance status, bank linkage and grading"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Identity Card */}
          <Card className="border-[#C2185B]/10 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]" />
            <CardContent className="pt-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-md flex-shrink-0">
                  <HeartHandshake className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{shgInfo.name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Reg. No:{" "}
                        <span className="font-mono font-medium text-foreground">
                          {shgInfo.registration_no}
                        </span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 flex-shrink-0">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { icon: MapPin, text: `${shgInfo.village}, ${shgInfo.district}` },
                      { icon: Calendar, text: `Formed ${formationDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}` },
                      { icon: Clock, text: `${ageYears}y ${ageMonths}m old` },
                    ].map((tag) => (
                      <span key={tag.text} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                        <tag.icon className="w-3 h-3" /> {tag.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/40">
                {[
                  { label: "Block", value: shgInfo.block, icon: Building2 },
                  { label: "District", value: shgInfo.district, icon: MapPin },
                  { label: "State", value: shgInfo.state, icon: MapPin },
                  { label: "Monthly Saving", value: `₹${shgInfo.monthly_saving}/member`, icon: Banknote },
                  { label: "Total Members", value: `${members.length} women`, icon: Users },
                  { label: "Meeting Day", value: "1st of every month", icon: Calendar },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3 h-3 text-[#C2185B]" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bank Linkage */}
          <Card className="border-[#6A1B9A]/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-[#6A1B9A]" />
                </div>
                Bank Linkage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Bank account linked successfully</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Bank Name", value: shgInfo.bank_name },
                  { label: "Account Number", value: shgInfo.bank_account },
                  { label: "IFSC Code", value: shgInfo.ifsc },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl border border-border/50 bg-white">
                    <p className="text-xs text-muted-foreground mb-1.5">{item.label}</p>
                    <p className="text-sm font-bold font-mono text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                <div>
                  <p className="text-xs text-muted-foreground">Group Corpus</p>
                  <p className="text-xl font-bold text-[#6A1B9A]">₹{totalSavings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Loans</p>
                  <p className="text-xl font-bold text-[#C2185B]">{activeLoans.length}</p>
                </div>
                <Button variant="outline" size="sm" className="border-[#6A1B9A]/20 text-[#6A1B9A] hover:bg-[#6A1B9A]/5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Bank Statement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Panch Sutra */}
          <Card className="border-[#C2185B]/10 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-[#C2185B]" />
                  </div>
                  Panch Sutra Compliance
                </CardTitle>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full border border-border/50">
                  NABARD Standard
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {panchSutra.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      item.status ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.status ? "bg-emerald-100" : "bg-red-100"}`}>
                      <item.icon className={`w-4 h-4 ${item.status ? "text-emerald-600" : "text-red-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${item.status ? "text-emerald-700" : "text-red-700"}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {item.status ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* NRLM Grade */}
          <Card className="border-[#C2185B]/10 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${gradeColors[grade]} p-5 text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium opacity-80 mb-1">NRLM Grading</p>
                  <div className="flex items-center gap-2">
                    <span className="text-5xl font-black">{grade}</span>
                    <div className="flex flex-col gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className="w-3.5 h-3.5"
                          fill={
                            grade === "A" || (grade === "B" && s <= 2)
                              ? "white"
                              : "transparent"
                          }
                          stroke="white"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs mt-2 opacity-90 leading-tight">{gradeLabels[grade]}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Criteria Checklist</p>
              <div className="space-y-2">
                {gradingCriteria.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {g.met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-xs ${g.met ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {g.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Criteria met</span>
                  <span className="font-semibold">{gradeMet}/{gradingCriteria.length}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${gradeColors[grade]} rounded-full transition-all`}
                    style={{ width: `${(gradeMet / gradingCriteria.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Village breakdown */}
          <Card className="border-[#C2185B]/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C2185B]" />
                Member Villages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {villages.map((village) => {
                const vm = members.filter((m: any) => m.village === village);
                const pct = Math.round((vm.length / members.length) * 100);
                return (
                  <div key={village as string}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-foreground">{village as string}</span>
                      <span className="text-muted-foreground">{vm.length} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#C2185B]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-[#C2185B]/10 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C2185B]" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Registration Certificate", status: "available" },
                { label: "Bank Passbook", status: "available" },
                { label: "Meeting Register", status: "available" },
                { label: "Loan Ledger", status: "available" },
                { label: "NRLM Linkage Certificate", status: "pending" },
              ].map((doc) => (
                <div
                  key={doc.label}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{doc.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {doc.status === "available" ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}