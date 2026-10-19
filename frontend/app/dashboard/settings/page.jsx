'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X, AlertTriangle, Edit } from 'lucide-react';

export default function SettingsPage() {
  const [packages, setPackages] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, packageId: null, packageName: '' });
  const [form, setForm] = useState({ name: '', duration: 1, monthlyPrice: 500, admissionFee: 700, cardioFee: 200 });

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages`);
      const data = await res.json();
      if (Array.isArray(data)) setPackages(data);
      else setPackages([]);
    } catch (err) {
      setPackages([]);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleCreateClick = () => {
    setEditingId(null);
    setForm({ name: '', duration: 1, monthlyPrice: 500, admissionFee: 700, cardioFee: 200 });
    setIsDrawerOpen(true);
  };

  const handleEditClick = (pkg) => {
    setEditingId(pkg.id);
    setForm({ 
      name: pkg.name, 
      duration: pkg.duration, 
      monthlyPrice: pkg.monthlyPrice, 
      admissionFee: pkg.admissionFee, 
      cardioFee: pkg.cardioFee 
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/packages/${editingId}` 
      : `${process.env.NEXT_PUBLIC_API_URL}/api/packages`;
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    setIsDrawerOpen(false);
    fetchPackages();
  };

  const confirmDelete = async () => {
    if (!deleteModal.packageId) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages/${deleteModal.packageId}`, { method: 'DELETE' });
    setDeleteModal({ isOpen: false, packageId: null, packageName: '' });
    fetchPackages();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Membership Packages</h2>
        </div>
        <button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center transition-all shadow-md hover:shadow-lg w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 relative group transition-all duration-300 shadow-sm hover:shadow-md">
            
            <div className="absolute top-4 right-4 flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditClick(pkg)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => setDeleteModal({ isOpen: true, packageId: pkg.id, packageName: pkg.name })} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 pr-16">{pkg.name}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-5">{pkg.duration} Months</p>
            
            <div className="space-y-2.5 text-sm border-t border-slate-100 dark:border-gray-800 pt-4">
              <div className="flex justify-between items-center text-slate-500 dark:text-gray-400">
                <span className="font-medium">Monthly Fee</span> 
                <span className="text-slate-900 dark:text-white font-bold">₹{pkg.monthlyPrice}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-gray-400">
                <span className="font-medium">Admission Fee</span> 
                <span className="text-slate-900 dark:text-white font-bold">₹{pkg.admissionFee}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-gray-400">
                <span className="font-medium">Cardio Add-on</span> 
                <span className="text-slate-900 dark:text-white font-bold">₹{pkg.cardioFee}/mo</span>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p className="text-slate-500 dark:text-gray-400 col-span-full font-medium">No packages created yet. Click &quot;Create Package&quot; to start.</p>}
      </div>

      {/* DRAWER */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60" onClick={() => setIsDrawerOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Package' : 'Create Package'}</h3>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Package Name</label>
              <input className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" placeholder="e.g. 3 Months Premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Duration (Months)</label>
              <input type="number" min="1" className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Monthly Fee (₹)</label>
              <input type="number" min="0" className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Admission Fee (₹)</label>
              <input type="number" min="0" className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" value={form.admissionFee} onChange={(e) => setForm({ ...form, admissionFee: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Cardio Fee per Month (₹)</label>
              <input type="number" min="0" className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" value={form.cardioFee} onChange={(e) => setForm({ ...form, cardioFee: Number(e.target.value) })} required />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg mt-4">
              {editingId ? 'Save Changes' : 'Create Package'}
            </button>
          </form>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Package</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-gray-300 mb-6 font-medium">
              Are you sure you want to delete the <span className="font-bold text-slate-900 dark:text-white">{deleteModal.packageName}</span> package?
            </p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, packageId: null, packageName: '' })} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md hover:shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}