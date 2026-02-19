import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, PiggyBank, TrendingUp, Calendar, Sparkles, Heart } from "lucide-react";
import { savings, getTotalSavings, getMemberTotalSavings } from "@/data/savings";
import { members } from "@/data/members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Savings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const totalSavings = getTotalSavings();

  // Get member-wise savings summary
  const memberSavingsSummary = members.map((member) => ({
    ...member,
    totalSavings: getMemberTotalSavings(member.member_id),
    contributions: savings.filter((s) => s.member_id === member.member_id).length,
  }));

  return (
    <DashboardLayout>
      <PageHeader title="Finance" description="Track and manage group savings">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Record Saving
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#C2185B]/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-white" />
                </div>
                Record New Saving
              </DialogTitle>
            </DialogHeader>
            <AddSavingForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Group Savings"
          value={`₹${totalSavings.toLocaleString()}`}
          subtitle="All time collection"
          icon={PiggyBank}
          variant="success"
        />
        <StatCard
          title="This Month"
          value={`₹${(savings.filter((s) => s.month === "April").reduce((sum, s) => sum + s.amount, 0)).toLocaleString()}`}
          subtitle="April 2024"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Average per Member"
          value={`₹${Math.round(totalSavings / members.length).toLocaleString()}`}
          subtitle={`${members.length} members`}
          icon={TrendingUp}
          variant="info"
        />
      </div>

      {/* Member-wise Savings */}
      <Card className="border-[#C2185B]/10 shadow-soft mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C2185B]/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#C2185B]" />
            </div>
            Member-wise Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#C2185B]/10 bg-gradient-to-r from-[#C2185B]/5 to-transparent">
                  <TableHead className="text-[#C2185B] font-semibold">Member</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Village</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Contributions</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Total Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberSavingsSummary.map((member) => (
                  <TableRow key={member.member_id} className="border-[#C2185B]/5 hover:bg-[#C2185B]/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.village}</TableCell>
                    <TableCell>{member.contributions} months</TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      ₹{member.totalSavings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-[#C2185B]/10 shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6A1B9A]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#6A1B9A]" />
            </div>
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#C2185B]/10 bg-gradient-to-r from-[#6A1B9A]/5 to-transparent">
                  <TableHead className="text-[#6A1B9A] font-semibold">ID</TableHead>
                  <TableHead className="text-[#6A1B9A] font-semibold">Member</TableHead>
                  <TableHead className="text-[#6A1B9A] font-semibold">Month</TableHead>
                  <TableHead className="text-[#6A1B9A] font-semibold">Amount</TableHead>
                  <TableHead className="text-[#6A1B9A] font-semibold">Mode</TableHead>
                  <TableHead className="text-[#6A1B9A] font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savings.slice(0, 10).map((saving) => {
                  const member = members.find((m) => m.member_id === saving.member_id);
                  return (
                    <TableRow key={saving.saving_id} className="border-[#C2185B]/5 hover:bg-[#C2185B]/5 transition-colors">
                      <TableCell className="font-mono text-sm text-muted-foreground">{saving.saving_id}</TableCell>
                      <TableCell className="font-medium">{member?.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {saving.month} {saving.year}
                      </TableCell>
                      <TableCell className="font-semibold text-[#C2185B]">₹{saving.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs bg-[#C2185B]/10 text-[#C2185B] font-medium">
                          {saving.payment_mode}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(saving.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function AddSavingForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    memberId: "",
    month: "",
    amount: "",
    paymentMode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Member</Label>
        <Select value={formData.memberId} onValueChange={(v) => setFormData((p) => ({ ...p, memberId: v }))}>
          <SelectTrigger className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20">
            <SelectValue placeholder="Choose member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.member_id} value={m.member_id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <Select value={formData.month} onValueChange={(v) => setFormData((p) => ({ ...p, month: v }))}>
            <SelectTrigger className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {["January", "February", "March", "April", "May", "June"].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="₹ 500"
            value={formData.amount}
            onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
            className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Payment Mode</Label>
        <Select value={formData.paymentMode} onValueChange={(v) => setFormData((p) => ({ ...p, paymentMode: v }))}>
          <SelectTrigger className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20">
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-[#C2185B]/20 hover:bg-[#C2185B]/5">
          Cancel
        </Button>
        <Button type="submit" className="btn-gradient text-white border-0">
          Record Saving
        </Button>
      </div>
    </form>
  );
}
