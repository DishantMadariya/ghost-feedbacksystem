import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Search,
  Filter,
  Plus,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get current admin from context
  const { admin: currentAdmin } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'HR',
    permissions: {
      viewAnalytics: true,
      viewSuggestions: true,
      manageSuggestions: false,
      manageAdmins: false,
      exportData: false
    }
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/admins');
      const adminsData = response.data.admins || response.data || [];
      setAdmins(adminsData);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch admins');
      setAdmins([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!currentAdmin?.permissions?.manageAdmins) {
      toast.error('You do not have permission to create admin accounts');
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/admins', formData);
      
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'HR',
        permissions: {
          viewAnalytics: true,
          viewSuggestions: true,
          manageSuggestions: false,
          manageAdmins: false,
          exportData: false
        }
      });
      fetchAdmins();
    } catch (error) {
      console.error('❌ Failed to create admin:', error);
      console.error('❌ Error response:', error.response?.data);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    
    if (!currentAdmin?.permissions?.manageAdmins) {
      toast.error('You do not have permission to update admin accounts');
      return;
    }
    
    try {
      await axios.put(`/api/admin/admins/${selectedAdmin._id}`, formData);
      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to update admin:', error);
      toast.error('Failed to update admin');
    }
  };

  const handleDeactivateAdmin = async (adminId) => {
    if (!currentAdmin?.permissions?.manageAdmins) {
      toast.error('You do not have permission to deactivate admin accounts');
      return;
    }
    
    if (window.confirm('Are you sure you want to deactivate this admin?')) {
      try {
        await axios.patch(`/api/admin/admins/${adminId}/status`, { isActive: false });
        toast.success('Admin deactivated successfully');
        fetchAdmins();
      } catch (error) {
        console.error('Failed to deactivate admin:', error);
        toast.error('Failed to deactivate admin');
      }
    }
  };

  const handleEditAdmin = (admin) => {
    if (!currentAdmin?.permissions?.manageAdmins) {
      toast.error('You do not have permission to edit admin accounts');
      return;
    }
    
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions
    });
    setShowEditModal(true);
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const filteredAdmins = (admins || []).filter(admin => {
    const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'CEO': return 'bg-purple-100 text-purple-800';
      case 'CTO': return 'bg-blue-100 text-blue-800';
      case 'CFO': return 'bg-green-100 text-green-800';
      case 'COO': return 'bg-orange-100 text-orange-800';
      case 'CCO': return 'bg-pink-100 text-pink-800';
      case 'CPO': return 'bg-indigo-100 text-indigo-800';
      case 'HR': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg" />
      </div>
    );
  }

  return (
    <div className={!showCreateModal ? "space-y-6" : ""}>
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ghost-900">Admin Management</h1>
          <p className="text-ghost-600 mt-2">
            Create, manage, and monitor admin accounts and permissions
          </p>
        </div>
        {/* Create Admin button - only visible if user can manage admins */}
        {currentAdmin?.permissions?.manageAdmins ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Admin</span>
          </button>
        ) : (
          <div className="text-sm text-ghost-500 bg-ghost-100 px-3 py-2 rounded-lg">
            You don't have permission to manage admins
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Admins</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchAdmins();
                }}
                className="text-sm text-red-800 hover:text-red-900 underline mt-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {currentAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Current User Info</h3>
              <p className="text-sm text-blue-700 mt-1">
                Role: {currentAdmin.role} | 
                Permissions: {Object.keys(currentAdmin.permissions || {}).filter(k => currentAdmin.permissions[k]).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permission Notice */}
      {currentAdmin && !currentAdmin.permissions?.manageAdmins && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Read-Only Access</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have <strong>view-only access</strong> to admin management. You need the <strong>manageAdmins</strong> permission to create, edit, or deactivate admin accounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Total Admins</p>
                <p className="text-2xl font-bold text-ghost-900">{admins?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Shield className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Active Admins</p>
                <p className="text-2xl font-bold text-ghost-900">
                  {admins?.filter(a => a.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">HR Admins</p>
                <p className="text-2xl font-bold text-ghost-900">
                  {admins?.filter(a => a.role === 'HR').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-info-100 rounded-lg">
                <Shield className="h-6 w-6 text-info-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Super Admins</p>
                <p className="text-2xl font-bold text-ghost-900">
                  {admins?.filter(a => a.role === 'CEO' || a.role === 'CTO').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ghost-400" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Roles</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="CFO">CFO</option>
                <option value="COO">COO</option>
                <option value="CCO">CCO</option>
                <option value="CPO">CPO</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-ghost-900">
            Admin Accounts ({filteredAdmins?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td>
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-ghost-900">{`${admin.firstName || ''} ${admin.lastName || ''}`.trim()}</p>
                          <p className="text-sm text-ghost-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleColor(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(admin.permissions).map(([key, value]) => (
                          value && (
                            <span key={key} className="badge bg-blue-100 text-blue-800 text-xs">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          )
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(admin.status)}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="text-sm text-ghost-500">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                                         <td>
                       <div className="flex items-center space-x-2">
                         <button
                           onClick={() => handleViewAdmin(admin)}
                           className="p-2 text-ghost-400 hover:text-ghost-600 hover:bg-ghost-100 rounded-md"
                           title="View Details"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         {/* Edit and Delete buttons - only visible if user can manage admins */}
                         {currentAdmin?.permissions?.manageAdmins && (
                           <>
                             <button
                               onClick={() => handleEditAdmin(admin)}
                               className="p-2 text-ghost-400 hover:text-ghost-600 hover:bg-ghost-100 rounded-md"
                               title="Edit Admin"
                             >
                               <Edit className="h-4 w-4" />
                             </button>
                             {admin.status === 'active' && (
                               <button
                                 onClick={() => handleDeactivateAdmin(admin._id)}
                                 className="p-2 text-ghost-400 hover:text-red-600 hover:bg-red-100 rounded-md"
                                 title="Deactivate Admin"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             )}
                           </>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateAdmin}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <EditAdminModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateAdmin}
          onClose={() => setShowEditModal(false)}
          admin={selectedAdmin}
        />
      )}

      {/* View Admin Modal */}
      {showViewModal && (
        <ViewAdminModal
          admin={selectedAdmin}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

// Create Admin Modal Component
const CreateAdminModal = ({ formData, setFormData, onSubmit, onClose }) => {
  const handlePermissionChange = (permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-ghost-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ghost-900">Create New Admin</h2>
          <button onClick={onClose} className="text-ghost-400 hover:text-ghost-600">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="input w-full"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="input w-full"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input w-full"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input w-full"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="input w-full"
              >
                <option value="HR">HR</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="CFO">CFO</option>
                <option value="COO">COO</option>
                <option value="CCO">CCO</option>
                <option value="CPO">CPO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ghost-700 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handlePermissionChange(key, e.target.checked)}
                    className="rounded border-ghost-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-ghost-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Admin Modal Component
const EditAdminModal = ({ formData, setFormData, onSubmit, onClose, admin }) => {
  const handlePermissionChange = (permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-ghost-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ghost-900">Edit Admin: {`${admin?.firstName || ''} ${admin?.lastName || ''}`.trim()}</h2>
          <button onClick={onClose} className="text-ghost-400 hover:text-ghost-600">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="input w-full"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="input w-full"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input w-full"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="input w-full"
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-ghost-500 mt-1">Leave blank to keep current password</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ghost-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="input w-full"
              >
                <option value="HR">HR</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="CFO">CFO</option>
                <option value="COO">COO</option>
                <option value="CCO">CCO</option>
                <option value="CPO">CPO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ghost-700 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handlePermissionChange(key, e.target.checked)}
                    className="rounded border-ghost-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-ghost-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Admin Modal Component
const ViewAdminModal = ({ admin, onClose }) => {
  if (!admin) return null;

  return (
    <div className="fixed inset-0 bg-ghost-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-ghost-900">Admin Details</h2>
          <button onClick={onClose} className="text-ghost-400 hover:text-ghost-600">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-ghost-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-ghost-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ghost-700">First Name</label>
                <p className="text-ghost-900">{admin.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ghost-700">Last Name</label>
                <p className="text-ghost-900">{admin.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ghost-700">Email</label>
                <p className="text-ghost-900">{admin.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ghost-700">Role</label>
                <p className="text-ghost-900">{admin.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ghost-700">Status</label>
                <span className={`badge ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {admin.status}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-ghost-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-ghost-900 mb-4">Permissions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(admin.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-ghost-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Info */}
          <div className="bg-ghost-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-ghost-900 mb-4">Activity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ghost-700">Created At</label>
                <p className="text-ghost-900">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ghost-700">Last Login</label>
                <p className="text-ghost-900">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;