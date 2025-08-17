import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { decodeHtmlEntities } from '../../utils/textUtils';
import { useAuth } from '../../contexts/AuthContext';
import { ENDPOINTS } from '../../utils/api';

const SuggestionsList = ({ status: routeStatus }) => {
  const { admin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState({});
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    status: routeStatus || searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    search: searchParams.get('search') || ''
  });

  // Initialize filters and URL params when routeStatus changes
  useEffect(() => {
    if (routeStatus) {
      const newFilters = { ...filters, status: routeStatus };
      setFilters(newFilters);
      
      // Clear existing suggestions to prevent showing stale data
      setSuggestions([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      });
      
      // Set loading state
      setLoading(true);
      
      // Update URL params
      const params = new URLSearchParams();
      params.set('status', routeStatus);
      setSearchParams(params);
    }
  }, [routeStatus]);

  // Initialize component when it first mounts
  useEffect(() => {
    if (routeStatus && !searchParams.get('status')) {
      // If we have a routeStatus but no status in URL, set it
      const params = new URLSearchParams();
      params.set('status', routeStatus);
      setSearchParams(params);
    }
  }, []);

  // Fetch data when searchParams or filters change
  useEffect(() => {
    fetchCategories();
    fetchSuggestions();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CATEGORIES);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Permission check helper functions
  const canViewSuggestions = admin?.permissions?.viewSuggestions;
  const canEditSuggestions = admin?.permissions?.editSuggestions;
  const canDeleteSuggestions = admin?.permissions?.deleteSuggestions;
  const canExportData = admin?.permissions?.exportData;

  // Handle suggestion deletion
  const handleDeleteSuggestion = async (suggestionId) => {
    if (!canDeleteSuggestions) {
      toast.error('You do not have permission to delete suggestions');
      return;
    }

    if (window.confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
      try {
        await axios.delete(`${ENDPOINTS.ADMIN_SUGGESTIONS}/${suggestionId}`);
        toast.success('Suggestion deleted successfully');
        // Refresh the suggestions list
        fetchSuggestions();
      } catch (error) {
        console.error('Failed to delete suggestion:', error);
        const errorMessage = error.response?.data?.error || 'Failed to delete suggestion';
        toast.error(errorMessage);
      }
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      // Build params from current filters and routeStatus
      const params = new URLSearchParams();
      
      // Add route status if present
      if (routeStatus) {
        params.set('status', routeStatus);
      }
      
      // Add other filters from searchParams
      if (searchParams.get('category')) params.set('category', searchParams.get('category'));
      if (searchParams.get('subcategory')) params.set('subcategory', searchParams.get('subcategory'));
      if (searchParams.get('priority')) params.set('priority', searchParams.get('priority'));
      if (searchParams.get('startDate')) params.set('startDate', searchParams.get('startDate'));
      if (searchParams.get('endDate')) params.set('endDate', searchParams.get('endDate'));
      if (searchParams.get('search')) params.set('search', searchParams.get('search'));
      if (searchParams.get('page')) params.set('page', searchParams.get('page'));
      if (searchParams.get('limit')) params.set('limit', searchParams.get('limit'));
      
      
      const response = await axios.get(`${ENDPOINTS.ADMIN_SUGGESTIONS}?${params}`);
      
      // Always update with the response data, even if empty
      setSuggestions(response.data.suggestions || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      });

      // Additional debugging for empty results
      if (response.data.suggestions?.length === 0) {
        
        // If we have a routeStatus, let's check what statuses exist in the database
        if (routeStatus) {
          try {
            const allSuggestionsResponse = await axios.get(`${ENDPOINTS.ADMIN_SUGGESTIONS}?limit=100`);
            const allSuggestions = allSuggestionsResponse.data.suggestions || [];
            const statuses = [...new Set(allSuggestions.map(s => s.status))];
          } catch (error) {
            console.error('Failed to check all suggestions:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (filters.search) {
      params.set('search', filters.search);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      status: routeStatus || '',
      priority: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    
    // Clear URL params but keep status if it's from route
    const params = new URLSearchParams();
    if (routeStatus) {
      params.set('status', routeStatus);
    }
    setSearchParams(params);
  };

  const exportData = async (format) => {
    if (!canExportData) {
      toast.error('You do not have permission to export data');
      return;
    }

    try {
      // Include route status in export filters
      const exportFilters = { ...filters };
      if (routeStatus) {
        exportFilters.status = routeStatus;
      }
      
      const response = await axios.post(ENDPOINTS.ADMIN_EXPORT, {
        format,
        filters: exportFilters
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suggestions_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
      }
  };

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

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          {/* Breadcrumb */}
          {routeStatus && (
            <nav className="flex items-center space-x-2 text-sm text-ghost-500 mb-2">
              <Link to="/admin/suggestions" className="hover:text-ghost-700">
                Suggestions
              </Link>
              <span>/</span>
              <span className="text-ghost-900 font-medium">{routeStatus}</span>
            </nav>
          )}
          
          <h1 className="text-2xl font-bold text-ghost-900">
            {routeStatus ? `${routeStatus} Suggestions` : 'Suggestions Management'}
          </h1>
          <p className="text-ghost-600 mt-1">
            {routeStatus 
              ? `View and manage ${routeStatus.toLowerCase()} suggestions`
              : 'View and manage all submitted suggestions'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {routeStatus && (
            <Link
              to="/admin/suggestions"
              className="btn-ghost flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>View All</span>
            </Link>
          )}
          {/* Export buttons - only visible if user can export data */}
          {canExportData && (
            <>
              <button
                onClick={() => exportData('csv')}
                className="btn-outline flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportData('excel')}
                className="btn-outline flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-ghost-500" />
              <h3 className="font-semibold text-ghost-900">Filters</h3>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search and Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ghost-400" />
                  <input
                    type="text"
                    placeholder="Search suggestions..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="select"
                >
                  <option value="">All Categories</option>
                  {Object.keys(categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="select"
                  disabled={!!routeStatus}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="select"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ghost-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="btn-primary"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-ghost"
              >
                Clear All Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <p className="text-ghost-600">
            Showing {pagination.totalItems || 0} suggestions
            {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
          </p>
          {routeStatus && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {routeStatus}
            </span>
          )}
        </div>
      </div>

      {/* Suggestions Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Suggestion</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((suggestion) => (
                  <tr key={suggestion._id}>
                    <td className="font-medium">{suggestion.category?.name || 'N/A'}</td>
                    <td>{suggestion.subcategory?.name || 'N/A'}</td>
                                         <td className="max-w-xs">
                       <div className="truncate" title={decodeHtmlEntities(suggestion.suggestionText)}>
                         {decodeHtmlEntities(suggestion.suggestionText)}
                       </div>
                     </td>
                    <td>
                      <span className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </span>
                    </td>
                    <td>{format(new Date(suggestion.createdAt), 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="flex space-x-2">
                        {/* View button - always visible if user can view suggestions */}
                        {canViewSuggestions && (
                          <Link
                            to={`/admin/suggestions/${suggestion._id}`}
                            className="btn-ghost p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        
                        {/* Edit button - only visible if user can edit suggestions */}
                        {canEditSuggestions && (
                          <Link
                            to={`/admin/suggestions/${suggestion._id}`}
                            className="btn-ghost p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        
                        {/* Delete button - only visible if user can delete suggestions */}
                        {canDeleteSuggestions && (
                          <button
                            onClick={() => handleDeleteSuggestion(suggestion._id)}
                            className="btn-ghost p-1 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                     {/* Empty State */}
           {suggestions.length === 0 && !loading && (
             <div className="text-center py-12">
               <div className="flex flex-col items-center">
                 <div className="text-ghost-300 mb-4">
                   <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                 </div>
                 <p className="text-ghost-600 font-medium mb-2">No suggestions found</p>
                 <p className="text-ghost-500 text-sm">
                   {routeStatus 
                     ? `No ${routeStatus.toLowerCase()} suggestions match your current filters.`
                     : 'No suggestions match your current filters.'
                   }
                 </p>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-ghost p-2 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  page === pagination.currentPage
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-ghost-600 hover:bg-ghost-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-ghost p-2 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;
