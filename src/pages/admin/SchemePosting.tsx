// src/pages/admin/SchemePosting.tsx — Dark theme matching Dashboard.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Calendar, PlusCircle, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const up = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

interface Scheme {
  id: string; title: string; description: string;
  admin_email: string; created_at: string;
}

// ── Dark card wrapper ─────────────────────────────────────────────────────
function DCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ background: '#0a041a', borderColor: 'rgba(255,255,255,0.07)', ...style }}>
      {children}
    </div>
  );
}

// ── Dark input ────────────────────────────────────────────────────────────
function DInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-white/25 outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(194,24,91,0.5)')}
      onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

// ── Dark textarea ─────────────────────────────────────────────────────────
function DTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-white/25 outline-none transition-all resize-y"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(194,24,91,0.5)')}
      onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
    />
  );
}

export default function SchemePosting() {
  const [schemes,     setSchemes]     = useState<Scheme[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  async function loadSchemes() {
    try {
      const res = await adminApi.getSchemes();
      setSchemes(res.data || []);
    } catch (err: any) {
      toast.error('Failed to load schemes: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSchemes(); }, []);

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
      loadSchemes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post scheme');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl mx-auto space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div variants={up}>
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 text-white"
          style={{ background: 'linear-gradient(135deg,#C2185B 0%,#AD1457 40%,#6A1B9A 100%)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full bg-white/10 translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/75 text-sm font-medium">Admin Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-1 leading-tight drop-shadow-lg">
              Government Schemes
            </h1>
            <p className="text-white/60 text-sm">
              Post new announcements and schemes for all SHGs in your district
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Post new scheme form ─────────────────────────────────── */}
      <motion.div variants={up}>
        <DCard>
          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(194,24,91,0.15)' }}>
              <PlusCircle className="w-4 h-4 text-[#C2185B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Post New Scheme</h2>
              <p className="text-xs text-white/35">Broadcast to all registered SHGs</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Scheme Title</p>
              <DInput
                type="text"
                placeholder="e.g. Mahila Samridhi Yojana"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Detailed Description</p>
              <DTextarea
                rows={4}
                placeholder="Provide eligibility details, benefits, and application process..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#C2185B,#6A1B9A)', boxShadow: '0 0 20px rgba(194,24,91,0.3)' }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
              ) : (
                <><PlusCircle className="w-4 h-4" /> Post Scheme to Network</>
              )}
            </button>
          </form>
        </DCard>
      </motion.div>

      {/* ── Previously posted schemes ────────────────────────────── */}
      <motion.div variants={up}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Previously Posted Schemes</h2>
          <span className="text-sm text-white/30">{schemes.length} total</span>
        </div>

        {loading ? (
          <DCard>
            <div className="p-10 flex flex-col items-center gap-3 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#C2185B]" />
              <p className="text-sm text-white/30">Loading schemes...</p>
            </div>
          </DCard>
        ) : schemes.length === 0 ? (
          <div className="py-12 text-center rounded-xl"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <FileText className="w-10 h-10 mx-auto mb-3 text-white/10" />
            <p className="text-sm text-white/30 font-medium">No schemes have been posted yet.</p>
            <p className="text-xs text-white/20 mt-1">Use the form above to post your first scheme.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schemes.map((scheme, i) => (
              <motion.div key={scheme.id} variants={up}>
                <DCard className="group hover:border-white/15 transition-all duration-300">
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'rgba(245,158,11,0.12)' }}>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <h3 className="font-bold text-base text-white group-hover:text-pink-300 transition-colors leading-tight">
                          {scheme.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
                        style={{ color: '#43A047', background: 'rgba(67,160,71,0.12)', border: '1px solid rgba(67,160,71,0.2)' }}>
                        Active
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/50 whitespace-pre-wrap leading-relaxed pl-12">
                      {scheme.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-4 pt-4 flex flex-wrap items-center gap-4 text-xs text-white/25"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#C2185B]/50" />
                        <span>Posted by: {scheme.admin_email || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C2185B]/50" />
                        <span>{new Date(scheme.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </DCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
