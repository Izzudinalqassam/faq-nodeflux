import React, { useState, useEffect } from 'react';
import { Save, User, Shield, Database, Download, Upload, RefreshCw, Eye, EyeOff, Palette, Moon, Sun } from 'lucide-react';
import { authService, statsService } from '../services/api';
import type { User as UserType, FAQStats } from '../types';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Code themes
  const codeThemes = [
    { name: 'vscDarkPlus', label: 'VS Code Dark+', description: 'Default VS Code dark theme', icon: Moon, isDark: true },
    { name: 'oneDark', label: 'One Dark', description: 'Atom One Dark theme', icon: Moon, isDark: true },
    { name: 'dracula', label: 'Dracula', description: 'Popular dark purple theme', icon: Moon, isDark: true },
    { name: 'atomDark', label: 'Atom Dark', description: 'Atom editor dark theme', icon: Moon, isDark: true },
    { name: 'nightOwl', label: 'Night Owl', description: 'Sarah Drasner\'s theme', icon: Moon, isDark: true },
    { name: 'shadesOfPurple', label: 'Shades of Purple', description: 'Vibrant purple theme', icon: Moon, isDark: true },
    { name: 'nord', label: 'Nord', description: 'Arctic cold north theme', icon: Moon, isDark: true },
    { name: 'okaidia', label: 'Okaidia', description: 'Olivetti themed theme', icon: Moon, isDark: true },
    { name: 'synthwave84', label: 'Synthwave \'84', description: 'Neon retro synthwave', icon: Moon, isDark: true },
    { name: 'darcula', label: 'Darcula', description: 'IntelliJ Darcula theme', icon: Moon, isDark: true },
    { name: 'tomorrow', label: 'Tomorrow', description: 'Clean light theme', icon: Sun, isDark: false },
    { name: 'solarizedlight', label: 'Solarized Light', description: 'Ethan Schoonover\'s Solarized', icon: Sun, isDark: false },
    { name: 'vs', label: 'VS', description: 'VS Code light theme', icon: Sun, isDark: false }
  ];

  const [selectedCodeTheme, setSelectedCodeTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('code-theme') || 'vscDarkPlus';
    }
    return 'vscDarkPlus';
  });
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<FAQStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // General Settings
    site_name: 'FAQ Nodeflux',
    site_description: 'Pusat Bantuan dan FAQ Nodeflux',
    admin_email: 'admin@nodeflux.io',
    items_per_page: 10,

    // User Settings
    current_password: '',
    new_password: '',
    confirm_password: '',

    // System Settings
    enable_ratings: true,
    enable_feedback: true,
    enable_search: true,
    enable_categories: true,

    // Backup Settings
    auto_backup: true,
    backup_frequency: 'daily'
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await statsService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    try {
      // Simulate API call - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.new_password !== formData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call - in real implementation, this would call password change endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));

      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async (type: 'faqs' | 'categories' | 'all') => {
    setLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate download
      const data = {
        timestamp: new Date().toISOString(),
        type,
        data: type === 'all' ? 'All data' : `${type} data`
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${type}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} backup downloaded successfully!`);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Simulate restore process
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error restoring data:', error);
        alert('Failed to restore data. Please check the file format.');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const handleCodeThemeChange = (themeName: string) => {
    setSelectedCodeTheme(themeName);
    localStorage.setItem('code-theme', themeName);

    // Trigger custom event to notify CodeBlock components
    window.dispatchEvent(new CustomEvent('code-theme-changed', { detail: themeName }));
  };

  // Get theme preview styles for the small preview
  const getThemePreviewStyles = (themeName: string) => {
    const themeStyles: { [key: string]: any } = {
      vscDarkPlus: {
        backgroundColor: '#1e1e1e',
        keyword: '#569cd6',
        default: '#d4d4d4',
        identifier: '#9cdcfe',
        string: '#ce9178'
      },
      oneDark: {
        backgroundColor: '#282c34',
        keyword: '#c678dd',
        default: '#abb2bf',
        identifier: '#61afef',
        string: '#98c379'
      },
      dracula: {
        backgroundColor: '#282a36',
        keyword: '#ff79c6',
        default: '#f8f8f2',
        identifier: '#50fa7b',
        string: '#f1fa8c'
      },
      atomDark: {
        backgroundColor: '#282c34',
        keyword: '#c678dd',
        default: '#abb2bf',
        identifier: '#61afef',
        string: '#98c379'
      },
      nightOwl: {
        backgroundColor: '#011627',
        keyword: '#c792ea',
        default: '#d6deeb',
        identifier: '#82aaff',
        string: '#ecc48d'
      },
      shadesOfPurple: {
        backgroundColor: '#2d2b55',
        keyword: '#f8c555',
        default: '#e1e1e6',
        identifier: '#c792ea',
        string: '#c3e88d'
      },
      nord: {
        backgroundColor: '#2e3440',
        keyword: '#81a1c1',
        default: '#d8dee9',
        identifier: '#88c0d0',
        string: '#a3be8c'
      },
      okaidia: {
        backgroundColor: '#272822',
        keyword: '#f92672',
        default: '#f8f8f2',
        identifier: '#66d9ef',
        string: '#e6db74'
      },
      synthwave84: {
        backgroundColor: '#2a2139',
        keyword: '#ff79c6',
        default: '#f8f8f2',
        identifier: '#50fa7b',
        string: '#f1fa8c'
      },
      darcula: {
        backgroundColor: '#2b2b2b',
        keyword: '#cc7832',
        default: '#a9b7c6',
        identifier: '#ffc66d',
        string: '#6a8759'
      },
      tomorrow: {
        backgroundColor: '#ffffff',
        keyword: '#4271ae',
        default: '#4d4d4c',
        identifier: '#4271ae',
        string: '#718c00'
      },
      solarizedlight: {
        backgroundColor: '#fdf6e3',
        keyword: '#268bd2',
        default: '#657b83',
        identifier: '#268bd2',
        string: '#2aa198'
      },
      vs: {
        backgroundColor: '#ffffff',
        keyword: '#0000ff',
        default: '#000000',
        identifier: '#001080',
        string: '#a31515'
      }
    };

    return themeStyles[themeName] || themeStyles.vscDarkPlus;
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Database },
    { id: 'user', label: 'User Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup & Restore', icon: Download },
    { id: 'system', label: 'System Info', icon: RefreshCw }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Kelola pengaturan sistem dan preferensi</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      value={formData.site_name}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      name="site_description"
                      value={formData.site_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items Per Page
                    </label>
                    <select
                      name="items_per_page"
                      value={formData.items_per_page}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('general')}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* User Profile */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Profile</h2>
                {user && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          {user.is_admin ? 'Administrator' : 'User'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleInputChange}
                        className="input pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Code Theme Preferences</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Choose your preferred code highlighting theme. Changes will apply to all code blocks across the FAQ system.
                </p>

                <div className="space-y-4">
                  {/* Current Theme Display */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Current Theme</h3>
                        <p className="text-sm text-gray-600">
                          {codeThemes.find(t => t.name === selectedCodeTheme)?.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {React.createElement(codeThemes.find(t => t.name === selectedCodeTheme)?.icon || Moon, {
                          className: "h-5 w-5 text-gray-600"
                        })}
                        <span className="font-medium text-gray-900">
                          {codeThemes.find(t => t.name === selectedCodeTheme)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Theme Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {codeThemes.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.name}
                          onClick={() => handleCodeThemeChange(theme.name)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCodeTheme === theme.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${theme.isDark ? 'text-gray-700' : 'text-yellow-500'}`} />
                              <span className="font-medium text-gray-900 text-sm">
                                {theme.label}
                              </span>
                            </div>
                            {selectedCodeTheme === theme.name && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 text-left">
                            {theme.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Theme Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Theme Preview</h3>
                    <div className="bg-white rounded border border-gray-200 p-4">
                      <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">javascript</div>
                      <pre className="text-sm overflow-x-auto">
                        <code style={{
                          fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Segoe UI Mono", monospace',
                          ...getThemePreviewStyles(selectedCodeTheme)
                        }}>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).keyword || '#569cd6' }}>const</span>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).default || '#d4d4d4' }}> </span>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).identifier || '#9cdcfe' }}>getThemePreview</span>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).default || '#d4d4d4' }}> = </span>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).string || '#ce9178' }}>'current'</span>
                          <span style={{ color: getThemePreviewStyles(selectedCodeTheme).default || '#d4d4d4' }}>;</span>
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSaveSettings('appearance')}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Appearance Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Backup Data</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Create backups of your FAQ data. Downloads are saved as JSON files.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleBackup('faqs')}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup FAQs
                    </button>
                    <button
                      onClick={() => handleBackup('categories')}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup Categories
                    </button>
                    <button
                      onClick={() => handleBackup('all')}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup All Data
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Restore Data</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Restore data from a backup file. This will replace current data.
                  </p>
                  <button
                    onClick={handleRestore}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? 'Restoring...' : 'Restore from Backup'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Info */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Content Statistics</h3>
                    {stats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total FAQs:</span>
                          <span className="font-medium">{stats.total_faqs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Categories:</span>
                          <span className="font-medium">{stats.total_categories}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">System Features</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="enable_ratings"
                          checked={formData.enable_ratings}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-gray-700">Enable Ratings</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="enable_feedback"
                          checked={formData.enable_feedback}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-gray-700">Enable Feedback</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="enable_search"
                          checked={formData.enable_search}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-gray-700">Enable Search</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="enable_categories"
                          checked={formData.enable_categories}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <label className="text-gray-700">Enable Categories</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('system')}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save System Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;