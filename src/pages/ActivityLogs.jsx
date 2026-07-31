import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, User, Activity, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResort } from '@/context/ResortContext';
import { format } from 'date-fns';

const ActivityLogs = () => {
  const { logs, loading } = useResort();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    const a = action.toLowerCase();
    if (a.includes('delete')) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (a.includes('add') || a.includes('new')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (a.includes('update')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (a.includes('login')) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> Security & Activity Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor system changes and user actions for accountability.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading logs...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No activity logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      key={log.id}
                      className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          {log.user_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis text-slate-600 dark:text-slate-400">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                        {log.ip_address}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
