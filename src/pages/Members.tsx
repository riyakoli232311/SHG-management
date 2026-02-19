// src/pages/Members.tsx  (REPLACE your existing Members.tsx)
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Phone, MapPin } from "lucide-react";
import { membersApi } from "@/lib/api";
import { toast } from "sonner";

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", village: "", age: "", income: "", aadhar: "" });
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    try {
      const res = await membersApi.list();
      setMembers(res.data);
    } catch (err: any) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMembers(); }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.village || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      await membersApi.create({
        name: form.name,
        phone: form.phone || undefined,
        village: form.village || undefined,
        age: form.age ? Number(form.age) : undefined,
        income: form.income ? Number(form.income) : undefined,
        aadhar: form.aadhar || undefined,
      });
      toast.success("Member added!");
      setForm({ name: "", phone: "", village: "", age: "", income: "", aadhar: "" });
      setShowAdd(false);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Members" description="Manage your SHG members" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or village..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-[#C2185B] hover:bg-[#AD1457] text-white shrink-0"
          onClick={() => setShowAdd(v => !v)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>

      {/* Add Member Form */}
      {showAdd && (
        <Card className="mb-6 border-[#C2185B]/20">
          <CardContent className="pt-5">
            <h3 className="font-semibold mb-4">New Member</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1 space-y-1">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" required />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit number" />
              </div>
              <div className="space-y-1">
                <Label>Village</Label>
                <Input value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} placeholder="Village" />
              </div>
              <div className="space-y-1">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="Age" />
              </div>
              <div className="space-y-1">
                <Label>Monthly Income (₹)</Label>
                <Input type="number" value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))} placeholder="Income" />
              </div>
              <div className="space-y-1">
                <Label>Aadhar Number</Label>
                <Input value={form.aadhar} onChange={e => setForm(f => ({ ...f, aadhar: e.target.value }))} placeholder="Aadhar" />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#C2185B] hover:bg-[#AD1457] text-white" disabled={saving}>
                  {saving ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "No members match your search." : "No members yet. Add your first member!"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => (
            <Link key={member.id} to={`/members/${member.id}`}>
              <Card className="hover:border-[#C2185B]/40 hover:shadow-md transition-all cursor-pointer border-border">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        {member.village && <><MapPin className="w-3 h-3" />{member.village}</>}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="w-3 h-3" />{member.phone}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {member.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}