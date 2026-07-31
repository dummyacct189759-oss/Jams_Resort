import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  Calendar,
  Plus,
  Minus,
  Trash2,
  Printer,
  Save,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Info,
  Mic2,
  Home
} from 'lucide-react';
import { useResort } from '@/context/ResortContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const POS = () => {
  const resortData = useResort();
  const [searchParams] = useSearchParams();
  const villas = resortData?.villas || [];
  const services = resortData?.services || [];
  const guests = resortData?.guests || [];
  const transactions = resortData?.transactions || [];
  const settings = resortData?.settings;
  const addTransaction = resortData?.addTransaction;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isPartial, setIsPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    contact: '',
    adults: 1,
    children: 0
  });

  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  useEffect(() => {
    const guestId = searchParams.get('guestId');
    if (guestId && guests.length > 0) {
      const guest = guests.find(g => g.id == guestId);
      if (guest) {
        setSelectedGuest(guest);
        setGuestInfo(prev => ({ ...prev, name: guest.name, contact: guest.contact }));
      }
    }
  }, [searchParams, guests]);

  const filteredVillas = useMemo(() => {
    return villas.filter(villa => {
      const name = villa?.name || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || villa.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, filterStatus, villas]);

  const handleSelectVilla = (villa, flexiPrice = null) => {
    if (villa.status !== 'Available') {
      toast.error(`Villa ${villa.name} is currently ${villa.status}`);
      return;
    }

    if (flexiPrice) {
        setSelectedVilla({ ...villa, price: flexiPrice });
        toast.success(`${villa.name} (Flexi) selected`);
    } else {
        setSelectedVilla(villa);
        toast.success(`${villa.name} selected`);
    }
  };

  const handleSelectGuest = (guestId) => {
    if (guestId === 'new') {
        setSelectedGuest(null);
        setGuestInfo({ name: '', contact: '', adults: 1, children: 0 });
        return;
    }
    const guest = guests.find(g => g.id == guestId);
    if (guest) {
        setSelectedGuest(guest);
        setGuestInfo({ ...guestInfo, name: guest.name, contact: guest.contact });
    }
  };

  const addService = (service) => {
    const existing = billItems.find(item => item.id === service.id);
    if (existing) {
      setBillItems(billItems.map(item =>
        item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setBillItems([...billItems, { ...service, quantity: 1 }]);
    }
    toast.success(`${service.name} added to bill`);
  };

  const updateQuantity = (id, delta) => {
    setBillItems(billItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const calculateSubtotal = () => {
    const villaPrice = selectedVilla ? parseFloat(selectedVilla.price) * nights : 0;
    const servicesTotal = billItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    return villaPrice + servicesTotal;
  };

  const subtotal = calculateSubtotal();
  const total = subtotal;

  const handleSaveBill = (isReservation = false) => {
    if (!guestInfo.name) {
      toast.error("Please enter guest name");
      return;
    }
    if (total <= 0 && !isReservation) {
      toast.error("Cannot save a bill with zero total");
      return;
    }
    if (!selectedVilla && billItems.length === 0) {
      toast.error("Bill is empty");
      return;
    }

    const transaction = {
      guest_id: selectedGuest?.id,
      guestName: guestInfo.name,
      guestContact: guestInfo.contact,
      villa_id: selectedVilla?.id,
      villaName: selectedVilla?.name,
      checkIn,
      checkOut,
      nights,
      items: billItems,
      subtotal,
      tax: 0,
      total,
      amount_paid: isPartial ? parseFloat(partialAmount) : total,
      balance: isPartial ? (total - parseFloat(partialAmount)) : 0,
      paymentMethod,
      status: isReservation ? 'Reserved' : 'Completed'
    };

    if (addTransaction) {
      addTransaction(transaction);
      toast.success(isReservation ? 'Reservation saved' : 'Transaction saved');
    }

    // Reset state
    setSelectedVilla(null);
    setSelectedGuest(null);
    setBillItems([]);
    setCheckIn(new Date().toISOString().split('T')[0]);
    setCheckOut(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setIsPartial(false);
    setPartialAmount('');
    setGuestInfo({ name: '', contact: '', adults: 1, children: 0 });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 overflow-hidden">
      {/* Left Panel: Villa Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search villa name or number..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Available', 'Occupied', 'Cleaning', 'Reserved'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                className="rounded-full px-6 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-6">
          <AnimatePresence mode='wait'>
            {filteredVillas.map((villa) => (
              <motion.div
                key={villa.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <Card
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-300 border-2 dark:bg-slate-900 flex flex-col h-full",
                    selectedVilla?.id === villa.id ? "border-primary ring-2 ring-primary/20" : "border-transparent dark:border-slate-800 shadow-sm"
                  )}
                  onClick={() => villa.is_flexi != 1 && handleSelectVilla(villa)}
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {villa.image ? (
                      <img src={villa.image} alt={villa.name} className="w-full h-full object-cover" />
                    ) : (
                      <Home className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          villa.status === 'Available' ? 'success' :
                          villa.status === 'Occupied' ? 'destructive' :
                          villa.status === 'Cleaning' ? 'info' : 'warning'
                        }
                        className="px-3 py-1 shadow-md border-none"
                      >
                        {villa.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        {villa.category === 'KTV Special Room' && (
                            <Badge variant="warning" className="text-[9px] h-4 font-black px-1.5 border-none">KTV SPECIAL</Badge>
                        )}
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-1">
                            {villa.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-black text-lg text-primary dark:text-emerald-500 leading-none">₱{parseFloat(villa.price).toLocaleString()}</p>
                        {villa.is_flexi == 1 && <Badge variant="secondary" className="text-[8px] h-3.5 px-1 mt-1 border-none font-bold uppercase tracking-tighter">Flexi Pax</Badge>}
                      </div>
                    </div>

                    {/* Guest Name if Occupied */}
                    {(villa.status === 'Occupied' || villa.status === 'Reserved') && (
                      <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed dark:border-slate-700 animate-in fade-in duration-300">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Guest</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate px-1">
                          {transactions.find(t => t.villa_id == villa.id && (t.status === 'Completed' || t.status === 'Reserved'))?.guest_name || 'Loading...'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 px-0.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {villa.capacity}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Info className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </div>

                    {/* Selection Area / Flexi Buttons */}
                    <div className="mt-auto space-y-4">
                      {villa.is_flexi == 1 && villa.status === 'Available' ? (
                          <div className="space-y-2 pt-4 border-t dark:border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Pricing Option</p>
                              <div className="flex gap-2">
                                  {(villa.pax_prices ? JSON.parse(villa.pax_prices) : []).map((opt, i) => (
                                      <button
                                          key={i}
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleSelectVilla(villa, opt.price);
                                          }}
                                          className={cn(
                                              "flex-1 py-2.5 px-1 rounded-xl text-[11px] font-black transition-all border-2",
                                              selectedVilla?.id === villa.id && selectedVilla?.price === opt.price
                                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50"
                                          )}
                                      >
                                          <div className="flex flex-col items-center">
                                              <span className="opacity-70 uppercase text-[8px] mb-0.5 tracking-tighter">{opt.pax} Pax</span>
                                              <span>₱{parseFloat(opt.price).toLocaleString()}</span>
                                          </div>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ) : villa.category === 'KTV Special Room' && villa.is_flexi != 1 && villa.status === 'Available' ? (
                        <Button
                            className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] gap-2 shadow-lg shadow-orange-500/20 border-none uppercase tracking-tight"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectVilla(villa);
                            }}
                        >
                            <Mic2 className="w-4 h-4" />
                            Select KTV Room
                        </Button>
                      ) : null}

                      {/* Amenities Tags - Shown at bottom */}
                      <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[48px]">
                        {(typeof villa.amenities === 'string' ? villa.amenities.split(',') : (villa.amenities || [])).map(amenity => (
                          <span key={amenity} className="text-[9px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-bold border dark:border-slate-700 whitespace-nowrap">
                            {typeof amenity === 'string' ? amenity.trim() : amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Active Bill */}
      <div className="w-[450px] flex flex-col gap-6 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-xl overflow-hidden p-6 transition-colors">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Active Bill</h2>
          <Button variant="ghost" size="icon" onClick={() => {
            setSelectedVilla(null);
            setBillItems([]);
          }}>
            <Trash2 className="w-5 h-5 text-red-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Guest Form */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Guest Information</h4>
                <select
                    className="text-[10px] border dark:border-slate-700 rounded-lg p-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 outline-none font-bold"
                    onChange={(e) => handleSelectGuest(e.target.value)}
                    value={selectedGuest?.id || 'new'}
                >
                    <option value="new">+ New Guest</option>
                    {guests.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  placeholder="Juan Dela Cruz"
                  value={guestInfo.name}
                  onChange={e => setGuestInfo({...guestInfo, name: e.target.value})}
                  disabled={!!selectedGuest}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contact</label>
                <input
                  type="text"
                  className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl text-sm outline-none font-medium"
                  placeholder="0912..."
                  value={guestInfo.contact}
                  onChange={e => setGuestInfo({...guestInfo, contact: e.target.value})}
                />
              </div>
              <div className="col-span-1">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stay</label>
                  <span className="text-[9px] font-black text-primary uppercase">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-0.5">
                  <input
                    type="date"
                    className="w-full px-1 py-1 bg-transparent text-[10px] font-bold dark:text-slate-200 outline-none"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full px-1 py-1 bg-transparent text-[10px] font-bold dark:text-slate-200 outline-none border-l dark:border-slate-700"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Villa Item */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stay Details</h4>
            {selectedVilla ? (
              <div className="p-4 bg-primary/5 dark:bg-emerald-500/5 rounded-2xl border border-primary/20 dark:border-emerald-500/20 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{selectedVilla.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Villa Rental (₱{parseFloat(selectedVilla.price).toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'})
                  </p>
                </div>
                <p className="font-bold text-primary dark:text-emerald-500">₱{(parseFloat(selectedVilla.price) * nights).toLocaleString()}</p>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400">
                <Home className="w-5 h-5 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-wider italic">No villa selected</p>
              </div>
            )}
          </div>

          {/* Additional Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Additional Services</h4>
            <div className="grid grid-cols-4 gap-2">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => addService(service)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary dark:hover:border-emerald-500 hover:bg-primary/5 dark:hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-center font-medium text-slate-600 dark:text-slate-400 truncate w-full group-hover:text-primary dark:group-hover:text-emerald-400">{service.name}</span>
                </button>
              ))}
            </div>

            {/* Service Bill Items */}
            <div className="space-y-3 mt-4">
              {billItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">₱{item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all dark:text-slate-300"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold min-w-[20px] text-center dark:text-slate-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all dark:text-slate-300"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 w-20 text-right">₱{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
          <div className="space-y-3 border-t dark:border-slate-800 pt-6">
            {/* Partial Payment Toggle */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="partialPay"
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={isPartial}
                    onChange={(e) => setIsPartial(e.target.checked)}
                  />
                  <label htmlFor="partialPay" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Partial Payment</label>
                </div>
                {isPartial && (
                  <span className="text-[10px] font-bold text-orange-500 uppercase">Balance: ₱{(total - (parseFloat(partialAmount) || 0)).toLocaleString()}</span>
                )}
              </div>

              {isPartial && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₱</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter amount to pay..."
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pt-2">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Grand Total</span>
            <span className="text-2xl font-black text-primary dark:text-emerald-500">₱{total.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button className="h-12 rounded-xl gap-2 text-lg font-bold" onClick={() => handleSaveBill(false)}>
              <Save className="w-5 h-5" />
              Save Bill
            </Button>
            <Button
                variant="outline"
                className="h-12 rounded-xl gap-2 border-primary dark:border-emerald-500/50 text-primary dark:text-emerald-500 hover:bg-primary/5 dark:hover:bg-emerald-500/5 font-bold"
                onClick={() => handleSaveBill(true)}
            >
              <Calendar className="w-5 h-5" />
              Reserve
            </Button>
          </div>

          <div className="flex justify-center gap-6 pt-4 border-t border-dashed dark:border-slate-800">
            <button
              onClick={() => setPaymentMethod('Cash')}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                paymentMethod === 'Cash' ? "text-primary dark:text-emerald-500 scale-110" : "opacity-50 hover:opacity-100 dark:text-slate-400"
              )}
            >
              <Banknote className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('GCash')}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                paymentMethod === 'GCash' ? "text-primary dark:text-emerald-500 scale-110" : "opacity-50 hover:opacity-100 dark:text-slate-400"
              )}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">GCash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('Card')}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                paymentMethod === 'Card' ? "text-primary dark:text-emerald-500 scale-110" : "opacity-50 hover:opacity-100 dark:text-slate-400"
              )}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
