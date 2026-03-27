'use client';

import { useState, useEffect } from 'react';
import { getClients, saveClient, getCounters, updateCounter } from '@/lib/store';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [counters, setCounters] = useState({ closed_deals: 0, proposals_sent: 0 });
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: '', revenue: '', deadline: '' });

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  async function refresh() {
    setClients(await getClients());
    setCounters(await getCounters());
  }

  async function handleAddProject(e) {
    if (e) e.preventDefault();
    if (!form.name || !form.deadline) return;
    
    await saveClient({
      name: form.name,
      revenue: parseFloat(form.revenue) || 0,
      deadline: form.deadline,
      description: 'Strategic Initiative'
    });

    setForm({ name: '', revenue: '', deadline: '' });
    await refresh();
  }

  async function adjustCounter(key, delta) {
    await updateCounter(key, delta);
    await refresh();
  }

  if (!mounted) return <div className="min-h-screen" />;

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      {/* Top Section: Manual Entry & Counters */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* Manual Project Entry Form */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(42,75,217,0.04)] border" style={{ borderColor: 'rgba(169,174,177,0.1)' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">Manual Project Entry</h2>
              <p className="text-sm" style={{ color: '#575c60' }}>Add new client data and project specifics manually</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #2a4bd9 0%, #879aff 100%)' }}>
              <span className="material-symbols-outlined">add_task</span>
            </div>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleAddProject}>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest px-1" style={{ color: '#575c60' }} htmlFor="client-name">Client Name</label>
              <input 
                id="client-name" 
                placeholder="e.g. Vortex Systems" 
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-[#ecf1f6] border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2a4bd9]/20 transition-all font-medium text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest px-1" style={{ color: '#575c60' }} htmlFor="revenue">Revenue Value</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#575c60' }}>$</span>
                <input 
                  id="revenue" 
                  placeholder="0.00" 
                  type="number" 
                  min="0"
                  step="0.01"
                  required
                  value={form.revenue}
                  onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))}
                  className="w-full bg-[#ecf1f6] border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#2a4bd9]/20 transition-all font-medium text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest px-1" style={{ color: '#575c60' }} htmlFor="deadline">Deadline Date</label>
              <input 
                id="deadline" 
                type="date"
                required
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="bg-[#ecf1f6] border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#2a4bd9]/20 transition-all font-medium text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <button 
                type="submit" 
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer hover:shadow-[#2a4bd9]/20"
                style={{ background: 'linear-gradient(135deg, #2a4bd9 0%, #879aff 100%)' }}
              >
                <span className="material-symbols-outlined">save</span>
                Save Project Entry
              </button>
            </div>
          </form>
        </div>

        {/* Manual Closed Deals Counters */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(42,75,217,0.04)] border flex-1" style={{ borderColor: 'rgba(169,174,177,0.1)' }}>
            <h3 className="text-lg font-extrabold font-['Plus_Jakarta_Sans'] mb-6 tracking-tight">Manual Counters</h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: '#ecf1f6' }}>
                <div>
                  <p className="text-[10px] font-extrabold uppercase" style={{ color: '#575c60' }}>Closed Deals</p>
                  <span className="text-3xl font-black" style={{ color: '#2a4bd9' }}>{counters.closed_deals || 0}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => adjustCounter('closedDeals', -1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-colors active:scale-90 cursor-pointer hover:bg-[#2a4bd9]/5" style={{ color: '#575c60' }}>
                    <span className="material-symbols-outlined hover:text-[#2a4bd9]">remove</span>
                  </button>
                  <button onClick={() => adjustCounter('closedDeals', 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-colors active:scale-90 cursor-pointer hover:bg-[#2a4bd9]/5" style={{ color: '#575c60' }}>
                    <span className="material-symbols-outlined hover:text-[#2a4bd9]">add</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: 'rgba(255,196,182,0.3)' }}>
                <div>
                  <p className="text-[10px] font-extrabold uppercase" style={{ color: '#af2700' }}>Proposals Sent</p>
                  <span className="text-3xl font-black" style={{ color: '#af2700' }}>{counters.proposals_sent || 0}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => adjustCounter('proposalsSent', -1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-colors active:scale-90 cursor-pointer hover:bg-[#af2700]/5" style={{ color: '#575c60' }}>
                    <span className="material-symbols-outlined hover:text-[#af2700]">remove</span>
                  </button>
                  <button onClick={() => adjustCounter('proposalsSent', 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-colors active:scale-90 cursor-pointer hover:bg-[#af2700]/5" style={{ color: '#575c60' }}>
                    <span className="material-symbols-outlined hover:text-[#af2700]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Timeline Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(42,75,217,0.04)] border" style={{ borderColor: 'rgba(169,174,177,0.1)' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">Priority Timeline</h2>
            <p className="text-sm" style={{ color: '#575c60' }}>Projects sorted by closest manual deadlines</p>
          </div>
          <div className="flex p-1 rounded-xl" style={{ backgroundColor: '#ecf1f6' }}>
            <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold cursor-pointer" style={{ color: '#2a4bd9' }}>Closest First</button>
            <button className="px-4 py-2 text-xs font-bold cursor-pointer hover:bg-white/50 rounded-lg transition-colors" style={{ color: '#575c60' }}>View All</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <span className="material-symbols-outlined text-4xl mb-3" style={{ color: '#a9aeb1' }}>inbox</span>
              <p className="font-medium" style={{ color: '#575c60' }}>No active projects recorded. Add one above.</p>
            </div>
          ) : clients.sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).map((c, i) => {
            const urgencyStyles = [
              { label: 'URGENT', tagBg: '#2a4bd9', iconColor: '#2a4bd9', borderClass: 'border-2 border-[#2a4bd9]/20 hover:border-[#2a4bd9]', icon: 'warning', urgencyText: 'Deadline: Today' },
              { label: 'MEDIUM', tagBg: '#af2700', iconColor: '#af2700', borderClass: 'border-2 border-transparent hover:border-[#af2700]/20 hover:shadow-xl', hoverBg: 'hover:bg-white', icon: 'schedule', urgencyText: 'Upcoming' },
              { label: 'LOW', tagBg: '#006575', iconColor: '#006575', borderClass: 'border-2 border-transparent hover:border-[#006575]/20 hover:shadow-xl', hoverBg: 'hover:bg-white', icon: 'event', urgencyText: 'Later' }
            ];

            const styleMap = urgencyStyles[Math.min(i, urgencyStyles.length - 1)];
            const d = new Date(c.deadline);
            const formattedDeadline = new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('en', { month: 'short', day: 'numeric' });

            return (
              <div key={c.id} className={`group relative p-6 rounded-3xl transition-all duration-300 ${styleMap.borderClass} ${styleMap.hoverBg || ''}`} style={{ backgroundColor: '#ecf1f6' }}>
                {i === 0 && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 text-white text-[10px] font-bold rounded-full shadow-lg" style={{ backgroundColor: styleMap.tagBg }}>
                    {styleMap.label}
                  </div>
                )}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: styleMap.iconColor }}>{styleMap.urgencyText || `Deadline: ${formattedDeadline}`}</p>
                    <span className="material-symbols-outlined" style={{ color: styleMap.iconColor }}>{styleMap.icon}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-1" style={{ color: '#2a2f32' }}>{c.name}</h4>
                  <p className="text-xs mb-6 truncate" style={{ color: '#575c60' }}>{c.description || 'Deliverable timeline tracking'}</p>
                  <div className="mt-auto pt-6 flex justify-between items-center" style={{ borderTop: '1px solid rgba(169,174,177,0.1)' }}>
                    <span className="text-lg font-black" style={{ color: '#2a2f32' }}>{formatCurrency(c.revenue)}</span>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer" style={{ color: '#2a4bd9' }}>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer shadow-lg" style={{ background: 'linear-gradient(135deg, #2a4bd9 0%, #879aff 100%)', boxShadow: '0 10px 30px rgba(42,75,217,0.3)' }}>
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
