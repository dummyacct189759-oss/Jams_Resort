import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  EyeOff,
  Wrench,
  Brush,
  CheckCircle2,
  Users,
  X,
  Calendar,
  Home,
  Upload,
  Image as ImageIcon,
  Minus
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

const VillaManagement = () => {
  const resortData = useResort();
  const villas = resortData?.villas || [];
  const transactions = resortData?.transactions || [];
  const updateVillaStatus = resortData?.updateVillaStatus;
  const deleteVilla = resortData?.deleteVilla;
  const updateVilla = resortData?.updateVilla;
  const addVilla = resortData?.addVilla;
  const refreshData = resortData?.refreshData;

  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [showModal, setShowModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    capacity: '',
    category: 'Standard Villa',
    amenities: '',
    status: 'Available',
    is_flexi: false,
    pax_prices: [{ pax: '', price: '' }],
    image: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredVillas = villas.filter(villa => {
    const name = villa?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || villa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (villaId, newStatus) => {
    if (updateVillaStatus) {
        await updateVillaStatus(villaId, newStatus);
        if (refreshData) refreshData(); // Force global refresh for dashboard etc
    }
  };

  const openAddModal = () => {
    setEditingVilla(null);
    setFormData({
      name: '',
      price: '',
      capacity: '',
      category: 'Standard Villa',
      amenities: '',
      status: 'Available',
      is_flexi: false,
      pax_prices: [{ pax: '', price: '' }],
      image: ''
    });
    setShowModal(true);
  };

  const openEditModal = (villa) => {
    setEditingVilla(villa);
    setFormData({
      name: villa.name,
      price: villa.price,
      capacity: villa.capacity,
      category: villa.category || 'Standard Villa',
      amenities: villa.amenities,
      status: villa.status,
      is_flexi: villa.is_flexi == 1,
      pax_prices: villa.pax_prices ? JSON.parse(villa.pax_prices) : [{ pax: '', price: '' }],
      image: villa.image
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Logic to handle empty main price when Flexi Pax is enabled
    const finalData = { ...formData };
    if (formData.is_flexi && !formData.price) {
        // Use the first pax price as the base price if empty
        finalData.price = formData.pax_prices[0]?.price || 0;
    }

    if (editingVilla) {
      await updateVilla({ ...finalData, id: editingVilla.id });
    } else {
      await addVilla(finalData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 relative pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Villa Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Configure and monitor all resort villas.</p>
        </div>
        <Button onClick={openAddModal} className="gap-2 rounded-xl h-12 px-6 shadow-lg shadow-primary/20 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          Add New Villa
        </Button>
      </div>

      {/* Villa Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <h3 className="text-lg font-bold">{editingVilla ? 'Edit Villa Details' : 'Add New Villa'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto text-slate-900 dark:text-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Villa Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
                        <div className="w-full sm:w-24 h-40 sm:h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Home className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">No Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-xs text-slate-500 mb-2">Upload a high-quality photo of the villa.</p>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                                <Upload className="w-4 h-4" />
                                {formData.image ? 'Change Photo' : 'Select Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Villa Name</label>
                  <input
                    type="text" required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Royal Suite 01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Price (₱) {formData.is_flexi && <span className="text-[10px] lowercase font-normal opacity-50">(Optional)</span>}
                  </label>
                  <input
                    type="number"
                    required={!formData.is_flexi}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Capacity</label>
                  <input
                    type="text" required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                    placeholder="e.g. 4-6 Persons"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Villa Category</label>
                    <select
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="Standard Villa">Standard Villa</option>
                        <option value="KTV Special Room">KTV Special Room</option>
                        <option value="Executive Suite">Executive Suite</option>
                    </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.amenities}
                    onChange={e => setFormData({...formData, amenities: e.target.value})}
                    placeholder="WiFi, Private Pool, Kitchen"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Villa Status</label>
                    <select
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Reserved">Reserved</option>
                    </select>
                </div>

                {/* Flexi Pax Feature */}
                <div className="md:col-span-2 pt-4 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox" id="is_flexi"
                                className="w-4 h-4 rounded border-slate-300 text-primary"
                                checked={formData.is_flexi}
                                onChange={e => setFormData({...formData, is_flexi: e.target.checked})}
                            />
                            <label htmlFor="is_flexi" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Enable Flexi Pax Pricing</label>
                        </div>
                        <Badge variant="secondary">Flexi Pax</Badge>
                    </div>

                    {formData.is_flexi && (
                        <div className="space-y-3">
                            {formData.pax_prices.map((item, index) => (
                                <div key={index} className="flex gap-2 items-end animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Pax Count</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm"
                                            placeholder="e.g. 2"
                                            value={item.pax}
                                            onChange={e => {
                                                const newPrices = [...formData.pax_prices];
                                                newPrices[index].pax = e.target.value;
                                                setFormData({...formData, pax_prices: newPrices});
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Rate (₱)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm font-bold"
                                            placeholder="e.g. 2500"
                                            value={item.price}
                                            onChange={e => {
                                                const newPrices = [...formData.pax_prices];
                                                newPrices[index].price = e.target.value;
                                                setFormData({...formData, pax_prices: newPrices});
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        className="h-9 w-9 text-red-500"
                                        onClick={() => {
                                            const newPrices = formData.pax_prices.filter((_, i) => i !== index);
                                            setFormData({...formData, pax_prices: newPrices.length ? newPrices : [{pax:'', price:''}]});
                                        }}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button" variant="outline" size="sm"
                                className="w-full mt-2 border-dashed dark:border-slate-700"
                                onClick={() => setFormData({...formData, pax_prices: [...formData.pax_prices, {pax:'', price:''}]})}
                            >
                                + Add Pax Option
                            </Button>
                        </div>
                    )}
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl h-12 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12">{editingVilla ? 'Save Changes' : 'Create Villa'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm transition-colors gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search villas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
              className="rounded-lg dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
              className="rounded-lg dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="flex-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Cleaning</option>
            <option>Maintenance</option>
          </select>
          <select className="flex-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none">
            <option>Sort by Price: Low to High</option>
            <option>Sort by Price: High to Low</option>
            <option>Sort by Capacity</option>
          </select>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVillas.map((villa) => (
            <motion.div
              key={villa.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden group dark:bg-slate-900 dark:border-slate-800">
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {villa.image ? (
                    <img src={villa.image} alt={villa.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Home className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="secondary"
                        className="flex-1 h-11 rounded-2xl gap-2 text-sm font-bold bg-gold hover:bg-gold/90 text-white border-none shadow-lg"
                        onClick={() => openEditModal(villa)}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-11 w-11 rounded-2xl p-0 flex items-center justify-center shadow-lg"
                        onClick={() => deleteVilla(villa.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        villa.status === 'Available' ? 'success' :
                        villa.status === 'Occupied' ? 'destructive' :
                        villa.status === 'Cleaning' ? 'info' : 'secondary'
                      }
                      className="shadow-lg"
                    >
                      {villa.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{villa.name}</h3>
                        {villa.is_flexi == 1 && <Badge variant="secondary" className="text-[8px] h-4">Flexi</Badge>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 dark:text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl dark:bg-slate-900 dark:border-slate-800">
                        <DropdownMenuItem className="gap-2 dark:text-slate-200" onClick={() => openEditModal(villa)}><Edit className="w-4 h-4" /> Edit Villa</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-blue-600 dark:text-blue-400" onClick={() => handleStatusChange(villa.id, 'Cleaning')}><Brush className="w-4 h-4" /> Mark for Cleaning</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-emerald-600 dark:text-emerald-400" onClick={() => handleStatusChange(villa.id, 'Available')}><CheckCircle2 className="w-4 h-4" /> Mark Available</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-yellow-600 dark:text-yellow-400" onClick={() => handleStatusChange(villa.id, 'Reserved')}><Calendar className="w-4 h-4" /> Mark as Reserved</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-orange-600 dark:text-orange-400" onClick={() => handleStatusChange(villa.id, 'Maintenance')}><Wrench className="w-4 h-4" /> Maintenance</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-slate-400" onClick={() => handleStatusChange(villa.id, 'Maintenance')}><EyeOff className="w-4 h-4" /> Disable Villa</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400" onClick={() => deleteVilla(villa.id)}><Trash2 className="w-4 h-4" /> Delete Villa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xl font-black text-primary dark:text-emerald-500 mb-3">₱{villa.price.toLocaleString()}</p>

                  {/* Show Guest Name if Reserved/Occupied */}
                  {(villa.status === 'Occupied' || villa.status === 'Reserved') && (
                    <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed dark:border-slate-700">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Guest</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                        {transactions.find(t => t.villa_id == villa.id && (t.status === 'Completed' || t.status === 'Reserved'))?.guest_name || 'Loading...'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pb-4 border-b dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {villa.capacity}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-1.5">
                    {(typeof villa.amenities === 'string' ? villa.amenities.split(',') : (villa.amenities || [])).map(a => (
                      <span key={a} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border dark:border-slate-700">
                        {typeof a === 'string' ? a.trim() : a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Villa Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Capacity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredVillas.map(villa => (
                  <tr key={villa.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {villa.image ? (
                            <img src={villa.image} className="w-full h-full object-cover" />
                          ) : (
                            <Home className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{villa.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {typeof villa.amenities === 'string'
                              ? villa.amenities.split(',').slice(0, 2).join(', ')
                              : (villa.amenities || []).slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{villa.capacity}</td>
                    <td className="px-6 py-4 font-bold text-primary dark:text-emerald-500">₱{villa.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={villa.status === 'Available' ? 'success' : 'secondary'}>
                        {villa.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-slate-400" onClick={() => openEditModal(villa)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 dark:text-red-400" onClick={() => deleteVilla(villa.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VillaManagement;
