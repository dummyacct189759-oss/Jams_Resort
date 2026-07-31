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

const Sidebar = () => {
  const { logout, user } = useResort();

  const filteredNavItems = navItems.filter(item => {
    if (user?.role === 'Cashier') {
      const restricted = ['Expenses', 'Services', 'Reports', 'User Management', 'Settings', 'Activity Logs'];
      return !restricted.includes(item.name);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 h-screen flex flex-col border-r dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Hotel className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-primary tracking-tight dark:text-emerald-500">JAMS RESORT</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
    </aside>
  );
};

export default Sidebar;
