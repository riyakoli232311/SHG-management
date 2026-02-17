import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Eye, Edit, Trash2, Users, Heart } from "lucide-react";
import { members, Member } from "@/data/members";
import { getMemberTotalSavings } from "@/data/savings";
import { getLoansByMember } from "@/data/loans";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Members"
        description={`${members.length} registered members in your SHG`}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-10 w-64 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#C2185B]/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Add New Member
              </DialogTitle>
            </DialogHeader>
            <AddMemberForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Members Table */}
      <Card className="border-[#C2185B]/10 shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#C2185B]/10 bg-gradient-to-r from-[#C2185B]/5 to-transparent">
                  <TableHead className="text-[#C2185B] font-semibold">Member ID</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Name</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Age</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Village</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Phone</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Income</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold">Join Date</TableHead>
                  <TableHead className="text-[#C2185B] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.member_id} className="border-[#C2185B]/5 hover:bg-[#C2185B]/5 transition-colors">
                    <TableCell className="font-mono text-sm text-muted-foreground">{member.member_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.age}</TableCell>
                    <TableCell className="text-muted-foreground">{member.village}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell className="font-semibold text-[#C2185B]">₹{member.income.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(member.join_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-[#C2185B]/10 hover:text-[#C2185B]">
                          <Link to={`/members/${member.member_id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-[#6A1B9A]/10 hover:text-[#6A1B9A]">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function AddMemberForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    village: "",
    phone: "",
    income: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock add member
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter member's full name"
          value={formData.name}
          onChange={handleChange}
          className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            name="village"
            placeholder="Village name"
            value={formData.village}
            onChange={handleChange}
            className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="10-digit number"
            value={formData.phone}
            onChange={handleChange}
            className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income">Monthly Income</Label>
          <Input
            id="income"
            name="income"
            type="number"
            placeholder="₹ Amount"
            value={formData.income}
            onChange={handleChange}
            className="border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-[#C2185B]/20 hover:bg-[#C2185B]/5">
          Cancel
        </Button>
        <Button type="submit" className="btn-gradient text-white border-0">
          Add Member
        </Button>
      </div>
    </form>
  );
}
