"use client";

import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import { User } from "../../types/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserShield, 
  faUser, 
  faTrash, 
  faCheckCircle, 
  faTimesCircle, 
  faSearch,
  faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await userService.updateUser(user.id, { role: newRole });
      // Update local state
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to banish this chronicler? This will soft-delete their account.")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      // Remove from local state
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-h1 text-3xl">User Management</h1>
          <p className="text-body-muted mt-1">Oversee all chroniclers across the multiverse.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <FontAwesomeIcon icon={faTimesCircle} />
          {error}
          <button onClick={fetchUsers} className="ml-auto underline text-micro-badge">Retry</button>
        </div>
      )}

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-sidebar-nav-header">
                <th className="px-6 py-4">Chronicler</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16 bg-white/[0.01]"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No chroniclers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                          <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.username}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.emailVerified ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-micro-badge">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 text-micro-badge">
                          <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                          Pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-micro-badge border ${
                        user.role === 'ADMIN' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-400">
                        {new Date().toLocaleDateString()} {/* Replace with real createdAt later */}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'ADMIN' ? "Demote to User" : "Promote to Admin"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-all"
                        >
                          <FontAwesomeIcon icon={user.role === 'ADMIN' ? faUser : faUserShield} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Banish Chronicler"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
