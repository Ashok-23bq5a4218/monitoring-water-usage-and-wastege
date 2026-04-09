import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map, PlusCircle, ShieldAlert, Globe, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function Layout() {
  const { userProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { to: '/home', icon: Home, label: t('home') },
    { to: '/map', icon: Map, label: t('map') },
    { to: '/report', icon: PlusCircle, label: t('report') },
  ];

  if (userProfile?.role === 'admin') {
    navItems.push({ to: '/admin', icon: ShieldAlert, label: t('admin') });
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Global App Bar (Header) */}
      <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-2 rounded-xl text-white shadow-sm flex-shrink-0">
            <Droplets size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-600 leading-tight tracking-tight capitalize">
              monitoring water usage & wastage
            </h1>
            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Smart Water Monitoring for Villages
            </span>
          </div>
        </div>
        
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm flex-shrink-0 ml-2"
        >
          <Globe size={16} className="text-blue-600" />
          <span className="hidden sm:inline">{language === 'en' ? 'తెలుగు' : 'English'}</span>
          <span className="sm:hidden">{language === 'en' ? 'తె' : 'EN'}</span>
        </button>
      </header>

      {/* Main Content Area - Added pt-20 to account for the fixed header */}
      <main className="flex-1 overflow-y-auto pt-20 pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
