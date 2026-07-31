import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Edit3,
  TrendingDown,
  Filter,
  Calendar,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResort } from '@/context/ResortContext';
import { format } from 'date-fns';

const Expenses = () => {
  const { expenses, addExpense, deleteExpense, canAccess } = useResort();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Supplies',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Utilities', 'Payroll', 'Supplies', 'Maintenance', 'Marketing', 'Food & Beverage', 'Others'];

  const filteredExpenses = expenses.filter(exp =>
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(formData);
    setShowAddModal(false);
    setFormData({
      category: 'Supplies',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Receipt className="w-8 h-8 text-red-500" />
            </div>
            Expense Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track and categorize your resort operational costs.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-2 bg-red-500/10 rounded-full">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100">₱{totalExpenses.toLocaleString()}</p>
                </div>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20">
                <Plus className="w-5 h-5" /> Add Expense
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Quick Filter
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search description..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSearchTerm(cat)} className="px-3 py-1.5 rounded-lg border dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-all">
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-3">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                                {filteredExpenses.map((exp, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={exp.id}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                <Calendar className="w-3.5 h-3.5 opacity-40" />
                                                {format(new Date(exp.expense_date), 'MMM dd, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px] italic">
                                                {exp.description || 'No description'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-base font-black text-red-500 tracking-tight">
                                                ₱{parseFloat(exp.amount).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {canAccess('Administrator') && (
                                                    <button
                                                        onClick={() => deleteExpense(exp.id)}
                                                        className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Record New Expense</h3>
                        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Enter transaction details</p>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all">
                          <Plus className="w-6 h-6 rotate-45" />
                      </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
                              <select
                                className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-sm"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                              >
                                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>
                          <div className="col-span-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (₱)</label>
                              <input
                                type="number"
                                required
                                className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-black text-sm text-red-500"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                              <input
                                type="date"
                                required
                                className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-bold text-sm"
                                value={formData.expense_date}
                                onChange={e => setFormData({...formData, expense_date: e.target.value})}
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                              <textarea
                                className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none font-medium text-sm min-h-[100px]"
                                placeholder="What was this for?"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                              />
                          </div>
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                          Confirm Record
                      </Button>
                  </form>
              </motion.div>
          </div>
      )}
    </div>
  );
};

export default Expenses;
