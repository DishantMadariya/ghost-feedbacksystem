import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './dashboard/Sidebar';
import DashboardHome from './dashboard/DashboardHome';
import SuggestionsList from './dashboard/SuggestionsList';
import SuggestionDetail from './dashboard/SuggestionDetail';
import AdminManagement from './dashboard/AdminManagement';
import Profile from './dashboard/Profile';

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    return null;
  }

  return (
         <div className="min-h-screen bg-ghost-50 overflow-hidden">
       {/* Sidebar */}
       <Sidebar
         open={sidebarOpen}
         setOpen={setSidebarOpen}
         admin={admin}
         onLogout={handleLogout}
       />

       {/* Main Content */}
       <div className="flex flex-col overflow-hidden lg:ml-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-ghost-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-ghost-600 hover:text-ghost-900 hover:bg-ghost-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <div className="font-medium text-ghost-900">{admin.fullName}</div>
                <div className="text-ghost-500">{admin.role}</div>
              </div>
            </div>
          </div>
        </div>

                 {/* Page Content */}
         <main className="flex-1 py-6 overflow-y-auto">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/suggestions" element={<SuggestionsList />} />
              <Route path="/suggestions/pending" element={<SuggestionsList status="Pending" />} />
              <Route path="/suggestions/reviewed" element={<SuggestionsList status="Reviewed" />} />
              <Route path="/suggestions/resolved" element={<SuggestionsList status="Resolved" />} />
              <Route path="/suggestions/:id" element={<SuggestionDetail />} />
              <Route path="/manageadmins" element={<AdminManagement />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-ghost-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
