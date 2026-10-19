'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Dumbbell, Sun, Moon, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
    setMounted(true);
  }, [router]);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/dashboard/members', icon: Users },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar (Desktop & Mobile) - REMOVED z-50 */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 z-50' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <Dumbbell className="w-8 h-8 text-blue-600 dark:text-blue-500 mr-3" />
            <span className="text-xl font-bold tracking-tight">GymOS</span>
          </div>
          <button onClick={closeMobileMenu} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => { router.push(item.href); closeMobileMenu(); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar - REMOVED z-30 */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 transition-colors duration-300">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            {/* <h2 className="text-xl font-semibold hidden md:block">Dashboard</h2> */}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

            <button 
              onClick={handleSignOut} 
              className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" /> 
              <span className="hidden md:block">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-2 lg:p-2">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}