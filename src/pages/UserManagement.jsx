import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Shield,
  Search,
  MoreVertical,
  Key,
  Ban,
  History,
  CheckCircle,
  Trash2
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
import { X } from 'lucide-react';

const UserManagement = () => {
  const { users, updateUserStatus, resetUserPassword, deleteUser, addUser } = useResort();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Cashier'
  });

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleResetPassword = (user) => {
    const newPass = prompt(`Enter new password for ${user.name}:`);
    if (newPass) {
      resetUserPassword(user.id, newPass);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateUserStatus(user.id, newStatus);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }
    await addUser(newUser);
    setShowAddModal(false);
    setNewUser({ name: '', username: '', password: '', role: 'Cashier' });
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Manage staff accounts and permissions.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 rounded-xl h-12 px-6 w-full md:w-auto">
          <UserPlus className="w-5 h-5" />
          Add New User
        </Button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-primary text-white">
              <h3 className="text-lg font-bold">Register New Staff</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Username</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  placeholder="e.g. juan.dc"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Initial Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Staff Role</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option>Administrator</option>
                  <option>Cashier</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl h-12 dark:border-slate-700 dark:text-slate-300">Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12">Create User</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-slate-50 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option>All Roles</option>
          <option>Administrator</option>
          <option>Cashier</option>
        </select>
      </div>

      <Card className="dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border dark:border-slate-700 capitalize">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary dark:text-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.last_login || 'Never'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="dark:text-slate-400"
                        title="Reset Password"
                        onClick={() => handleResetPassword(user)}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="dark:text-slate-400" title="Audit Log"><History className="w-4 h-4" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={user.status === 'Active' ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"}
                        title={user.status === 'Active' ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === 'Active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="dark:text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-slate-900 dark:border-slate-800">
                          <DropdownMenuItem className="gap-2 dark:text-slate-200">Edit Details</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" /> Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
