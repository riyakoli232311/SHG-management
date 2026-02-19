import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, MapPin, Calendar, Save, Shield, LogOut } from "lucide-react";
import { currentUser, shgInfo } from "@/data/users";
import { Link } from "react-router-dom";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    shgName: currentUser.shg_name,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile Settings"
        description="Manage your personal account details"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card className="border-[#C2185B]/10 shadow-soft text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {currentUser.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{currentUser.role}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-xs font-medium">
                {currentUser.shg_name}
              </span>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm text-left">
                {[
                  { icon: Mail, value: currentUser.email },
                  { icon: Phone, value: currentUser.phone },
                  { icon: MapPin, value: shgInfo.village + ", " + shgInfo.district },
                  { icon: Calendar, value: "Joined " + new Date(currentUser.created_at).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <item.icon className="w-4 h-4 text-[#C2185B] flex-shrink-0" />
                    <span className="truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Button
                variant="outline"
                className="w-full justify-start border-[#C2185B]/20 hover:bg-[#C2185B]/5 text-sm"
                asChild
              >
                <Link to="/settings">
                  <Shield className="w-4 h-4 mr-2 text-[#C2185B]" />
                  Change Password
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-200 hover:bg-red-50 text-red-500 text-sm"
                asChild
              >
                <Link to="/">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#C2185B]" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-[#C2185B]/20 focus:border-[#C2185B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-[#C2185B]/20 focus:border-[#C2185B]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shgName">SHG Name</Label>
                <Input
                  id="shgName"
                  name="shgName"
                  value={formData.shgName}
                  disabled
                  className="border-[#C2185B]/20 bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={currentUser.role}
                  disabled
                  className="border-[#C2185B]/20 bg-muted"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="btn-gradient text-white border-0">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="border-[#C2185B]/10 shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#6A1B9A]" />
                </div>
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Meetings Attended", value: "24", color: "text-[#C2185B]" },
                  { label: "Savings Recorded", value: "16", color: "text-[#6A1B9A]" },
                  { label: "Loans Managed", value: "8", color: "text-[#F57F17]" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-4 rounded-xl bg-gradient-to-br from-[#C2185B]/5 to-[#6A1B9A]/5"
                  >
                    <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}