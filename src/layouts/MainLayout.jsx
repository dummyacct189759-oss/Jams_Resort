import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '@/components/shared/Sidebar';
import { Bell, Search, User, Clock, AlertTriangle, CheckCircle, Info, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResort } from '@/context/ResortContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import logo from '../../images/Logo.jpg';

const MainLayout = () => {
  const location = useLocation();
  const { user, maintenanceRequests, villas, isMobile } = useResort();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notifications = [
    ...(maintenanceRequests || [])
      .filter(req => req.status === 'Pending')
      .map(req => {
        const villa = villas.find(v => v.id === req.villa_id);
        return {
          id: `maint-${req.id}`,
          title: 'Maintenance Request',
          description: `${villa?.name || 'Unknown Villa'}: ${req.issue}`,
          time: req.created_at,
          type: 'maintenance',
          priority: req.priority,
          link: '/housekeeping'
        };
      }),
    ...(villas || [])
      .filter(v => v.status === 'Cleaning')
      .map(v => ({
        id: `clean-${v.id}`,
        title: 'Cleaning Required',
        description: `${v.name} is now vacant and needs cleaning.`,
        time: new Date().toISOString(),
        type: 'cleaning',
        link: '/housekeeping'
      }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            {!isMobile && (
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full w-96 border dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent border-none outline-none w-full text-sm dark:text-slate-200"
                />
              </div>
            )}
            {isMobile && (
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold text-primary dark:text-emerald-500 truncate">JAMS</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-slate-400 hover:text-primary transition-colors outline-none">
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 text-[8px] font-bold text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden border dark:border-slate-800 dark:bg-slate-900 shadow-2xl">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Notifications</h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{notifications.length} New</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="p-4 border-b last:border-0 dark:border-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer">
                        <Link to={notif.link} className="flex gap-4 w-full">
                          <div className={`p-2 rounded-xl h-fit ${
                            notif.type === 'maintenance' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {notif.type === 'maintenance' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <Link to="/housekeeping" className="block p-3 text-center text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    View All Tasks
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-3 border-l dark:border-slate-800 pl-4 md:pl-6">
              {!isMobile && (
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.role || 'User'}</p>
                </div>
              )}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with Transitions */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
