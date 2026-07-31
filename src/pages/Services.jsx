import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Settings2,
  Trash2,
  Edit,
  Tag,
  X
} from 'lucide-react';
import { useResort } from '@/context/ResortContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const Services = () => {
  const { services, addService, updateService, deleteService, updateServiceStatus } = useResort();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'General Service',
    status: 'Available'
  });

  const filteredServices = (services || []).filter(service => {
    const name = service?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', price: '', category: 'General Service', status: 'Available' });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      category: service.category,
      status: service.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingService) {
      await updateService({ ...formData, id: editingService.id });
    } else {
      await addService(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Services & Amenities</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage additional services and their pricing.</p>
        </div>
        <Button onClick={openAddModal} className="gap-2 rounded-xl h-12 px-6">
          <Plus className="w-5 h-5" />
          Add New Service
        </Button>
      </div>

      {/* Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <h3 className="text-lg font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Service Name</label>
                <input
                  type="text" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Extra Mattress"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Price (₱)</label>
                <input
                  type="number" required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Rental</option>
                  <option>Facility</option>
                  <option>Food & Drink</option>
                  <option>General Service</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl h-12 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12">{editingService ? 'Save Changes' : 'Add Service'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option>All Categories</option>
          <option>Rental</option>
          <option>Facility</option>
          <option>Food & Drink</option>
          <option>General Service</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-800 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-500">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => openEditModal(service)} variant="ghost" size="icon" className="h-8 w-8 dark:text-slate-400"><Edit className="w-4 h-4" /></Button>
                    <Button onClick={() => deleteService(service.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 dark:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{service.name}</h3>
                  <p className="text-2xl font-black text-primary dark:text-emerald-500 mt-2">₱{parseFloat(service.price).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Category: {service.category}</p>
                </div>
                <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <Badge variant={service.status === 'Available' ? 'success' : 'secondary'}>{service.status}</Badge>
                  <Button
                    onClick={() => updateServiceStatus(service.id, service.status === 'Available' ? 'Unavailable' : 'Available')}
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 dark:text-slate-400"
                  >
                    <Settings2 className="w-3 h-3" /> Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;
