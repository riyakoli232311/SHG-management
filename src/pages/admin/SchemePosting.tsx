// src/pages/admin/SchemePosting.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Calendar, PlusCircle } from 'lucide-react';

interface Scheme {
  id: string;
  title: string;
  description: string;
  admin_email: string;
  created_at: string;
}

export default function SchemePosting() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadSchemes() {
    try {
      const res = await adminApi.getSchemes();
      setSchemes(res.data);
    } catch (err: any) {
      toast.error('Failed to load schemes: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.createScheme({ title, description });
      toast.success('Scheme posted successfully!');
      setTitle('');
      setDescription('');
      loadSchemes(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || 'Failed to post scheme');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Government Schemes</h1>
        <p className="text-slate-500 text-sm">Post new schemes and announcements for SHGs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#FFF5F7] p-4 border-b border-[#FCE4EC] flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#C2185B]" />
          <h2 className="font-semibold text-[#880E4F]">Post New Scheme</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-gray-700">Scheme Title</Label>
            <Input
              id="title"
              placeholder="e.g. Mahila Samridhi Yojana"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={submitting}
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-gray-700">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Provide eligibility details, benefits, and application process..."
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitting}
              className="bg-gray-50 border-gray-200 focus:bg-white resize-y"
            />
          </div>

          <Button 
            type="submit" 
            className="bg-gradient-to-r from-[#C2185B] to-[#AD1457] hover:opacity-90 text-white"
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post Scheme to Network'}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Previously Posted Schemes</h2>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading schemes...</div>
        ) : schemes.length === 0 ? (
          <div className="bg-white p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500">
            No schemes have been posted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {schemes.map(scheme => (
              <div key={scheme.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-lg text-slate-800 flex-1">{scheme.title}</h3>
                  <div className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                    Active
                  </div>
                </div>
                
                <p className="text-slate-600 mt-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {scheme.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Posted by: {scheme.admin_email || 'Admin'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Date: {new Date(scheme.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
