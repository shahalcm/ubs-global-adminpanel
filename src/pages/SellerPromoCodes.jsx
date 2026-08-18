import React, { useState, useEffect } from 'react'
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode
} from '../services/adminService'
import toast from 'react-hot-toast'
import { 
  Plus, Search, Ticket, Edit3, Trash2, Calendar, CheckCircle, XCircle 
} from 'lucide-react'

const SellerPromoCodes = () => {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Edit / Create Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    regionCode: 'LOW_COST',
    countryCodesString: '',
    maxUses: 10000,
    maxUsesPerSeller: 1,
    startsAt: '',
    expiresAt: '',
    isActive: true
  })

  useEffect(() => {
    loadPromos()
  }, [])

  const loadPromos = async () => {
    try {
      setLoading(true)
      const data = await getPromoCodes()
      setPromos(data.promos || [])
    } catch (err) {
      toast.error('Failed to load promo codes')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setForm({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      regionCode: 'LOW_COST',
      countryCodesString: '',
      maxUses: 10000,
      maxUsesPerSeller: 1,
      startsAt: new Date().toISOString().substring(0, 10),
      expiresAt: '',
      isActive: true
    })
    setShowCreateModal(true)
  }

  const handleOpenEdit = (promo) => {
    setEditingPromo(promo)
    setForm({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      regionCode: promo.regionCode,
      countryCodesString: promo.countryCodes?.join(', ') || '',
      maxUses: promo.maxUses,
      maxUsesPerSeller: promo.maxUsesPerSeller,
      startsAt: promo.startsAt ? new Date(promo.startsAt).toISOString().substring(0, 10) : '',
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().substring(0, 10) : '',
      isActive: promo.isActive
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses),
        maxUsesPerSeller: Number(form.maxUsesPerSeller),
        countryCodes: form.countryCodesString 
          ? form.countryCodesString.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
          : []
      }

      if (editingPromo) {
        await updatePromoCode(editingPromo._id, payload)
        toast.success('Promo code updated successfully')
        setEditingPromo(null)
      } else {
        await createPromoCode(payload)
        toast.success('Promo code created successfully')
        setShowCreateModal(false)
      }
      loadPromos()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete promo code ${code}?`)) return
    try {
      await deletePromoCode(id)
      toast.success('Promo code deleted')
      loadPromos()
    } catch (err) {
      toast.error('Failed to delete promo code')
    }
  }

  // Filtered promos
  const filteredPromos = promos.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = regionFilter ? p.regionCode === regionFilter : true
    const matchesStatus = statusFilter ? String(p.isActive) === statusFilter : true
    return matchesSearch && matchesRegion && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-125">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white">Seller Registration Promo Codes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage promotional discount campaigns for regional seller registrations.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover transition text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md"
        >
          <Plus size={16} />
          Create Promo Code
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Regions</option>
            <option value="HIGH_COST">High Cost</option>
            <option value="MIDDLE_COST">Middle Cost</option>
            <option value="LOW_COST">Low Cost</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      {/* Promos Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Promo Code</th>
                <th className="py-3 px-4">Target Region</th>
                <th className="py-3 px-4">Discount Applied</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Validity Range</th>
                <th className="py-3 px-4">Campaign Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPromos.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-800 flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>{p.code}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                      {p.regionCode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-red-500">
                    {p.discountValue}{p.discountType === 'percentage' ? '%' : ' USD'} {t("OFF")}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-600">
                    {p.usedCount} / <span className="text-gray-400">{p.maxUses}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>
                        {p.startsAt ? new Date(p.startsAt).toLocaleDateString() : 'Immediate'} ➔ {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {p.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-[#2B3674] rounded-lg transition"
                      title="Edit Campaign"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.code)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition"
                      title="Delete Code"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPromos.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">No promotional codes found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Campaign Modal */}
      {(showCreateModal || editingPromo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">
              {editingPromo ? `Edit Coupon: ${form.code}` : 'Create Seller Registration Promo Code'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Coupon Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPromo}
                    placeholder="e.g. UBSLOW60"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold uppercase disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Eligible Region</label>
                  <select
                    value={form.regionCode}
                    onChange={(e) => setForm({ ...form, regionCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="HIGH_COST">High Cost countries</option>
                    <option value="MIDDLE_COST">Middle Cost countries</option>
                    <option value="LOW_COST">Low Cost countries</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Max Total Redemptions</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Max Uses Per Seller</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.maxUsesPerSeller}
                    onChange={(e) => setForm({ ...form, maxUsesPerSeller: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Start Date</label>
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Restrict to Country ISOs (Optional, comma separated)</label>
                <input
                  type="text"
                  placeholder="IN, BD"
                  value={form.countryCodesString}
                  onChange={(e) => setForm({ ...form, countryCodesString: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 font-sans uppercase">Campaign Status</label>
                <select
                  value={String(form.isActive)}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingPromo(null)
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-hover transition font-bold"
                >
                  {submitting ? 'Submitting...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerPromoCodes
