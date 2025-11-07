import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Tag,
  TrendingUp,
  Plus,
  Eye,
  Edit,
} from 'lucide-react';
import { faqService, categoryService, statsService } from '../services/api';
import type { FAQ, Category, FAQStats } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import { LoadingSkeleton, StatsCardSkeleton } from '../components/LoadingSkeleton';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<FAQStats | null>(null);
  const [recentFAQs, setRecentFAQs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, faqsData, categoriesData] = await Promise.all([
        statsService.getStats(),
        faqService.getFAQs({ per_page: 5 }),
        categoryService.getCategories()
      ]);

      setStats(statsData);
      setRecentFAQs(faqsData.data);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-48 mb-2" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <LoadingSkeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <LoadingSkeleton className="h-6 w-32 mb-4 p-6" />
            <div className="space-y-3 p-6">
              {[1, 2, 3].map(i => (
                <LoadingSkeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <LoadingSkeleton className="h-6 w-32 mb-4 p-6" />
            <div className="space-y-3 p-6">
              {[1, 2, 3].map(i => (
                <LoadingSkeleton key={i} className="h-12" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Try Again
            </button>
            
            <Link
              to="/admin/faqs"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              View FAQs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Selamat datang di Nodeflux FAQ Admin Panel</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.overview?.total_faqs || 0}</h3>
                  <p className="text-sm text-gray-600">Total FAQs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.overview?.total_categories || 0}</h3>
                  <p className="text-sm text-gray-600">Kategori</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.overview?.total_ratings || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Total Rating</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/faqs/new"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah FAQ Baru
            </Link>
            <Link
              to="/admin/categories/new"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Kategori Baru
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent FAQs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">FAQ Terbaru</h2>
                <Link
                  to="/admin/faqs"
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  Lihat semua
                  <Edit className="h-3 w-3 ml-1 transform rotate-180" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentFAQs.length > 0 ? (
                recentFAQs.map((faq) => (
                  <div key={faq.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Kategori: <span className="capitalize">{faq.category}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(faq.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/faqs/${faq.id}`}
                          target="_blank"
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/faqs/${faq.id}/edit`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Belum ada FAQ</p>
                  <p className="text-xs text-gray-400 mt-1">Mulai dengan menambah FAQ pertama Anda</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Kategori</h2>
                <Link
                  to="/admin/categories"
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  Kelola
                  <Edit className="h-3 w-3 ml-1 transform rotate-180" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {categories.length > 0 ? (
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => {
                    // Count FAQs for this category from recentFAQs since category_breakdown is empty
                    const faqCount = recentFAQs.filter(faq => faq.category === category.name).length;

                    return (
                      <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <i
                            className={`${category.icon} mr-3 text-lg`}
                            style={{ color: category.color }}
                          ></i>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                          {faqCount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Belum ada kategori</p>
                  <p className="text-xs text-gray-400 mt-1">Buat kategori untuk mengorganisir FAQ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
