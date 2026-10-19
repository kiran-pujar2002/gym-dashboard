'use client';
import { useEffect, useState, useMemo } from 'react';
import { Users, DollarSign, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OverviewPage() {
  const [members, setMembers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const fetchMembers = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMembers(data);
        else setMembers([]);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setMembers([]);
      });
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleMarkPaid = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/${id}/pay`, { method: 'PUT' });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const d = new Date(m.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [members, selectedMonth, selectedYear]);

  const currentPeriodRevenue = filteredMembers.reduce((sum, m) => sum + m.totalPaid, 0);
  const pendingMembersList = members.filter(m => !m.isPaid);
  const pendingMembersCount = pendingMembersList.length;
  
  const pendingDues = pendingMembersList.reduce((sum, m) => {
    const monthly = m.package?.monthlyPrice || 0;
    const cardio = m.hasCardio ? (m.package?.cardioFee || 0) : 0;
    const duration = m.package?.duration || 1;
    return sum + ((monthly + cardio) * duration);
  }, 0);

  const chartData = useMemo(() => {
    return MONTHS.map((monthName, index) => {
      const monthMembers = members.filter(m => {
        const d = new Date(m.createdAt);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      });
      const revenue = monthMembers.reduce((sum, m) => sum + m.totalPaid, 0);
      return { name: monthName, revenue };
    });
  }, [members, selectedYear]);

  const stats = [
    { title: 'Total Revenue', value: formatINR(currentPeriodRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Pending Dues', value: formatINR(pendingDues), icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'New Members', value: filteredMembers.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Unpaid Members', value: pendingMembersCount.toString(), icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-2">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Overview</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Tracking performance for {MONTHS[selectedMonth]} {selectedYear}</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <select 
            className="w-full sm:w-auto bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 shadow-sm transition-colors"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            className="w-full sm:w-auto bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 shadow-sm transition-colors"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} dark:bg-opacity-10 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Pending Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5 md:p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Dues</h3>
            <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2.5 py-1 rounded-full border border-red-100 dark:border-red-500/20 font-medium">
              {pendingMembersCount} Action Required
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-l-lg">Member</th>
                  <th className="px-4 py-3 font-medium">Amount Due</th>
                  <th className="px-4 py-3 font-medium text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {pendingMembersList.slice(0, 5).map((m) => {
                  const monthly = m.package?.monthlyPrice || 0;
                  const cardio = m.hasCardio ? (m.package?.cardioFee || 0) : 0;
                  const duration = m.package?.duration || 1;
                  const amountDue = (monthly + cardio) * duration;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {m.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{m.name}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">{m.package?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-red-500 dark:text-red-400 font-semibold text-sm">
                        {formatINR(amountDue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleMarkPaid(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-emerald-200 dark:border-emerald-500/20 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pendingMembersList.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500 dark:text-gray-400">
                      All dues are cleared! Great job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 md:p-6 rounded-2xl flex flex-col shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Latest Registrations</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[300px]">
            {members.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                  {m.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 border-b border-slate-100 dark:border-gray-800 pb-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{m.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{m.package?.name || 'No Package'}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-slate-500 text-center mt-4">No members registered yet.</p>}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-5 md:p-6 rounded-2xl shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Trends ({selectedYear})</h3>
        </div>
        <div className="h-72 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-gray-800" vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" className="text-slate-400 dark:text-gray-500" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="currentColor" className="text-slate-400 dark:text-gray-500" tick={{fill: 'currentColor', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                formatter={(value) => [formatINR(value), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}