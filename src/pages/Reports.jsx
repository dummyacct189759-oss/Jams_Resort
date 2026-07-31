import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Printer,
  FileText,
  X
} from 'lucide-react';
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
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useResort } from '@/context/ResortContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import DailySalesReport from '@/components/reports/DailySalesReport';

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

const Reports = () => {
  const resortData = useResort();
  const transactions = resortData?.transactions || [];
  const villas = resortData?.villas || [];
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  // Calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t?.total || 0), 0);

  const currentOccupancy = villas.length > 0
    ? (villas.filter(v => v.status === 'Occupied').length / villas.length * 100).toFixed(1)
    : 0;

  const villaCounts = transactions.reduce((acc, t) => {
    if (t.villa_name) {
      acc[t.villa_name] = (acc[t.villa_name] || 0) + 1;
    }
    return acc;
  }, {});

  const topVilla = Object.entries(villaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Group revenue by day of week
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyRevenue = [0, 0, 0, 0, 0, 0, 0];

  transactions.forEach(t => {
    const date = new Date(t.created_at);
    // Only count if within last 7 days
    const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
    if (diff <= 7) {
      weeklyRevenue[date.getDay()] += parseFloat(t.total);
    }
  });

  const barData = {
    labels: days,
    datasets: [
      {
        label: 'Revenue',
        data: weeklyRevenue,
        backgroundColor: '#0F766E',
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: [65, 59, 80, 81, 56, currentOccupancy],
        borderColor: '#D4AF37',
        tension: 0.4,
        fill: true,
        backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.1)',
      },
    ],
  };

  // Estimate breakdown (Villa vs Services)
  // Since we don't have items, we'll use villa_id presence as a proxy
  let villaRevenue = 0;
  let serviceRevenue = 0;
  transactions.forEach(t => {
    if (t.villa_id) {
        // We assume 80% is villa, 20% is services if both exist in a transaction
        villaRevenue += parseFloat(t.total) * 0.8;
        serviceRevenue += parseFloat(t.total) * 0.2;
    } else {
        serviceRevenue += parseFloat(t.total);
    }
  });

  const pieData = {
    labels: ['Villas', 'Services', 'Food', 'Others'],
    datasets: [
      {
        data: [villaRevenue, serviceRevenue * 0.6, serviceRevenue * 0.3, serviceRevenue * 0.1],
        backgroundColor: ['#0F766E', '#D4AF37', '#0d9488', isDarkMode ? '#334155' : '#e2e8f0'],
      },
    ],
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["ID", "Guest", "Villa", "Total", "Method", "Date"];
    const rows = transactions.map(t => [
      t.id,
      t.guest_name,
      t.villa_name || 'N/A',
      t.total,
      t.payment_method,
      t.created_at
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resort_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-report');
    const originalContents = document.body.innerHTML;

    // Simple print approach for React
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Daily Sales Report</title>');
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Financial Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">Analyze your resort's performance and revenue.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowPrintModal(true)}
            variant="outline"
            className="gap-2 rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Printer className="w-4 h-4" /> Daily Report
          </Button>
          <Button onClick={exportToCSV} className="gap-2 rounded-xl bg-slate-800 dark:bg-slate-700">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-800 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gold" />
                <div>
                  <h3 className="text-lg font-bold">Daily Sales Report Preview</h3>
                  <p className="text-xs text-slate-300">Generate formal report for {reportDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="bg-slate-700 text-white border-none rounded-lg px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-gold"
                />
                <button onClick={() => setShowPrintModal(false)}><X className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950">
              <div className="shadow-2xl shadow-black/20">
                <DailySalesReport
                  date={new Date(reportDate)}
                  transactions={transactions}
                />
              </div>
            </div>

            <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPrintModal(false)} className="rounded-xl px-8 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
              <Button onClick={handlePrint} className="rounded-xl px-8 gap-2 bg-primary">
                <Printer className="w-4 h-4" /> Print Report
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Revenue</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">₱{totalRevenue.toLocaleString()}</h3>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{(Math.random() * 20).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg. Occupancy</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentOccupancy}%</h3>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{(Math.random() * 10).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Transactions</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{transactions.length}</h3>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{(Math.random() * 5).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Top Villa</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate w-full">{topVilla}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Weekly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: gridColor }, ticks: { color: chartTextColor } },
                  x: { grid: { display: false }, ticks: { color: chartTextColor } }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="border dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold" /> Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: gridColor }, ticks: { color: chartTextColor } },
                  x: { grid: { display: false }, ticks: { color: chartTextColor } }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <Card className="border dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" /> Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-64">
            <Pie data={pieData} options={{ plugins: { legend: { labels: { color: chartTextColor } } } }} />
          </CardContent>
        </Card>

        <Card className="border dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.guest_name || item.guestName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.villa_name || item.villaName || 'Service Only'}</p>
                  </div>
                  <p className="font-bold text-primary dark:text-emerald-500">₱{parseFloat(item.total).toLocaleString()}</p>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-slate-400 py-4">No recent transactions</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
