import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { decodeHtmlEntities } from '../../utils/textUtils';
import { useAuth } from '../../contexts/AuthContext';
import { ENDPOINTS } from '../../utils/api';

const SuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const adminDropdownRef = useRef(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Permission check helper functions
  const canViewSuggestions = admin?.permissions?.viewSuggestions;
  const canEditSuggestions = admin?.permissions?.editSuggestions;
  const canDeleteSuggestions = admin?.permissions?.deleteSuggestions;

  useEffect(() => {
    fetchSuggestion();
    fetchAdmins();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.ADMIN_SUGGESTION_BY_ID(id));
      setSuggestion(response.data.suggestion);
      setEditData({
        status: response.data.suggestion.status,
        priority: response.data.suggestion.priority,
        reply: response.data.suggestion.reply || '',
        assignedTo: response.data.suggestion.assignedTo || ''
      });
      setAdminSearchTerm(response.data.suggestion.assignedTo || '');
    } catch (error) {
      console.error('Failed to fetch suggestion:', error);
      toast.error('Failed to load suggestion');
      navigate('/admin/suggestions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await axios.get(ENDPOINTS.ADMIN_ADMIN_NAMES);
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      // Don't show error toast as this is not critical
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSave = async () => {
    if (!canEditSuggestions) {
      toast.error('You do not have permission to edit suggestions');
      return;
    }

    // Optional: Show warning if no reply when making significant changes
    if ((editData.assignedTo && editData.assignedTo !== suggestion.assignedTo) || 
        (editData.status !== suggestion.status)) {
      if (!editData.reply?.trim()) {
        // Show warning but don't block - let user decide
        const shouldProceed = window.confirm(
          'You\'re making significant changes without adding a reply/note. ' +
          'While not required, adding context helps maintain clear communication trails. ' +
          'Do you want to proceed without a reply?'
        );
        if (!shouldProceed) {
          return; // User chose to add reply first
        }
      }
    }

    try {
      setSaving(true);
      const response = await axios.put(ENDPOINTS.ADMIN_SUGGESTION_BY_ID(id), editData);
      setSuggestion(response.data.suggestion);
      setEditing(false);
      toast.success('Suggestion updated successfully');
    } catch (error) {
      console.error('Failed to update suggestion:', error);
      toast.error('Failed to update suggestion');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({
      status: suggestion.status,
      priority: suggestion.priority,
      reply: suggestion.reply || '',
      assignedTo: suggestion.assignedTo || ''
    });
    setAdminSearchTerm(suggestion.assignedTo || '');
    setShowAdminDropdown(false);
  };

  const handleEdit = () => {
    if (!canEditSuggestions) {
      toast.error('You do not have permission to edit suggestions');
      return;
    }
    setEditing(true);
    setShowAdminDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg" />
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="text-center py-12">
        <p className="text-ghost-600">Suggestion not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Reviewed': return 'status-primary';
      case 'Resolved': return 'status-resolved';
      case 'Escalated': return 'status-escalated';
      default: return 'badge-ghost';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'priority-low';
      case 'Medium': return 'priority-medium';
      case 'High': return 'priority-high';
      case 'Critical': return 'priority-critical';
      default: return 'badge-ghost';
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );

  const handleAdminSelect = (admin) => {
    setEditData({ ...editData, assignedTo: admin.name });
    setAdminSearchTerm(admin.name);
    setShowAdminDropdown(false);
  };

  const handleAdminInputChange = (value) => {
    setEditData({ ...editData, assignedTo: value });
    setAdminSearchTerm(value);
    setShowAdminDropdown(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/suggestions"
            className="btn-ghost p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ghost-900">Suggestion Details</h1>
            <p className="text-ghost-600 mt-1">
              ID: {suggestion._id}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <div className="spinner-sm mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Edit button - only visible if user can edit suggestions */}
              {canEditSuggestions && (
                <button
                  onClick={handleEdit}
                  className="btn-primary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Suggestion Content */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-ghost-900">Suggestion Content</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ghost-700 mb-1">
                    Category
                  </label>
                  <p className="text-ghost-900 font-medium">{suggestion.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ghost-700 mb-1">
                    Subcategory
                  </label>
                  <p className="text-ghost-900 font-medium">{suggestion.subcategory?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ghost-700 mb-1">
                    Suggestion Text
                  </label>
                  <div className="bg-ghost-50 rounded-lg p-4">
                    <p className="text-ghost-900 whitespace-pre-wrap">
                      {decodeHtmlEntities(suggestion.suggestionText)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Reply */}
          <div className="card">
            <div className="card-body">
              {editing && canEditSuggestions ? (
                <div>
                                     <label className="block text-sm font-medium text-ghost-700 mb-2">
                     Reply/Notes
                     {((editData.assignedTo && editData.assignedTo !== suggestion.assignedTo) || 
                        (editData.status !== suggestion.status)) && (
                       <span className="text-warning-600 ml-1">💡</span>
                     )}
                   </label>
                  <textarea
                    value={editData.reply}
                    onChange={(e) => setEditData({ ...editData, reply: e.target.value })}
                    rows={4}
                    className="textarea"
                    placeholder="Add your reply or internal notes..."
                  />
                  <p className="form-help">
                    This reply is only visible to admin users and will not be shown to the anonymous submitter.
                  </p>
                </div>
              ) : (
                <div>
                  {suggestion.reply ? (
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-ghost-900 whitespace-pre-wrap">
                        {suggestion.reply}
                      </p>
                    </div>
                  ) : (
                    <p className="text-ghost-500 italic">No reply added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-ghost-900">Status & Priority</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                                 <label className="block text-sm font-medium text-ghost-700 mb-2">
                   Status
                   {editData.status !== suggestion.status && (
                     <span className="text-warning-600 ml-1">💡</span>
                   )}
                 </label>
                {editing && canEditSuggestions ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                ) : (
                  <span className={getStatusColor(suggestion.status)}>
                    {suggestion.status}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-2">
                  Priority
                </label>
                {editing && canEditSuggestions ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    className="select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                ) : (
                  <span className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </span>
                )}
              </div>

              <div>
                                 <label className="block text-sm font-medium text-ghost-700 mb-2">
                   Assigned To
                   {editData.assignedTo && editData.assignedTo !== suggestion.assignedTo && (
                     <span className="text-warning-600 ml-1">💡</span>
                     )}
                 </label>
                {editing && canEditSuggestions ? (
                  <div className="relative" ref={adminDropdownRef}>
                    <input
                      type="text"
                      value={editData.assignedTo}
                      onChange={(e) => handleAdminInputChange(e.target.value)}
                      onFocus={() => setShowAdminDropdown(true)}
                      className="input"
                      placeholder="Search and assign to team member..."
                    />
                    {showAdminDropdown && (
                      <div className="admin-dropdown">
                        {loadingAdmins ? (
                          <div className="px-4 py-3 text-center text-ghost-500">
                            <div className="spinner-sm mx-auto mb-2" />
                            Loading admins...
                          </div>
                        ) : filteredAdmins.length > 0 ? (
                          filteredAdmins.map((admin) => (
                            <div
                              key={admin._id}
                              className="admin-dropdown-item"
                              onClick={() => handleAdminSelect(admin)}
                            >
                              <div className="font-medium text-ghost-900">{admin.name}</div>
                              <div className="text-sm text-ghost-600">{admin.role} • {admin.email}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-ghost-500">
                            {adminSearchTerm ? 'No matching admins found' : 
                              admins.length > 0 ? `Start typing to search ${admins.length} available admins...` : 'No admins available'
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-ghost-900">
                    {suggestion.assignedTo || 'Not assigned'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-ghost-900">Metadata</h3>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm font-medium text-ghost-600">Created</p>
                <p className="text-ghost-900">
                  {format(new Date(suggestion.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-ghost-600">Last Updated</p>
                <p className="text-ghost-900">
                  {format(new Date(suggestion.updatedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {suggestion.actualResolutionDate && (
                <div>
                  <p className="text-sm font-medium text-ghost-600">Resolved On</p>
                  <p className="text-ghost-900">
                    {format(new Date(suggestion.actualResolutionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
