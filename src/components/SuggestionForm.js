import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Shield, Eye, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../utils/api';

const SuggestionForm = () => {
  const [categories, setCategories] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm();

  const selectedCategory = watch('category');

  // Fetch categories and stats on component mount
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && categories[selectedCategory]) {
      setSubcategories(categories[selectedCategory]);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CATEGORIES);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(ENDPOINTS.STATS);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(ENDPOINTS.SUBMIT_SUGGESTION, data);
      setSubmitted(true);
      reset();
      toast.success('Suggestion submitted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit suggestion. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="card-body text-center py-12">
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-ghost-900 mb-4">
                ✅ Your suggestion has been submitted successfully.
              </h2>
              <p className="text-ghost-600 mb-6">
                Thank you for your feedback! Our team will review it and take appropriate action.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-primary"
              >
                Submit Another Suggestion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghost-50 to-ghost-100">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-ghost-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img
                src="/favicon.svg"
                alt="Ghost Suggestion Box"
                className="h-9 w-8 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-ghost-900">Ghost Feedback System</h1>
                <p className="text-sm text-ghost-600">Share your ideas anonymously</p>
              </div>
            </div>
            <Link
              to="/admin/login"
              className="btn-outline flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-ghost-900">
                  Submit Your Suggestion
                </h2>
                <p className="text-ghost-600 mt-1">
                  Your feedback helps us improve. All submissions are completely anonymous.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-6">
                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-ghost-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    {...register('category', { required: 'Please select a category' })}
                    className={`select ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {Object.keys(categories).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="form-error">{errors.category.message}</p>
                  )}
                </div>

                {/* Subcategory Selection */}
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-ghost-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    id="subcategory"
                    {...register('subcategory', { required: 'Please select a subcategory' })}
                    className={`select ${errors.subcategory ? 'input-error' : ''}`}
                    disabled={!selectedCategory}
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <p className="form-error">{errors.subcategory.message}</p>
                  )}
                </div>

                {/* Suggestion Text */}
                <div>
                  <label htmlFor="suggestionText" className="block text-sm font-medium text-ghost-700 mb-2">
                    Your Suggestion *
                  </label>
                  <textarea
                    id="suggestionText"
                    rows={6}
                    placeholder="Describe your suggestion, feedback, or concern in detail..."
                    {...register('suggestionText', {
                      required: 'Please provide your suggestion',
                      minLength: {
                        value: 10,
                        message: 'Suggestion must be at least 10 characters long'
                      },
                      maxLength: {
                        value: 2000,
                        message: 'Suggestion cannot exceed 2000 characters'
                      }
                    })}
                    className={`textarea ${errors.suggestionText ? 'input-error' : ''}`}
                  />
                  {errors.suggestionText && (
                    <p className="form-error">{errors.suggestionText.message}</p>
                  )}
                  <p className="form-help">
                    Be specific and constructive. Your input helps us make better decisions.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base"
                  >
                    {loading ? (
                      <>
                        <div className="spinner-sm mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Suggestion
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-success-600" />
                  <h3 className="font-semibold text-ghost-900">100% Anonymous</h3>
                </div>
              </div>
              <div className="card-body">
                <ul className="space-y-3 text-sm text-ghost-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span>No personal information collected</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span>No IP addresses logged</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span>No cookies or tracking</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span>Complete privacy protection</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-ghost-900">System Overview</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">
                        {stats.totalSuggestions}
                      </div>
                      <div className="text-sm text-primary-700">Total Suggestions</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {stats.statusBreakdown?.slice(0, 4).map((status) => (
                        <div key={status._id} className="text-center p-3 bg-ghost-50 rounded-lg">
                          <div className="text-lg font-semibold text-ghost-700">
                            {status.count}
                          </div>
                          <div className="text-xs text-ghost-600 capitalize">
                            {status._id}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-ghost-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <Link
                  to="/admin/login"
                  className="btn-outline w-full justify-center"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Admin Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionForm;
