import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Home,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useResort } from '@/context/ResortContext';
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  startOfDay,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';

const Reservations = () => {
  const { villas, transactions, updateTransactionStatus } = useResort();
  const [viewDate, setViewDate] = useState(new Date());
  const [daysToShow] = useState(14); // Show 2 weeks at a time

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: viewDate,
      end: addDays(viewDate, daysToShow - 1)
    });
  }, [viewDate, daysToShow]);

  const getReservationForVillaAndDay = (villaId, day) => {
    return transactions.find(t => {
      if (t.villa_id !== villaId || t.status === 'Cancelled') return false;
      const start = startOfDay(parseISO(t.check_in));
      const end = startOfDay(parseISO(t.check_out));
      return isWithinInterval(startOfDay(day), { start, end });
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reserved': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400';
      case 'Checked-In': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'Completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
            Reservation Timeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Visual overview of villa availability and guest stays.</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setViewDate(subDays(viewDate, 7))}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="px-6 py-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setViewDate(addDays(viewDate, 7))}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[1400px]">
              {/* Timeline Header */}
              <div className="flex border-b dark:border-slate-800 sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="w-80 p-6 font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 border-r dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <Home className="w-4 h-4" /> Villa Details
                </div>
                <div className="flex-1 flex">
                  {days.map((day, i) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 py-4 px-2 text-center border-r last:border-0 dark:border-slate-800 transition-colors",
                          isToday && "bg-primary/[0.03] dark:bg-primary/[0.07]"
                        )}
                      >
                        <div className={cn(
                          "text-[10px] uppercase font-black tracking-tighter mb-1",
                          isToday ? "text-primary" : "text-slate-400"
                        )}>
                          {format(day, 'EEE')}
                        </div>
                        <div className={cn(
                          "inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black transition-all",
                          isToday
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                            : "text-slate-600 dark:text-slate-300"
                        )}>
                          {format(day, 'dd')}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                          {format(day, 'MMM')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Rows */}
              <div className="divide-y dark:divide-slate-800">
                {villas.map(villa => (
                  <div key={villa.id} className="flex group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-300">
                    <div className="w-80 p-6 border-r dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10 flex flex-col justify-center relative">
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center rounded-r-full" />
                      <span className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight group-hover:text-primary transition-colors">
                        {villa.name}
                      </span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Users className="w-3 h-3" /> {villa.capacity}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] font-bold text-primary dark:text-emerald-500 uppercase tracking-wider">
                          ₱{parseFloat(villa.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex relative h-24">
                      {days.map((day, i) => {
                        const reservation = getReservationForVillaAndDay(villa.id, day);
                        const isStart = reservation && isSameDay(day, parseISO(reservation.check_in));
                        const isToday = isSameDay(day, new Date());

                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex-1 border-r last:border-0 dark:border-slate-800 relative group/cell transition-colors",
                              isToday && "bg-primary/[0.02] dark:bg-primary/[0.05]"
                            )}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 bg-slate-50 dark:bg-slate-800/30 transition-opacity pointer-events-none" />

                            {isStart && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                whileHover={{ y: -2, scale: 1.01 }}
                                style={{
                                  width: `calc(${reservation.nights * 100}% - 12px)`,
                                  zIndex: 10
                                }}
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 left-1.5 p-3 rounded-2xl border-2 shadow-xl backdrop-blur-sm transition-all duration-300 cursor-pointer",
                                  getStatusColor(reservation.status)
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className={cn(
                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                        reservation.status === 'Reserved' ? "bg-amber-500" :
                                        reservation.status === 'Checked-In' ? "bg-emerald-500" : "bg-blue-500"
                                      )} />
                                      <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-80">
                                        {reservation.status}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-black truncate tracking-tight uppercase">
                                      {reservation.guest_name}
                                    </div>
                                    <div className="text-[9px] font-bold opacity-60 mt-0.5">
                                      {reservation.nights} {reservation.nights === 1 ? 'Night' : 'Nights'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 bg-white/20 dark:bg-black/20 p-1 rounded-xl border border-white/20 dark:border-black/20">
                                    {reservation.status === 'Reserved' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateTransactionStatus(reservation.id, 'Checked-In');
                                        }}
                                        className="p-1.5 hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all active:scale-90"
                                        title="Check In Guest"
                                      >
                                        <Clock className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {reservation.status === 'Checked-In' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateTransactionStatus(reservation.id, 'Completed');
                                        }}
                                        className="p-1.5 hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all active:scale-90"
                                        title="Check Out Guest"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button className="p-1.5 hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all active:scale-90">
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend & Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-lg bg-amber-500 shadow-lg shadow-amber-500/30" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Reserved</span>
              <span className="text-[10px] font-bold text-slate-400">Future Booking</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/30" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Checked-In</span>
              <span className="text-[10px] font-bold text-slate-400">Currently In-House</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Completed</span>
              <span className="text-[10px] font-bold text-slate-400">Checked-Out</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Total Villas: {villas.length} • Active Bookings: {transactions.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
