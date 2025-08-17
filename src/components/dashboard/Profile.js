import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Lock, Mail, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { admin, changePassword } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmitPassword = async (data) => {
    setLoading(true);
    try {
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        setShowPasswordForm(false);
        reset();
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-ghost-900">Profile</h1>
        <p className="text-ghost-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-ghost-500" />
              <h3 className="font-semibold text-ghost-900">Basic Information</h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ghost-600">Full Name</p>
                <p className="text-lg font-semibold text-ghost-900">{admin.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ghost-600">Email Address</p>
                <p className="text-lg font-semibold text-ghost-900">{admin.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ghost-600">Role</p>
                <p className="text-lg font-semibold text-ghost-900">{admin.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ghost-600">Member Since</p>
                <p className="text-lg font-semibold text-ghost-900">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-ghost-500" />
              <h3 className="font-semibold text-ghost-900">Permissions</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {Object.entries(admin.permissions).map(([permission, hasAccess]) => (
                <div key={permission} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ghost-700 capitalize">
                    {permission.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`badge ${hasAccess ? 'badge-success' : 'badge-ghost'}`}>
                    {hasAccess ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-ghost-500" />
              <h3 className="font-semibold text-ghost-900">Change Password</h3>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-outline"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>

        {showPasswordForm && (
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ghost-700 mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  className={`input ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="Enter your current password"
                />
                {errors.currentPassword && (
                  <p className="form-error">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-ghost-700 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                    }
                  })}
                  className={`input ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="Enter your new password"
                />
                {errors.newPassword && (
                  <p className="form-error">{errors.newPassword.message}</p>
                )}
                <p className="form-help">
                  Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ghost-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value, formValues) => value === formValues.newPassword || 'Passwords do not match'
                  })}
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner-sm mr-2" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-ghost-50 border border-ghost-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-ghost-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-ghost-900">Security Information</h4>
            <p className="text-sm text-ghost-600 mt-1">
              Your account is protected with JWT authentication and password hashing. 
              All admin actions are logged for security purposes. 
              If you suspect any unauthorized access, contact your system administrator immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
