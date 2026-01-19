
import React from 'react';
import { User, UserRole } from '../types';
import { Language, translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab, language, setLanguage }) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.overview, icon: '🏠' },
    { id: 'marketplace', label: t.marketplace, icon: '🛒' },
    { id: 'orders', label: t.myOrders, icon: '📦' },
    { id: 'demand-section', label: t.demandSection, icon: '📡' }, // Shared tab for planning
  ];

  if (user.role === UserRole.FARMER) {
    navItems.splice(3, 0, { id: 'my-listings', label: t.cropListings, icon: '🌾' });
    navItems.splice(4, 0, { id: 'bids', label: t.wholesaleBids, icon: '⚖️' });
  } else {
    // Buyer specialized section (Bid Room is strictly for buyers)
    navItems.splice(3, 0, { id: 'bid-room', label: t.bidRoom, icon: '🏢' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
            <span className="bg-emerald-600 text-white p-1 rounded">AS</span> {t.appName}
          </h1>
          <div className="hidden md:flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-600 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
          </select>

          <div className="relative group flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{user.role.replace('_', ' ')}</p>
              <p className="text-xs font-bold text-slate-700">{user.name}</p>
            </div>
            <img src={user.avatar} className="w-9 h-9 rounded-full border border-slate-200 shadow-sm cursor-pointer" alt="Profile" />
            {user.role === UserRole.FARMER && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-black text-white px-1.5 rounded-full border-2 border-white">
                {user.honorScore}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
