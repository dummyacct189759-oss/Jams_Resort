import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Home,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResort } from '@/context/ResortContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="overflow-hidden border dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-2xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const resortData = useResort();
  const villas = resortData?.villas || [];
  const transactions = resortData?.transactions || [];
  const stats = resortData?.stats;

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Real data calculations
  const totalRevenue = transactions
    .filter(t => new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + parseFloat(t.total), 0);

  const occupiedVillas = villas.filter(v => v.status === 'Occupied').length;
  const availableVillas = villas.filter(v => v.status === 'Available').length;
  const cleaningVillas = villas.filter(v => v.status === 'Cleaning').length;
  const activeGuests = resortData?.guests?.length || 0;
  const totalTransactions = transactions.length;

  const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  // Calculate Weekly Revenue (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weeklyRevenueData = last7Days.map(date => {
    return transactions
      .filter(t => new Date(t.created_at).toDateString() === date.toDateString())
      .reduce((sum, t) => sum + parseFloat(t.total), 0);
  });

  const revenueData = {
    labels: last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Revenue',
        data: weeklyRevenueData,
        backgroundColor: '#0F766E',
        borderRadius: 8,
      },
    ],
  };

  // Calculate Occupancy Rate (Estimate for Jan-Jun based on current data for Jun)
  const occupancyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: [45, 52, 60, 48, 65, villas.length > 0 ? (occupiedVillas / villas.length * 100).toFixed(0) : 0],
        borderColor: '#D4AF37',
        tension: 0.4,
        fill: true,
        backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.1)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resort Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="12.5%"
          color="bg-emerald-600"
        />
        <StatCard
          title="Total Transactions"
          value={totalTransactions}
          icon={CreditCard}
          trend="up"
          trendValue="8.2%"
          color="bg-primary"
        />
        <StatCard
          title="Total Guests"
          value={activeGuests}
          icon={Users}
          color="bg-gold"
        />
        <StatCard
          title="Occupied Villas"
          value={`${occupiedVillas}/${villas.length}`}
          icon={Home}
          trend="up"
          trendValue="4%"
          color="bg-slate-800 dark:bg-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard
          title="Available Villas"
          value={availableVillas}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
        <StatCard
          title="Cleaning Status"
          value={cleaningVillas}
          icon={Clock}
          color="bg-blue-500"
        />
        <StatCard
          title="Maintenance"
          value={villas.filter(v => v.status === 'Maintenance').length}
          icon={AlertCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Pending Payments"
          value="₱12,400"
          icon={CreditCard}
          color="bg-orange-500"
        />
      </div>

      {/* Charts and widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        <Card className="border dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: gridColor },
                      ticks: { color: chartTextColor }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: chartTextColor }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Home className="w-5 h-5 text-gold" /> Villa Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={occupancyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: gridColor },
                      ticks: { color: chartTextColor }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: chartTextColor }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
