import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Home,
  Users,
  Utensils,
  Brush,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Hotel,
  Package,
  CalendarDays,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResort } from '@/context/ResortContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Reservations', path: '/reservations', icon: CalendarDays },
  { name: 'Expenses', path: '/expenses', icon: Wallet },
  { name: 'Villa Management', path: '/villas', icon: Home },
  { name: 'Guest Management', path: '/guests', icon: Users },
  { name: 'Services', path: '/services', icon: Utensils },
  { name: 'Housekeeping', path: '/housekeeping', icon: Brush },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Activity Logs', path: '/logs', icon: ShieldAlert },
  { name: 'User Management', path: '/users', icon: UserCog },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user, isMobile } = useResort();

  const filteredNavItems = navItems.filter(item => {
    if (user?.role === 'Cashier') {
      const restricted = ['Expenses', 'Services', 'Reports', 'User Management', 'Settings', 'Activity Logs'];
      return !restricted.includes(item.name);
    }
    return true;
  });

  const sidebarContent = (
    <div className={cn(
      "bg-white dark:bg-slate-900 h-screen flex flex-col border-r dark:border-slate-800 shadow-sm transition-colors duration-300",
      isMobile ? "w-72" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Hotel className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight dark:text-emerald-500">JAMS RESORT</span>
        </div>
        {isMobile && (
           <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <LogOut className="w-5 h-5 rotate-180" />
           </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && onClose()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-emerald-400"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t dark:border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
        )}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0">
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
