import React from 'react';
import { motion } from 'framer-motion';
import {
  Brush,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MoreHorizontal
} from 'lucide-react';
import { useResort } from '@/context/ResortContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Housekeeping = () => {
  const resortData = useResort();
  const villas = resortData?.villas || [];
  const updateVillaStatus = resortData?.updateVillaStatus;
  const maintenanceRequests = resortData?.maintenanceRequests || [];

  const cleaningVillas = villas.filter(v => v.status === 'Cleaning' || v.status === 'Occupied');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Housekeeping & Maintenance</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor and manage villa cleanliness and repairs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cleaning Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Brush className="w-5 h-5" /> Cleaning Queue
            </h3>
            <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-400">{villas.filter(v => v.status === 'Cleaning').length} Villas Pending</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {villas.filter(v => v.status === 'Cleaning' || v.status === 'Occupied').map((villa) => (
              <Card key={villa.id} className={cn("border-l-4 dark:bg-slate-900 dark:border-slate-800", villa.status === 'Cleaning' ? "border-l-blue-500" : "border-l-slate-200 dark:border-l-slate-700")}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{villa.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Status: {villa.status}</p>
                    </div>
                    <Badge variant={villa.status === 'Cleaning' ? "info" : "outline"}>
                      {villa.status === 'Cleaning' ? "Cleaning" : "Occupied"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Assigned: {villa.status === 'Cleaning' ? "Rose" : "Unassigned"}</span>
                    </div>
                    {villa.status === 'Cleaning' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-[10px] font-bold uppercase tracking-wider"
                        onClick={() => updateVillaStatus(villa.id, 'Available')}
                      >
                        Complete
                      </Button>
                    )}
                    {villa.status === 'Occupied' && (
                       <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] font-bold uppercase tracking-wider dark:border-slate-700 dark:text-slate-300"
                        onClick={() => updateVillaStatus(villa.id, 'Cleaning')}
                      >
                        Schedule
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Maintenance & Logs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Maintenance Requests
            </h3>
          </div>

          <Card className="border-none shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-6 space-y-4">
              {maintenanceRequests.map(req => (
                <div key={req.id} className={cn("p-3 rounded-xl border", req.priority === 'Urgent' ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700")}>
                  <div className="flex justify-between items-start">
                    <p className={cn("font-bold text-sm", req.priority === 'Urgent' ? "text-red-800 dark:text-red-400" : "text-slate-800 dark:text-slate-200")}>
                      Villa {villas.find(v => v.id === req.villa_id)?.name.split(' ').pop()} - {req.issue}
                    </p>
                    <Badge variant={req.priority === 'Urgent' ? "destructive" : "outline"} className="text-[10px]">{req.priority}</Badge>
                  </div>
                  <p className={cn("text-xs mt-1", req.priority === 'Urgent' ? "text-red-600 dark:text-red-500" : "text-slate-500 dark:text-slate-400")}>Reported by: {req.reported_by} at {new Date(req.created_at).toLocaleTimeString()}</p>
                  <Button variant="outline" className={cn("w-full mt-3 h-8 text-xs", req.priority === 'Urgent' ? "bg-white text-red-600 border-red-200 hover:bg-red-50 dark:bg-slate-900 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20" : "dark:border-slate-700 dark:text-slate-300")}>
                    {req.status === 'Pending' ? 'Start Fix' : 'Done'}
                  </Button>
                </div>
              ))}
              {maintenanceRequests.length === 0 && <p className="text-center text-slate-400 py-4">No active requests</p>}
            </CardContent>
          </Card>

          <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-4">
            <Clock className="w-5 h-5" /> Recent Logs
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">Villa 05 Cleaned</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">by Maria • 10:45 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Housekeeping;
