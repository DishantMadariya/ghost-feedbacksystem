import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Users,
  User,
  LogOut,
  X,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

const Sidebar = ({ open, setOpen, admin, onLogout }) => {
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      permission: "viewAnalytics",
    },
    {
      name: "All Suggestions",
      href: "/admin/suggestions",
      icon: MessageSquare,
      permission: "viewSuggestions",
    },
    {
      name: "Pending",
      href: "/admin/suggestions/pending",
      icon: FileText,
      permission: "viewSuggestions",
    },
    {
      name: "Reviewed",
      href: "/admin/suggestions/reviewed",
      icon: BarChart3,
      permission: "viewSuggestions",
    },
    {
      name: "Resolved",
      href: "/admin/suggestions/resolved",
      icon: BarChart3,
      permission: "viewSuggestions",
    },
    {
      name: "Admin Management",
      href: "/admin/manageadmins",
      icon: Users,
      permission: "manageAdmins",
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
      permission: "viewSuggestions",
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => admin.permissions[item.permission]
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-ghost-200 shadow-sm z-30 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex-1 flex flex-col pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  src="/logo.png"
                  alt="Ghost Suggestion Box"
                  className="object-cover object-center bg-transparent"
                />
              </div>

              {/* Navigation */}
              <nav className="mt-8 px-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end={
                        item.href === "/admin" ||
                        item.href === "/admin/suggestions"
                      }
                      className={({ isActive }) => {
                        return `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? "bg-primary-100 text-primary-900"
                            : "text-ghost-600 hover:bg-ghost-50 hover:text-ghost-900"
                        }`;
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* User Info & Logout */}
            <div className="flex-shrink-0 flex border-t border-ghost-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-ghost-900">
                    {admin.fullName}
                  </p>
                  <p className="text-xs text-ghost-500">{admin.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-3 p-1 rounded-md text-ghost-400 hover:text-ghost-600 hover:bg-ghost-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ghost-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-ghost-900">
                  Ghost Feedback
                </h1>
                <p className="text-xs text-ghost-500">Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md text-ghost-400 hover:text-ghost-600 hover:bg-ghost-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    end={
                      item.href === "/admin" ||
                      item.href === "/admin/suggestions"
                    }
                    className={({ isActive }) => {
                      return `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-primary-100 text-primary-900"
                          : "text-ghost-600 hover:bg-ghost-50 hover:text-ghost-900"
                      }`;
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Mobile User Info & Logout */}
          <div className="border-t border-ghost-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-ghost-900">
                  {admin.fullName}
                </p>
                <p className="text-xs text-ghost-500">{admin.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="ml-3 p-2 rounded-md text-ghost-400 hover:text-ghost-600 hover:bg-ghost-100 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
