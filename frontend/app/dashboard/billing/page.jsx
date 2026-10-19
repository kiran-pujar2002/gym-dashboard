'use client';
import { useEffect, useState } from 'react';
import { Search, CreditCard, CheckCircle2, History, IndianRupee } from 'lucide-react';

export default function BillingPage() {
  const [unpaidMembers, setUnpaidMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  
  // Payment Modal state
  const [payModal, setPayModal] = useState({ isOpen: false, member: null, amount: 0, notes: '' });

  const fetchData = async () => {
    const [membersRes, paymentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing`)
    ]);
    
    const membersData = await membersRes.json();
    const paymentsData = await paymentsRes.json();

    if (Array.isArray(membersData)) {
      setUnpaidMembers(membersData.filter(m => !m.isPaid));
    }
    if (Array.isArray(paymentsData)) {
      setPayments(paymentsData);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenPayModal = (member) => {
    const monthly = member.package?.monthlyPrice || 0;
    const cardio = member.hasCardio ? (member.package?.cardioFee || 0) : 0;
    const duration = member.package?.duration || 1;
    const amountDue = (monthly + cardio) * duration;

    setPayModal({ 
      isOpen: true, 
      member, 
      amount: amountDue, 
      notes: `${member.package?.name} Renewal` 
    });
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: payModal.member.id,
        amount: payModal.amount,
        notes: payModal.notes
      })
    });
    setPayModal({ isOpen: false, member: null, amount: 0, notes: '' });
    fetchData(); // Refresh lists instantly
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredUnpaid = unpaidMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Collections</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-0">
        
        {/* Left Column: Pending Members */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-500" /> Pending Collections
            </h3>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 shadow-sm transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredUnpaid.map(m => {
              const monthly = m.package?.monthlyPrice || 0;
              const cardio = m.hasCardio ? (m.package?.cardioFee || 0) : 0;
              const amountDue = (monthly + cardio) * (m.package?.duration || 1);

              return (
                <div key={m.id} className="bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl p-4 flex justify-between items-center group hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{m.package?.name} • {m.package?.duration} Mo</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Due Amount</p>
                      <p className="font-bold text-red-500 dark:text-red-400 text-sm">{formatINR(amountDue)}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleOpenPayModal(m)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm transition-all hover:scale-105"
                      title="Collect Payment"
                    >
                      <IndianRupee className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredUnpaid.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400 opacity-50" />
                <p className="font-medium">No pending collections!</p>
                <p className="text-xs mt-1">All members are up to date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payment History */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <History className="w-5 h-5 mr-2 text-emerald-500" /> Recent Transactions
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {payments.map(p => (
              <div key={p.id} className="border-b border-slate-100 dark:border-gray-800 py-3 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/30 rounded-lg px-2 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{p.member?.name}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-gray-400 mt-0.5">{p.notes}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatINR(p.amount)}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(p.date).toLocaleDateString()} at {new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <History className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {payModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] transition-opacity">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100">
            
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-full">
                <IndianRupee className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Collect Payment</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Recording fee for <span className="font-bold text-slate-800 dark:text-white">{payModal.member?.name}</span></p>
              </div>
            </div>
            
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Amount Received (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm text-lg font-bold" 
                  value={payModal.amount} 
                  onChange={(e) => setPayModal({ ...payModal, amount: Number(e.target.value) })} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Notes / Payment Method</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm text-sm" 
                  value={payModal.notes} 
                  onChange={(e) => setPayModal({ ...payModal, notes: e.target.value })} 
                  placeholder="e.g. Paid in cash, UPI, etc."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                <button type="button" onClick={() => setPayModal({ isOpen: false, member: null, amount: 0, notes: '' })} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirm Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}