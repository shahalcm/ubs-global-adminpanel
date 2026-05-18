import React, { useEffect, useState } from 'react'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/adminService'
import toast from 'react-hot-toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

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

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createCategory({ name, slug })
      toast.success('Category created')
      setName('')
      setSlug('')
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const handleUpdate = async (category) => {
    const updatedName = window.prompt('Category name', category.name)
    if (updatedName === null) return
    try {
      await updateCategory(category._id, { name: updatedName })
      toast.success('Category updated')
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-6">Categories Management</h1>
        <p className="text-gray-500 mt-1">Create and manage product categories.</p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Category name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="category-slug"
          />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Add Category
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">No categories available.</td>
              </tr>
            ) : categories.map((category) => (
              <tr key={category._id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{category.slug}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleUpdate(category)} className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Edit</button>
                  <button onClick={() => handleDelete(category._id)} className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Categories;
