import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Globe, Palette, Database, Save } from "lucide-react";
import { shgInfo } from "@/data/users";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emiReminders: true,
    savingsAlerts: true,
    meetingReminders: false,
    newMemberAlerts: true,
  });

  const [shgDetails, setShgDetails] = useState({
    name: shgInfo.name,
    village: shgInfo.village,
    block: shgInfo.block,
    district: shgInfo.district,
    bankName: shgInfo.bank_name,
    bankAccount: shgInfo.bank_account,
    ifsc: shgInfo.ifsc,
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        description="Manage your SHG preferences and configuration"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* SHG Details */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-[#C2185B]" />
                </div>
                SHG Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SHG Name</Label>
                  <Input
                    value={shgDetails.name}
                    onChange={(e) => setShgDetails((p) => ({ ...p, name: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration No.</Label>
                  <Input
                    value={shgInfo.registration_no}
                    disabled
                    className="border-[#C2185B]/20 bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Village</Label>
                  <Input
                    value={shgDetails.village}
                    onChange={(e) => setShgDetails((p) => ({ ...p, village: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Input
                    value={shgDetails.block}
                    onChange={(e) => setShgDetails((p) => ({ ...p, block: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input
                    value={shgDetails.district}
                    onChange={(e) => setShgDetails((p) => ({ ...p, district: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
              </div>
              <Button className="btn-gradient text-white border-0">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-[#6A1B9A]" />
                </div>
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  value={shgDetails.bankName}
                  onChange={(e) => setShgDetails((p) => ({ ...p, bankName: e.target.value }))}
                  className="border-[#C2185B]/20 focus:border-[#C2185B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={shgDetails.bankAccount}
                    onChange={(e) => setShgDetails((p) => ({ ...p, bankAccount: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    value={shgDetails.ifsc}
                    onChange={(e) => setShgDetails((p) => ({ ...p, ifsc: e.target.value }))}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
              </div>
              <Button className="btn-gradient text-white border-0">
                <Save className="w-4 h-4 mr-2" />
                Save Bank Details
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FBC02D]/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#F57F17]" />
                </div>
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "emiReminders", label: "EMI Reminders", desc: "Get notified before EMI due dates" },
                { key: "savingsAlerts", label: "Savings Alerts", desc: "Alerts when monthly savings are recorded" },
                { key: "meetingReminders", label: "Meeting Reminders", desc: "Reminders for scheduled group meetings" },
                { key: "newMemberAlerts", label: "New Member Alerts", desc: "Notify when a new member joins" },
              ].map((item, index, arr) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications((p) => ({ ...p, [item.key]: v }))}
                    />
                  </div>
                  {index < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Security */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#C2185B]" />
                </div>
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="border-[#C2185B]/20 focus:border-[#C2185B]" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" className="border-[#C2185B]/20 focus:border-[#C2185B]" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="••••••••" className="border-[#C2185B]/20 focus:border-[#C2185B]" />
              </div>
              <Button className="w-full btn-gradient text-white border-0">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#6A1B9A]" />
                </div>
                App Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Formation Date", value: new Date(shgInfo.formation_date).toLocaleDateString() },
                { label: "State", value: shgInfo.state },
                { label: "Monthly Saving", value: `₹${shgInfo.monthly_saving}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1 border-b border-[#C2185B]/5 last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}