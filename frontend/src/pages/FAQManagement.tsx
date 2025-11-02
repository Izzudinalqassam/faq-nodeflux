import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  Tag,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { faqService, categoryService } from '../services/api';
import type { FAQ, Category } from '../types';
import 'highlight.js/styles/github.css';

const FAQManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFAQs();
    loadCategories();
  }, [searchTerm, selectedCategory, currentPage]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await faqService.getFAQs(params);
      setFaqs(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await faqService.deleteFAQ(id);
      setFaqs(faqs.filter(faq => faq.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || 'fas fa-question-circle';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#2563eb';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
            <p className="mt-2 text-gray-600">Kelola pertanyaan dan jawaban FAQ</p>
          </div>
          <Link
            to="/admin/faqs/new"
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah FAQ
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari FAQ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-10 appearance-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>

          <div className="text-sm text-gray-600 flex items-center justify-center md:justify-end">
            Total: {faqs.length} FAQ
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {faqs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">
              <i className="fas fa-question-circle"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada FAQ ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Mulai dengan menambahkan FAQ baru
            </p>
            <Link
              to="/admin/faqs/new"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah FAQ Pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <div key={faq.id} className="hover:bg-gray-50">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <i
                          className={`${getCategoryIcon(faq.category)} mr-2`}
                          style={{ color: getCategoryColor(faq.category) }}
                        ></i>
                        <span className="text-sm font-medium text-gray-500 capitalize">
                          {faq.category}
                        </span>
                        {faq.tags.length > 0 && (
                          <div className="flex items-center ml-4">
                            <Tag className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">
                              {faq.tags.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {faq.question}
                      </h3>

                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>Dibuat: {new Date(faq.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="mx-2">•</span>
                        <span>Diupdate: {new Date(faq.updated_at).toLocaleDateString('id-ID')}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          {expandedItems.has(faq.id) ? 'Sembunyikan' : 'Lihat'} Jawaban
                        </button>
                      </div>

                      {expandedItems.has(faq.id) && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                            >
                              {faq.answer}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <a
                        href={`/faqs/${faq.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                        title="Lihat di FAQ publik"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <Link
                        to={`/admin/faqs/${faq.id}/edit`}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {deleteConfirm === faq.id && (
                  <div className="px-6 pb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 mb-3">
                        Apakah Anda yakin ingin menghapus FAQ ini?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="btn btn-danger text-sm"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn btn-secondary text-sm"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManagement;