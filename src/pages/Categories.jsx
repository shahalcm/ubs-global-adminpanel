import React, { useEffect, useState } from 'react'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/adminService'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  const [submitting, setSubmitting] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getAdminCategories()
      setCategories(data.categories || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Auto-slugify
  useEffect(() => {
    if (!editMode) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [name, editMode])

  const openAddModal = () => {
    setEditMode(false)
    setSelectedCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setSortOrder('0')
    setIsActive(true)
    setImageFile(null)
    setImagePreview('')
    setIsModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditMode(true)
    setSelectedCategory(category)
    setName(category.name || '')
    setSlug(category.slug || '')
    setDescription(category.description || '')
    setSortOrder(String(category.sortOrder || 0))
    setIsActive(category.isActive !== false)
    setImageFile(null)
    setImagePreview(category.image || '')
    setIsModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('slug', slug.trim())
      formData.append('description', description.trim())
      formData.append('sortOrder', sortOrder)
      formData.append('isActive', String(isActive))
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (editMode && selectedCategory) {
        await updateCategory(selectedCategory._id, formData)
        toast.success('Category updated successfully')
      } else {
        await createCategory(formData)
        toast.success('Category created successfully')
      }
      setIsModalOpen(false)
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All products under this category might lose their category reference.')) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Categories Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage product categories.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:opacity-90 px-4 py-3 text-sm font-semibold text-white transition-opacity cursor-pointer"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No categories available. Click "Add Category" to get started.</td>
                </tr>
              ) : categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{category.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity" onClick={() => !submitting && setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500/75 dark:bg-black/80"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Content */}
            <div className="inline-block align-bottom bg-white dark:bg-dark-card rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editMode ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 flex items-center justify-center">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview('')
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-center text-gray-400">
                        <ImageIcon size={24} />
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                        <Upload size={16} />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG or WEBP up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
                    placeholder="e.g. Industrial Machinery"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    disabled={submitting}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
                    placeholder="e.g. industrial-machinery"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                    rows={3}
                    className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary focus:outline-none resize-none"
                    placeholder="Category description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      disabled={submitting}
                      className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex flex-col justify-end pb-2">
                    <label className="inline-flex items-center cursor-pointer gap-2 select-none">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        disabled={submitting}
                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Status</span>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    {editMode ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories;
