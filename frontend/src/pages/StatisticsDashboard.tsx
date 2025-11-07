import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  FileQuestion,
  Star,
  MessageSquare,
  Paperclip,
  Eye,
  Activity,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown
} from 'lucide-react';

interface StatsData {
  overview: {
    total_faqs: number;
    total_categories: number;
    total_ratings: number;
    total_feedbacks: number;
    total_attachments: number;
  };
  category_breakdown: Array<{ category: string; count: number }>;
  monthly_stats: Array<{ month: string; count: number }>;
  top_rated: Array<{
    id: number;
    question: string;
    category: string;
    avg_rating: number;
    rating_count: number;
  }>;
  most_viewed: Array<{
    id: number;
    question: string;
    category: string;
    view_count: number;
  }>;
  recent_activity: Array<{
    id: number;
    question: string;
    category: string;
    created_at: string;
    updated_at: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const StatisticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, trend?: number) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value.toLocaleString()}</p>
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <p className="text-red-800 dark:text-red-200">Error loading statistics: {error}</p>
          <button
            onClick={fetchStats}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your FAQ system performance</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {renderStatCard(
          'Total FAQs',
          stats.overview.total_faqs,
          <FileQuestion className="h-6 w-6 text-white" />,
          'bg-blue-500'
        )}
        {renderStatCard(
          'Categories',
          stats.overview.total_categories,
          <BarChart3 className="h-6 w-6 text-white" />,
          'bg-green-500'
        )}
        {renderStatCard(
          'Ratings',
          stats.overview.total_ratings,
          <Star className="h-6 w-6 text-white" />,
          'bg-yellow-500'
        )}
        {renderStatCard(
          'Feedbacks',
          stats.overview.total_feedbacks,
          <MessageSquare className="h-6 w-6 text-white" />,
          'bg-purple-500'
        )}
        {renderStatCard(
          'Attachments',
          stats.overview.total_attachments,
          <Paperclip className="h-6 w-6 text-white" />,
          'bg-indigo-500'
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2" />
            FAQs by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.category_breakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.category_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Monthly FAQ Creation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthly_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated FAQs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Top Rated FAQs
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.top_rated} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis
                type="category"
                dataKey="question"
                width={100}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-2">
                        <p className="font-medium text-sm">{data.question}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Rating: {data.avg_rating.toFixed(1)} ({data.rating_count} reviews)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avg_rating" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Viewed FAQs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Most Viewed FAQs
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.most_viewed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="question"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-2">
                        <p className="font-medium text-sm">{data.question}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {data.view_count} views
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="view_count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {stats.recent_activity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.question}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.category} • Created {formatDate(activity.created_at)}
                  {activity.updated_at !== activity.created_at && (
                    <> • Updated {formatDate(activity.updated_at)}</>
                  )}
                </p>
              </div>
              <div className="text-right">
                <a
                  href={`/faqs/${activity.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;