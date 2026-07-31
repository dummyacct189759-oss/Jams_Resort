import React from 'react';
import { useResort } from '@/context/ResortContext';
import { format } from 'date-fns';

const DailySalesReport = ({ date = new Date(), transactions = [] }) => {
  const { settings } = useResort();

  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.created_at);
    return tDate.toDateString() === date.toDateString();
  });

  const totalSales = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total), 0);
  const cashSales = filteredTransactions.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + parseFloat(t.total), 0);
  const gcashSales = filteredTransactions.filter(t => t.payment_method === 'GCash').reduce((sum, t) => sum + parseFloat(t.total), 0);
  const cardSales = filteredTransactions.filter(t => t.payment_method === 'Card').reduce((sum, t) => sum + parseFloat(t.total), 0);

  return (
    <div className="bg-white p-8 text-black font-serif max-w-4xl mx-auto print:m-0 print:p-4" id="printable-report">
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-3xl font-bold uppercase">{settings?.resort_name}</h1>
        <p className="text-sm">{settings?.address}</p>
        <p className="text-sm">Contact: {settings?.contact_number}</p>
        <h2 className="text-xl font-bold mt-4 underline uppercase tracking-widest">Daily Sales Report</h2>
        <p className="text-md mt-1">Date: {format(date, 'MMMM dd, yyyy')}</p>
      </div>

      <div className="mb-8">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 text-left">Ref #</th>
              <th className="border border-black p-2 text-left">Guest Name</th>
              <th className="border border-black p-2 text-left">Villa / Service</th>
              <th className="border border-black p-2 text-left">Method</th>
              <th className="border border-black p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td className="border border-black p-2">#{String(t.id).padStart(5, '0')}</td>
                <td className="border border-black p-2 font-bold">{t.guest_name}</td>
                <td className="border border-black p-2">{t.villa_name || 'Service Only'}</td>
                <td className="border border-black p-2 text-center text-xs">{t.payment_method}</td>
                <td className="border border-black p-2 text-right font-mono">₱{parseFloat(t.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="border border-black p-8 text-center text-slate-400 italic">No transactions recorded for this date.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-50">
              <td colSpan="4" className="border border-black p-2 text-right uppercase">Total Daily Sales</td>
              <td className="border border-black p-2 text-right font-mono text-lg">₱{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="font-bold border-b border-black mb-2 uppercase text-xs tracking-wider">Payment Breakdown</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Cash Payments:</span>
              <span className="font-mono">₱{cashSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>GCash Payments:</span>
              <span className="font-mono">₱{gcashSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-black pb-1">
              <span>Card Payments:</span>
              <span className="font-mono">₱{cardSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold pt-1">
              <span>Total:</span>
              <span className="font-mono text-md">₱{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end items-end text-sm">
          <div className="text-center w-48">
            <div className="border-b border-black mb-1 h-8"></div>
            <p className="font-bold uppercase text-[10px]">Reported By (Signature Over Printed Name)</p>
            <p className="text-[10px] text-slate-500">Date Generated: {format(new Date(), 'PPpp')}</p>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-center text-slate-400 border-t border-slate-200 pt-4">
        This is a computer-generated report. JAMS Luxury Resort & Spa Management System.
      </div>
    </div>
  );
};

export default DailySalesReport;
