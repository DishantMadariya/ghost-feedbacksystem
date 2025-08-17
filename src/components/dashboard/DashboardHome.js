import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  FileText,
  Download,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSuggestions, setRecentSuggestions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, suggestionsResponse] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/suggestions?limit=5&sortBy=createdAt&sortOrder=desc')
      ]);

      setStats(statsResponse.data);
      setRecentSuggestions(suggestionsResponse.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions for dashboard cards
  const navigateToSuggestions = () => {
    navigate('/admin/suggestions');
  };

  const navigateToExport = () => {
    navigate('/admin/suggestions'); // Export functionality is in suggestions list
  };

  const navigateToAdmins = () => {
    navigate('/admin/manageadmins');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Reviewed': return '#3b82f6';
      case 'Resolved': return '#10b981';
      case 'Escalated': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#6b7280';
      case 'Medium': return '#3b82f6';
      case 'High': return '#f59e0b';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-ghost-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const chartData = stats.categoryStats?.map(item => ({
    name: item._id || 'Unknown',
    total: item.count || 0,
    pending: item.pending || 0,
    reviewed: item.reviewed || 0,
    resolved: item.resolved || 0,
    escalated: item.escalated || 0
  })) || [];

  const pieData = stats.statusBreakdown?.map(item => ({
    name: item._id || 'Unknown',
    value: item.count || 0,
    color: getStatusColor(item._id)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-ghost-900">Dashboard Overview</h1>
            <p className="text-ghost-600 mt-1 text-lg">
              Welcome to the Ghost Feedback System. Here's what's happening today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Total Suggestions</p>
                <p className="text-2xl font-bold text-ghost-900">{stats.totalSuggestions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Pending</p>
                <p className="text-2xl font-bold text-ghost-900">
                  {stats.statusBreakdown?.find(s => s._id === 'Pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Resolved</p>
                <p className="text-2xl font-bold text-ghost-900">
                  {stats.statusBreakdown?.find(s => s._id === 'Resolved')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-ghost-600">Response Rate</p>
                <p className="text-2xl font-bold text-ghost-900">{stats.responseRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-ghost-900">Suggestions by Category</h3>
          </div>
          <div className="card-body">
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-ghost-500">
                  <div className="text-center">
                    <BarChart3
                     className="h-12 w-12 mx-auto mb-2 text-ghost-300" />
                    <p className="text-sm">No category data available</p>
                    <p className="text-xs text-ghost-400">Submit some suggestions to see charts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-ghost-900">Status Distribution</h3>
          </div>
          <div className="card-body">
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                                 <div className="flex items-center justify-center h-full text-ghost-500">
                   <div className="text-center">
                     <PieChartIcon className="h-12 w-12 mx-auto mb-2 text-ghost-300" />
                     <p className="text-sm">No status data available</p>
                     <p className="text-xs text-ghost-400">Submit some suggestions to see charts</p>
                   </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Suggestions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-ghost-900">Recent Suggestions</h3>
          <p className="text-sm text-ghost-500 mt-1">Click on any row to view details</p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSuggestions.length > 0 ? (
                  recentSuggestions.map((suggestion) => (
                    <tr 
                      key={suggestion._id}
                      onClick={() => navigate(`/admin/suggestions/${suggestion._id}`)}
                      className="cursor-pointer hover:bg-ghost-50 transition-colors duration-150"
                    >
                      <td className="font-medium">{suggestion.category?.name || 'N/A'}</td>
                      <td>{suggestion.subcategory?.name || 'N/A'}</td>
                      <td>
                        <span 
                          className="badge"
                          style={{ backgroundColor: getStatusColor(suggestion.status) + '20', color: getStatusColor(suggestion.status) }}
                        >
                          {suggestion.status}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="badge"
                          style={{ backgroundColor: getPriorityColor(suggestion.priority) + '20', color: getPriorityColor(suggestion.priority) }}
                        >
                          {suggestion.priority}
                        </span>
                      </td>
                      <td>{format(new Date(suggestion.createdAt), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-ghost-500">
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-8 w-8 mb-2 text-ghost-300" />
                        <p className="text-sm">No suggestions yet</p>
                        <p className="text-xs text-ghost-400">Submit some suggestions to see them here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-primary-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <h4 className="font-semibold text-ghost-900 mb-2">View All Suggestions</h4>
            <p className="text-sm text-ghost-600 mb-4">
              Browse and manage all submitted suggestions
            </p>
            <button 
              onClick={navigateToSuggestions}
              className="btn-primary w-full hover:bg-primary-700 transition-colors duration-200"
            >
              View Suggestions
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-success-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Download className="h-6 w-6 text-success-600" />
            </div>
            <h4 className="font-semibold text-ghost-900 mb-2">Export Data</h4>
            <p className="text-sm text-ghost-600 mb-4">
              Download suggestions as CSV or Excel
            </p>
            <button 
              onClick={navigateToExport}
              className="btn-success w-full hover:bg-success-700 transition-colors duration-200"
            >
              Export Data
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-warning-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-6 w-6 text-warning-600" />
            </div>
            <h4 className="font-semibold text-ghost-900 mb-2">Manage Admins</h4>
            <p className="text-sm text-ghost-600 mb-4">
              Add or modify admin accounts
            </p>
            <button 
              onClick={navigateToAdmins}
              className="btn-warning w-full hover:bg-warning-700 transition-colors duration-200"
            >
              Manage Admins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
