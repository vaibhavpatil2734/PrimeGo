import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import adminService from "../../services/admin.service";
import { Search, ChevronDown, Edit3, X, Trash2 } from "lucide-react";
 
const ROLE_OPTIONS = [
  { value: "Customer", label: "Customer" },
  { value: "Admin", label: "Admin" },
];

const ITEMS_PER_PAGE = 10;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  // Reset displayed count when filters or search change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm, roleFilter]);

  const handleShowMore = () => {
    setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Get paginated users
  const displayedUsers = filteredUsers.slice(0, displayedCount);
  const hasMoreUsers = displayedCount < filteredUsers.length;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || "Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(
        (user) => user.role?.toUpperCase() === roleFilter.toUpperCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user._id?.toLowerCase().includes(term)
      );
    }

    filtered.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    setFilteredUsers(filtered);
  };

  const handleRoleUpdate = async (userId) => {
    if (!newRole) return;

    try {
      setUpdating(true);
      const result = await adminService.updateUserRole(userId, newRole);
      if (result.success) {
        // Optimistic UI update
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        
        // If this is current user, trigger re-fetch or reload to sync auth
        const currentRole = localStorage.getItem('role');
        if (currentRole !== newRole) {
          // Reload page to sync new token/role from localStorage
          window.location.reload();
        }
        
        setEditingRole(null);
        setNewRole("");
      } else {
        setError(result.error || "Failed to update role");
      }
    } catch (err) {
      setError(err.message || "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(userId);
      const result = await adminService.deleteUser(userId);
      if (result.success) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        setError(result.error || "Failed to delete user");
      }
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: "bg-purple-100 text-purple-800 border-purple-200",
      Customer: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all registered users
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{filteredUsers.length}</span> users
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by username, email or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          />
        </div>

        <div className="relative min-w-[180px]">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-base">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">
                          {user.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="text-xs md:text-sm text-gray-900 max-w-[120px] md:max-w-none truncate">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      {editingRole === user._id ? (
                        <div className="flex items-center gap-1 md:gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-1 md:px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleRoleUpdate(user._id)}
                            disabled={updating}
                            className="px-1 md:px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingRole(null);
                              setNewRole("");
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold uppercase border ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="text-xs md:text-sm text-gray-900">
                        {formatDate(user.date)}
                      </p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => {
                            setEditingRole(user._id);
                            setNewRole(user.role || "Customer");
                          }}
                          className="p-1 md:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deleting === user._id}
                          className="p-1 md:p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More Button */}
      {hasMoreUsers && (
        <div className="flex justify-center py-4 border-t border-gray-200">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Show More ({filteredUsers.length - displayedCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
