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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<FAQStats | null>(null);
  const [recentFAQs, setRecentFAQs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Selamat datang di Nodeflux FAQ Admin Panel</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.total_faqs}</h3>
                <p className="text-sm text-gray-600">Total FAQs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.total_categories}</h3>
                <p className="text-sm text-gray-600">Kategori</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.category_breakdown.length}
                </h3>
                <p className="text-sm text-gray-600">Kategori Aktif</p>
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
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah FAQ Baru
          </Link>
          <Link
            to="/admin/categories/new"
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Kategori Baru
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent FAQs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">FAQ Terbaru</h2>
              <Link
                to="/admin/faqs"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Lihat semua →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentFAQs.map((faq) => (
              <div key={faq.id} className="p-4">
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
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/admin/faqs/${faq.id}/edit`}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Kategori</h2>
              <Link
                to="/admin/categories"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Kelola →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {categories.slice(0, 5).map((category) => {
                const faqCount = stats?.category_breakdown.find(
                  (item) => item.category === category.name
                )?.count || 0;

                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i
                        className={`${category.icon} mr-3`}
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
                    <div className="text-sm text-gray-600">
                      {faqCount} FAQ
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;