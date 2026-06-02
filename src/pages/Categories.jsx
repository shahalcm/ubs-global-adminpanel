import React, { useEffect, useState } from 'react'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/adminService'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Search, Image as ImageIcon, Check, RefreshCw } from 'lucide-react'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selection / Edit State
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

  // Auto-slugify in Create Mode
  useEffect(() => {
    if (!editMode) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [name, editMode])

  const selectCategory = (category) => {
    setEditMode(true)
    setSelectedCategory(category)
    setName(category.name || '')
    setSlug(category.slug || '')
    setDescription(category.description || '')
    setSortOrder(String(category.sortOrder || 0))
    setIsActive(category.isActive !== false)
    setImageFile(null)
    setImagePreview(category.image || '')
  }

  const resetForm = () => {
    setEditMode(false)
    setSelectedCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setSortOrder('0')
    setIsActive(true)
    setImageFile(null)
    setImagePreview('')
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
      resetForm()
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
      if (selectedCategory?._id === id) {
        resetForm()
      }
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  // Filter list
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Categories Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and update your product classifications.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Categories List Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Controls */}
          <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <Search className="text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search categories by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent border-none focus:outline-none dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scrollable Categories List */}
          <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-3">
            {loading ? (
              <div className="bg-white dark:bg-dark-card p-12 text-center text-gray-500 rounded-2xl border border-gray-100 dark:border-gray-800">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-primary" />
                <p>Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-white dark:bg-dark-card p-12 text-center text-gray-500 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ImageIcon size={32} className="mx-auto mb-3 text-gray-300" />
                <p>{searchQuery ? 'No matching categories found.' : 'No categories available.'}</p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = selectedCategory?._id === category._id
                return (
                  <div
                    key={category._id}
                    onClick={() => selectCategory(category)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-sm'
                        : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      {/* Text info */}
                      <div>
                        <h3 className={`text-base font-bold ${
                          isSelected ? 'text-primary dark:text-accent' : 'text-gray-900 dark:text-white'
                        }`}>
                          {category.name}
                        </h3>
                        <p className={`text-xs mt-0.5 ${
                          isSelected ? 'text-primary/80 dark:text-accent/80' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          slug: {category.slug}
                        </p>
                        {category.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1" style={{ maxWidth: '300px' }}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                      {/* Indicators & Actions */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          category.isActive !== false
                            ? 'bg-green-150 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-red-150 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {category.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Order: {category.sortOrder || 0}
                        </span>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="sticky top-6 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editMode ? 'Edit Category' : 'Create Category'}
            </h2>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-primary dark:text-accent hover:underline"
              >
                Reset to Create
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Image</label>
              
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-accent bg-gray-50 dark:bg-gray-850/20 cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="text-gray-400 mb-2" size={24} />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Click to upload category image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
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
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="e.g. Textiles & Fabric"
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
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="e.g. textiles-fabric"
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
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                placeholder="Brief summary..."
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={submitting}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="0"
              />
            </div>

            {/* Toggle switch for active status */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/10 rounded-xl">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={submitting}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {editMode ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Icon fallbacks inside code
const XIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export default Categories;
