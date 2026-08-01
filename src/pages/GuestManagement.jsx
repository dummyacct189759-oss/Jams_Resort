import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  History,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Package
} from 'lucide-react';
import { useResort } from '@/context/ResortContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';

const GuestManagement = () => {
  const { guests, addGuest, updateGuest, deleteGuest, transactions } = useResort();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Guests');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });
  const [editingGuest, setEditingGuest] = useState(null);
  const [historyGuest, setHistoryGuest] = useState(null);
  const [expandedTx, setExpandedTx] = useState(null);

  const guestHistory = historyGuest
    ? (transactions || []).filter(t => t.guest_id === historyGuest.id || t.guestName === historyGuest.name)
    : [];

  const filteredGuests = (guests || []).filter(guest => {
    if (!guest) return false;
    const name = guest.name || '';
    const contact = guest.contact || '';
    const email = guest.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.includes(searchTerm) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Guests' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!newGuest.name || !newGuest.contact) {
      toast.error("Name and contact are required");
      return;
    }
    await addGuest(newGuest);
    setShowAddModal(false);
    setNewGuest({ name: '', contact: '', email: '', address: '' });
  };

  const handleEditGuest = async (e) => {
    e.preventDefault();
    if (!editingGuest.name || !editingGuest.contact) {
      toast.error("Name and contact are required");
      return;
    }
    await updateGuest(editingGuest);
    setShowEditModal(false);
    setEditingGuest(null);
  };

  const openEditModal = (guest) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 relative pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Guest Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Manage guest records and history.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 rounded-xl h-12 px-6 w-full md:w-auto">
          <UserPlus className="w-5 h-5" />
          Add New Guest
        </Button>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <h3 className="text-lg font-bold">Register New Guest</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddGuest} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newGuest.name}
                  onChange={e => setNewGuest({...newGuest, name: e.target.value})}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contact Number</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newGuest.contact}
                  onChange={e => setNewGuest({...newGuest, contact: e.target.value})}
                  placeholder="09123456789"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newGuest.email}
                  onChange={e => setNewGuest({...newGuest, email: e.target.value})}
                  placeholder="juan.dc@email.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Address</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newGuest.address}
                  onChange={e => setNewGuest({...newGuest, address: e.target.value})}
                  placeholder="Quezon City, Metro Manila"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl h-12 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12">Add Guest</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">Guest History</h3>
                  <p className="text-xs text-white/70">{historyGuest.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {guestHistory.length > 0 ? (
                <div className="space-y-4">
                  {guestHistory.map((t) => (
                    <div key={t.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden">
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setExpandedTx(expandedTx === t.id ? null : t.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{t.villa_name || t.villaName || 'Service only'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                              {new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-primary dark:text-emerald-500">₱{parseFloat(t.total).toLocaleString()}</p>
                            <Badge variant="outline" className="text-[9px] h-4">{t.payment_method || t.paymentMethod}</Badge>
                          </div>
                          {expandedTx === t.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {expandedTx === t.id && (
                        <div className="px-4 pb-4 pt-2 border-t dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
                          {/* Stay Details */}
                          {(t.check_in || t.checkIn) && (
                            <div className="grid grid-cols-3 gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Check-in</p>
                                <p className="text-xs font-bold dark:text-slate-200">{t.check_in || t.checkIn}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Check-out</p>
                                <p className="text-xs font-bold dark:text-slate-200">{t.check_out || t.checkOut}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Duration</p>
                                <p className="text-xs font-bold text-primary dark:text-emerald-500">{t.nights || 1} {parseInt(t.nights) === 1 ? 'Night' : 'Nights'}</p>
                              </div>
                            </div>
                          )}

                          {/* Items Breakdown */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase px-1 flex items-center gap-1">
                              <Package className="w-3 h-3" /> Included Items & Services
                            </p>
                            <div className="space-y-1">
                              {t.items && t.items.length > 0 ? (
                                t.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-xs py-1 border-b border-dashed dark:border-slate-700 last:border-0 px-1">
                                    <span className="text-slate-600 dark:text-slate-400">{item.service_name || item.name} <span className="text-[10px] opacity-60">x{item.quantity}</span></span>
                                    <span className="font-medium dark:text-slate-200">₱{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-400 italic px-1">No additional services recorded</p>
                              )}
                            </div>
                          </div>

                          {/* Total Summary */}
                          <div className="pt-2 border-t dark:border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Subtotal</span>
                              <span className="dark:text-slate-300">₱{parseFloat(t.subtotal || t.total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-500">Tax/Fees</span>
                              <span className="dark:text-slate-300">₱{parseFloat(t.tax || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-primary/5 dark:bg-emerald-500/5 rounded-lg border border-primary/10 dark:border-emerald-500/10">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Grand Total</span>
                              <span className="text-sm font-black text-primary dark:text-emerald-500">₱{parseFloat(t.total).toLocaleString()}</span>
                            </div>

                            {parseFloat(t.balance) > 0 && (
                              <div className="flex justify-between items-center p-2 mt-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Remaining Balance</span>
                                <span className="text-sm font-black text-orange-600 dark:text-orange-400">₱{parseFloat(t.balance).toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <CreditCard className="w-3 h-3" />
                            <span>Paid via {t.payment_method || t.paymentMethod}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No transaction history found for this guest.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-slate-800 text-right">
              <Button onClick={() => setShowHistoryModal(false)} className="rounded-xl px-8">Close</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {showEditModal && editingGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <h3 className="text-lg font-bold">Edit Guest Profile</h3>
              <button onClick={() => setShowEditModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleEditGuest} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingGuest.name}
                  onChange={e => setEditingGuest({...editingGuest, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Contact Number</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingGuest.contact}
                  onChange={e => setEditingGuest({...editingGuest, contact: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingGuest.email || ''}
                  onChange={e => setEditingGuest({...editingGuest, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Address</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingGuest.address || ''}
                  onChange={e => setEditingGuest({...editingGuest, address: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 rounded-xl h-12 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12">Update Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyGuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">Guest History</h3>
                  <p className="text-xs text-white/70">{historyGuest.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {guestHistory.length > 0 ? (
                <div className="space-y-4">
                  {guestHistory.map((t) => (
                    <div key={t.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 overflow-hidden">
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setExpandedTx(expandedTx === t.id ? null : t.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{t.villa_name || t.villaName || 'Service only'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                              {new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-primary dark:text-emerald-500">₱{parseFloat(t.total).toLocaleString()}</p>
                            <Badge variant="outline" className="text-[9px] h-4">{t.payment_method || t.paymentMethod}</Badge>
                          </div>
                          {expandedTx === t.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {expandedTx === t.id && (
                        <div className="px-4 pb-4 pt-2 border-t dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
                          {/* Stay Details */}
                          {(t.check_in || t.checkIn) && (
                            <div className="grid grid-cols-3 gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Check-in</p>
                                <p className="text-xs font-bold dark:text-slate-200">{t.check_in || t.checkIn}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Check-out</p>
                                <p className="text-xs font-bold dark:text-slate-200">{t.check_out || t.checkOut}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Duration</p>
                                <p className="text-xs font-bold text-primary dark:text-emerald-500">{t.nights || 1} {parseInt(t.nights) === 1 ? 'Night' : 'Nights'}</p>
                              </div>
                            </div>
                          )}

                          {/* Items Breakdown */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase px-1 flex items-center gap-1">
                              <Package className="w-3 h-3" /> Included Items & Services
                            </p>
                            <div className="space-y-1">
                              {t.items && t.items.length > 0 ? (
                                t.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-xs py-1 border-b border-dashed dark:border-slate-700 last:border-0 px-1">
                                    <span className="text-slate-600 dark:text-slate-400">{item.service_name || item.name} <span className="text-[10px] opacity-60">x{item.quantity}</span></span>
                                    <span className="font-medium dark:text-slate-200">₱{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-400 italic px-1">No additional services recorded</p>
                              )}
                            </div>
                          </div>

                          {/* Total Summary */}
                          <div className="pt-2 border-t dark:border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Subtotal</span>
                              <span className="dark:text-slate-300">₱{parseFloat(t.subtotal || t.total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-500">Tax/Fees</span>
                              <span className="dark:text-slate-300">₱{parseFloat(t.tax || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-primary/5 dark:bg-emerald-500/5 rounded-lg border border-primary/10 dark:border-emerald-500/10">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Grand Total</span>
                              <span className="text-sm font-black text-primary dark:text-emerald-500">₱{parseFloat(t.total).toLocaleString()}</span>
                            </div>

                            {parseFloat(t.balance) > 0 && (
                              <div className="flex justify-between items-center p-2 mt-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Remaining Balance</span>
                                <span className="text-sm font-black text-orange-600 dark:text-orange-400">₱{parseFloat(t.balance).toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <CreditCard className="w-3 h-3" />
                            <span>Paid via {t.payment_method || t.paymentMethod}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No transaction history found for this guest.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-slate-800 text-right">
              <Button onClick={() => setShowHistoryModal(false)} className="rounded-xl px-8">Close</Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <select
              className="flex-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Guests</option>
              <option>VIP</option>
              <option>Regular</option>
              <option>New</option>
            </select>
            <Button variant="outline" className="rounded-xl dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 hidden sm:flex">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredGuests.map((guest) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-500 font-bold text-xl">
                      {(guest?.name || '?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{guest?.name || 'Unknown Guest'}</h3>
                        <Badge
                          variant={
                            guest?.status === 'VIP' ? 'gold' :
                            guest?.status === 'Regular' ? 'info' : 'outline'
                          }
                        >
                          {guest?.status || 'New'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {guest?.contact || 'No contact'}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {guest?.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="dark:text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                      <DropdownMenuItem
                        className="gap-2 dark:text-slate-200"
                        onClick={() => openEditModal(guest)}
                      >
                        <Edit className="w-4 h-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 dark:text-slate-200"
                        onClick={() => {
                          setHistoryGuest(guest);
                          setShowHistoryModal(true);
                        }}
                      >
                        <History className="w-4 h-4" /> View History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 dark:text-slate-200"
                        onClick={() => navigate(`/pos?guestId=${guest.id}`)}
                      >
                        <ExternalLink className="w-4 h-4" /> New Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-red-600 dark:text-red-400"
                        onClick={() => deleteGuest(guest.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dashed dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Visit</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{guest?.lastVisit || 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Visits</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{guest?.totalVisits || 0} times</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Spent</p>
                    <p className="text-sm font-bold text-primary dark:text-emerald-500 mt-1">₱{parseFloat(guest?.totalSpent || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {guest?.address || 'No address provided'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GuestManagement;
