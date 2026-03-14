// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Users, AlertCircle, Calendar, MapPin, Loader2, IndianRupee, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SHG {
  id: string;
  name: string;
  village: string;
  block: string;
  district: string;
  state: string;
  formation_date: string;
  member_count: number;
}

interface SHGDetails {
  shg: any;
  total_members: number;
  office_bearers: {
    president: any | null;
    secretary: any | null;
    treasurer: any | null;
  };
  financials: {
    total_savings: number;
    active_loans_count: number;
    active_loans_total: number;
  };
}

export default function AdminDashboard() {
  const [shgs, setShgs] = useState<SHG[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedShgId, setSelectedShgId] = useState<string | null>(null);
  const [shgDetails, setShgDetails] = useState<SHGDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function loadShgs() {
      try {
        const res = await adminApi.getShgs();
        setShgs(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load SHGs');
      } finally {
        setLoading(false);
      }
    }
    loadShgs();
  }, []);

  useEffect(() => {
    if (!selectedShgId) {
      setShgDetails(null);
      return;
    }

    async function loadDetails() {
      setDetailsLoading(true);
      try {
        const res = await adminApi.getShgDetails(selectedShgId!);
        setShgDetails(res.data);
      } catch (err: any) {
        console.error("Failed to load details", err);
      } finally {
        setDetailsLoading(false);
      }
    }
    loadDetails();
  }, [selectedShgId]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-[#C2185B]/30 border-t-[#C2185B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SHG Directory</h1>
          <p className="text-gray-500 text-sm">Overview of all Self Help Groups in your jurisdiction</p>
        </div>
        <div className="bg-[#FFF5F7] text-[#880E4F] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 border border-[#FCE4EC]">
          <Users className="w-4 h-4 text-[#C2185B]" />
          Total SHGs: {shgs.length}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shgs.map((shg) => (
          <div key={shg.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C2185B]/20 transition-all flex flex-col">
            <h3 className="font-semibold text-lg text-gray-800 break-words">{shg.name}</h3>
            
            <div className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#C2185B]/60" />
                <span>
                  {shg.village}, {shg.block}<br />
                  {shg.district}, {shg.state}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0 text-[#C2185B]/60" />
                <span>Formed: {new Date(shg.formation_date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0 text-[#C2185B]/60" />
                <span>Members: <span className="font-medium text-gray-900">{shg.member_count}</span></span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => setSelectedShgId(shg.id)}
                className="text-[#C2185B] font-medium text-sm hover:underline flex items-center gap-1"
              >
                View Details <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        ))}

        {shgs.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 border-dashed rounded-xl">
            No SHGs found in your area.
          </div>
        )}
      </div>

      <Dialog open={!!selectedShgId} onOpenChange={(open) => !open && setSelectedShgId(null)}>
        <DialogContent className="max-w-2xl bg-white border-none shadow-2xl overflow-hidden p-0">
          {detailsLoading || !shgDetails ? (
            <div className="p-12 flex justify-center items-center flex-col gap-4">
              <Loader2 className="w-8 h-8 text-[#C2185B] animate-spin" />
              <p className="text-gray-500 text-sm">Loading SHG details...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{shgDetails.shg.name}</DialogTitle>
                  <DialogDescription className="text-white/80 mt-1">
                    {shgDetails.shg.village}, {shgDetails.shg.district}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Financials highlight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 font-medium mb-1 text-sm">
                      <IndianRupee className="w-4 h-4" /> Total Savings
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{shgDetails.financials.total_savings.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1 text-sm">
                      <Landmark className="w-4 h-4" /> Active Loans ({shgDetails.financials.active_loans_count})
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{shgDetails.financials.active_loans_total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Office Bearers */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Office Bearers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { role: 'President', color: 'bg-pink-100 text-[#C2185B]', data: shgDetails.office_bearers.president },
                      { role: 'Secretary', color: 'bg-purple-100 text-[#6A1B9A]', data: shgDetails.office_bearers.secretary },
                      { role: 'Treasurer', color: 'bg-blue-100 text-[#0288D1]', data: shgDetails.office_bearers.treasurer }
                    ].map((item) => (
                      <div key={item.role} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.color} mb-2 inline-block`}>
                          {item.role}
                        </span>
                        {item.data ? (
                          <>
                            <p className="font-medium text-gray-900 mt-1 truncate">{item.data.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.data.phone || 'No phone recorded'}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1 italic">Not assigned</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Registration Details</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <span className="text-gray-500">Bank Name</span>
                      <p className="font-medium text-gray-900">{shgDetails.shg.bank_name || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Registered Members</span>
                      <p className="font-medium text-gray-900">{shgDetails.total_members}</p>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
