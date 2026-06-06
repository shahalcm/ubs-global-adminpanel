import React, { useEffect, useState } from 'react'
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../services/adminService'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Search, Image as ImageIcon, RefreshCw, Link as LinkIcon } from 'lucide-react'

const Banners = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selection / Edit State
  const [editMode, setEditMode] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  
  // Form states
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [position, setPosition] = useState('top')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  const [submitting, setSubmitting] = useState(false)

  const loadBanners = async () => {
    try {
      setLoading(true)
      const data = await getBanners()
      setBanners(data.banners || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const selectBanner = (banner) => {
    setEditMode(true)
    setSelectedBanner(banner)
    setTitle(banner.title || '')
    setLinkUrl(banner.linkUrl || '')
    setPosition(banner.position || 'top')
    setSortOrder(String(banner.sortOrder || 0))
    setIsActive(banner.isActive !== false)
    setImageFile(null)
    setImagePreview(banner.image || '')
  }

  const resetForm = () => {
    setEditMode(false)
    setSelectedBanner(null)
    setTitle('')
    setLinkUrl('')
    setPosition('top')
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
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('linkUrl', linkUrl.trim())
      formData.append('position', position)
      formData.append('sortOrder', sortOrder)
      formData.append('isActive', String(isActive))
      
      if (imageFile) {
        formData.append('image', imageFile)
      } else if (editMode && selectedBanner?.image) {
        formData.append('image', selectedBanner.image)
      }

      if (editMode && selectedBanner) {
        await updateBanner(selectedBanner._id, formData)
        toast.success('Banner updated successfully')
      } else {
        if (!imageFile) {
          toast.error('Image is required for new banners')
          setSubmitting(false)
          return
        }
        await createBanner(formData)
        toast.success('Banner created successfully')
      }
      resetForm()
      loadBanners()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    try {
      await deleteBanner(id)
      toast.success('Banner deleted')
      if (selectedBanner?._id === id) {
        resetForm()
      }
      loadBanners()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete banner')
    }
  }

  // Filter list
  const filteredBanners = banners.filter(banner => 
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Banners & Promotions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage promotional banners displayed in the client application.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Banners List Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Controls */}
          <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <Search className="text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search banners by title..."
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

          {/* Scrollable Banners List */}
          <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-3">
            {loading ? (
              <div className="bg-white dark:bg-dark-card p-12 text-center text-gray-500 rounded-2xl border border-gray-100 dark:border-gray-800">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-primary" />
                <p>Loading banners...</p>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="bg-white dark:bg-dark-card p-12 text-center text-gray-500 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ImageIcon size={32} className="mx-auto mb-3 text-gray-300" />
                <p>{searchQuery ? 'No matching banners found.' : 'No banners available.'}</p>
              </div>
            ) : (
              filteredBanners.map((banner) => {
                const isSelected = selectedBanner?._id === banner._id
                return (
                  <div
                    key={banner._id}
                    onClick={() => selectBanner(banner)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-sm'
                        : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Image Thumbnail */}
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-24 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-24 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      {/* Text info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-bold truncate ${
                          isSelected ? 'text-primary dark:text-accent' : 'text-gray-900 dark:text-white'
                        }`}>
                          {banner.title}
                        </h3>
                        {banner.linkUrl && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 truncate">
                            <LinkIcon size={12} /> {banner.linkUrl}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Position: <span className="capitalize font-semibold text-gray-600 dark:text-gray-300">{banner.position}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                      {/* Indicators & Actions */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          banner.isActive !== false
                            ? 'bg-green-150 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-red-150 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {banner.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Order: {banner.sortOrder || 0}
                        </span>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Banner"
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
              {editMode ? 'Edit Banner' : 'Create Banner'}
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
              
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
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Click to upload banner image</p>
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

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Banner Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="e.g. Eid Mega Sale"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Link URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={submitting}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg/30 px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="e.g. /products/clothing"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={submitting}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card px-4 py-2.5 text-sm text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
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
                {editMode ? 'Save Changes' : 'Create Banner'}
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

export default Banners
