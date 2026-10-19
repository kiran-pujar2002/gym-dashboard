'use client';
import { useEffect, useState } from 'react';
import { Filter, Trash2, AlertTriangle, X, UserPlus, ChevronLeft, ChevronRight, Edit } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', 
    packageId: '', hasCardio: false, admissionPaid: true 
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null, memberName: '' });

  const fetchMembers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`);
    const data = await res.json();
    if (Array.isArray(data)) setMembers(data);
  };

  const fetchPackages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setPackages(data);
      if (data.length > 0 && !form.packageId) {
        setForm(prev => ({ ...prev, packageId: data[0].id }));
      }
    }
  };

  useEffect(() => { 
    fetchMembers(); 
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Handle Create
  const handleCreateClick = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', packageId: packages[0]?.id || '', hasCardio: false, admissionPaid: true });
    setIsDrawerOpen(true);
  };

  // Handle Edit
  const handleEditClick = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      packageId: member.packageId,
      hasCardio: member.hasCardio,
      admissionPaid: member.admissionPaid
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.packageId) return alert('Please create a package first in Settings.');
    
    const url = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/members/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/members`;
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, packageId: Number(form.packageId) }),
    });
    
    setIsDrawerOpen(false);
    fetchMembers();
  };

  const confirmDelete = async () => {
    if (!deleteModal.memberId) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/${deleteModal.memberId}`, { method: 'DELETE' });
    setDeleteModal({ isOpen: false, memberId: null, memberName: '' });
    fetchMembers();
  };

  const selectedPackage = packages.find(p => p.id === Number(form.packageId));
  const calculateBill = () => {
    if (!selectedPackage) return 0;
    const cardio = form.hasCardio ? selectedPackage.cardioFee : 0;
    const admission = form.admissionPaid ? selectedPackage.admissionFee : 0;
    return ((selectedPackage.monthlyPrice + cardio) * selectedPackage.duration) + admission;
  };

  const filteredMembers = members.filter(m => {
    if (filter === 'paid') return m.isPaid;
    if (filter === 'unpaid') return !m.isPaid;
    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  return (
    <div className="space-y-2 relative h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Members</h2>
        </div>
        <button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center transition-all shadow-md hover:shadow-lg w-full sm:w-auto text-sm">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 flex flex-col flex-1 min-h-0">
        
        {/* Table Header / Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Directory</h3>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 w-full sm:w-auto shadow-sm">
            <Filter className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
            <select className="bg-transparent text-sm outline-none w-full font-medium text-slate-700 dark:text-gray-300" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Members</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 dark:text-gray-400 text-xs sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Member</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Contact</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Package</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Cardio</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Next Due</th>
                <th className="px-4 py-3 font-semibold border-b border-slate-100 dark:border-gray-800">Status</th>
                <th className="px-4 py-3 font-semibold text-right border-b border-slate-100 dark:border-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {currentItems.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm flex-shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-white text-sm truncate">{m.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-gray-300 font-medium truncate">{m.email}</span>
                      <span className="text-slate-400 dark:text-gray-500">{m.phone || 'No phone'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 px-2 py-1 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-gray-700">
                      {m.package?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {m.hasCardio ? (
                      <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md text-[11px] font-semibold border border-purple-100 dark:border-purple-500/20">Active</span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-600 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-gray-400 text-xs font-medium">{new Date(m.nextDueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${m.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.isPaid ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {m.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(m)} className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Member">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, memberId: m.id, memberName: m.name })} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Member">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500 text-sm font-medium">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredMembers.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
            <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-slate-800 dark:text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800 dark:text-white">{Math.min(indexOfLastItem, filteredMembers.length)}</span> of <span className="font-bold text-slate-800 dark:text-white">{filteredMembers.length}</span> members
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white border border-blue-600 shadow-sm' 
                      : 'border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER (Handles both Create and Edit) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-[2px]" onClick={() => setIsDrawerOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-gray-800 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Member' : 'Register Member'}</h3>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Full Name</label>
              <input className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
              <input className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" placeholder="john@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" placeholder="Optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="border-t border-slate-100 dark:border-gray-800 pt-4 mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">Select Package</label>
              <select 
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                value={form.packageId}
                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                required
              >
                <option value="" disabled>Select a package...</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.duration} Months)</option>
                ))}
              </select>
              {packages.length === 0 && <p className="text-xs text-red-500 mt-1 font-medium">No packages found. Please create one in Settings.</p>}
            </div>

            <div className="space-y-2 bg-slate-50 dark:bg-gray-800/30 p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm mt-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">First Time Admission</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">₹{selectedPackage?.admissionFee || 0}</span>
                  <input type="checkbox" checked={form.admissionPaid} onChange={(e) => setForm({ ...form, admissionPaid: e.target.checked })} className="w-4 h-4 rounded bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
                </div>
              </label>
              <div className="h-px bg-slate-200 dark:bg-gray-800 w-full"></div>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Cardio Add-on</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">+₹{selectedPackage?.cardioFee || 0}/mo</span>
                  <input type="checkbox" checked={form.hasCardio} onChange={(e) => setForm({ ...form, hasCardio: e.target.checked })} className="w-4 h-4 rounded bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
                </div>
              </label>
            </div>
          </form>

          <div className="p-4 border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">Total Amount</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{calculateBill()}</span>
            </div>
            <button onClick={handleSubmit} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg">
              {editingId ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/50 backdrop-blur-[2px] transition-opacity">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Member</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-5 font-medium">Are you sure you want to permanently delete <span className="font-bold text-slate-900 dark:text-white">{deleteModal.memberName}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal({ isOpen: false, memberId: null, memberName: '' })} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md">Delete Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}