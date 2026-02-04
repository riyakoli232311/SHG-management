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
import { Plus, PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { savings, getTotalSavings, getMemberTotalSavings } from "@/data/savings";
import { members } from "@/data/members";

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
      <PageHeader title="Savings" description="Track and manage group savings">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Saving
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Saving</DialogTitle>
            </DialogHeader>
            <AddSavingForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
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
        />
      </div>

      {/* Member-wise Savings */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Member-wise Savings</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Total Saved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberSavingsSummary.map((member) => (
                <TableRow key={member.member_id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.village}</TableCell>
                  <TableCell>{member.contributions} months</TableCell>
                  <TableCell className="font-semibold text-success">
                    ₹{member.totalSavings.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.slice(0, 10).map((saving) => {
                const member = members.find((m) => m.member_id === saving.member_id);
                return (
                  <TableRow key={saving.saving_id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">{saving.saving_id}</TableCell>
                    <TableCell>{member?.name}</TableCell>
                    <TableCell>
                      {saving.month} {saving.year}
                    </TableCell>
                    <TableCell className="font-medium">₹{saving.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                        {saving.payment_mode}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(saving.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
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
          <SelectTrigger>
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
            <SelectTrigger>
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
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Payment Mode</Label>
        <Select value={formData.paymentMode} onValueChange={(v) => setFormData((p) => ({ ...p, paymentMode: v }))}>
          <SelectTrigger>
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Record Saving</Button>
      </div>
    </form>
  );
}
