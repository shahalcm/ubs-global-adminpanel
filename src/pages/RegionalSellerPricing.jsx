import React, { useState, useEffect } from 'react'
import {
  getRegionalPricingRules,
  updateRegionalPricingRule,
  getCountries,
  moveCountryToRegion,
  toggleCountryStatus,
  getSellerPricingAnalytics,
  getPricingAuditLogs
} from '../services/adminService'
import toast from 'react-hot-toast'
import { 
  DollarSign, Globe, Edit3, Settings, ShieldAlert, BarChart, 
  Search, Shield, CheckCircle, XCircle, ArrowRightLeft, History
} from 'lucide-react'

const RegionalSellerPricing = () => {
  const [rules, setRules] = useState([])
  const [countries, setCountries] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters for Country list
  const [countrySearch, setCountrySearch] = useState('')
  const [countryRegionFilter, setCountryRegionFilter] = useState('')
  const [countryStatusFilter, setCountryStatusFilter] = useState('')

  // Modals / Edit states
  const [editRule, setEditRule] = useState(null)
  const [savingRule, setSavingRule] = useState(false)
  const [movingCountry, setMovingCountry] = useState(null)
  const [savingCountryMove, setSavingCountryMove] = useState(false)
  const [targetRegion, setTargetRegion] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [rulesData, countriesData, analyticsData, logsData] = await Promise.all([
        getRegionalPricingRules(),
        getCountries(),
        getSellerPricingAnalytics(),
        getPricingAuditLogs()
      ])

      setRules(rulesData.rules || [])
      setCountries(countriesData.countries || [])
      setAnalytics(analyticsData.analytics || null)
      setLogs(logsData.logs || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load seller registration pricing data.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRule = async (e) => {
    e.preventDefault()
    if (!editRule) return

    try {
      setSavingRule(true)
      const updated = await updateRegionalPricingRule(editRule._id, {
        name: editRule.name,
        baseAmount: Number(editRule.baseAmount),
        discountType: editRule.discountType,
        discountValue: Number(editRule.discountValue),
        isActive: editRule.isActive,
        startsAt: editRule.startsAt || undefined,
        expiresAt: editRule.expiresAt || undefined,
        countries: typeof editRule.countries === 'string' 
          ? editRule.countries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
          : editRule.countries
      })

      if (updated.success) {
        toast.success('Regional pricing rule updated successfully!')
        setEditRule(null)
        loadAllData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update rule')
    } finally {
      setSavingRule(false)
    }
  }

  const handleCountryMove = async () => {
    if (!movingCountry || !targetRegion) return

    try {
      setSavingCountryMove(true)
      const res = await moveCountryToRegion(movingCountry._id, targetRegion)
      if (res.success) {
        toast.success(`Moved ${movingCountry.countryName} to ${targetRegion}`)
        setMovingCountry(null)
        setTargetRegion('')
        loadAllData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move country')
    } finally {
      setSavingCountryMove(false)
    }
  }

  const handleToggleCountry = async (id, name) => {
    try {
      const res = await toggleCountryStatus(id)
      if (res.success) {
        toast.success(`${name} status updated successfully`)
        loadAllData()
      }
    } catch (error) {
      toast.error('Failed to update country status')
    }
  }

  // Filtered Countries list
  const filteredCountries = countries.filter(c => {
    const matchesSearch = c.countryName.toLowerCase().includes(countrySearch.toLowerCase()) || 
                          c.countryCode.toLowerCase().includes(countrySearch.toLowerCase())
    const matchesRegion = countryRegionFilter ? c.regionCode === countryRegionFilter : true
    const matchesStatus = countryStatusFilter ? String(c.isActive) === countryStatusFilter : true
    return matchesSearch && matchesRegion && matchesStatus
  })

  // Dynamic calculated pricing final amount
  const calculateFinalAmount = (base, distType, distVal) => {
    const b = Number(base) || 0
    const v = Number(distVal) || 0
    if (distType === 'percentage') {
      return Math.max(0, b - (b * v) / 100).toFixed(2)
    }
    return Math.max(0, b - v).toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-125">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white">Regional Seller Pricing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure global seller registration fees, currency setups, and regional pricing tiers.</p>
        </div>
      </div>

      {/* Analytics Tiers */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['HIGH_COST', 'MIDDLE_COST', 'LOW_COST'].map((regionKey) => {
            const data = analytics.regions[regionKey] || { count: 0, revenue: 0, discounts: 0 }
            const colorClass = regionKey === 'HIGH_COST' ? 'border-red-200 bg-red-50/50' : 
                               regionKey === 'MIDDLE_COST' ? 'border-yellow-200 bg-yellow-50/50' : 
                               'border-green-200 bg-green-50/50'
            const textClass = regionKey === 'HIGH_COST' ? 'text-red-700' : 
                              regionKey === 'MIDDLE_COST' ? 'text-yellow-700' : 
                              'text-green-700'
            return (
              <div key={regionKey} className={`p-6 rounded-2xl border ${colorClass} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${textClass}`}>{regionKey.replace('_', ' ')}</span>
                  <BarChart className={`h-5 w-5 ${textClass}`} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-[#2B3674]">{data.count}</span>
                    <span className="text-xs text-gray-500 font-medium">registered sellers</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 font-semibold border-t pt-2 border-gray-100">
                    <span>Revenue Generated:</span>
                    <span className="text-primary">${data.revenue.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 font-semibold">
                    <span>Total Discounts Given:</span>
                    <span className="text-red-500">${data.discounts.toLocaleString()} USD</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pricing Rules Configuration cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const finalPrice = calculateFinalAmount(rule.baseAmount, rule.discountType, rule.discountValue)
          return (
            <div key={rule._id} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2B3674] text-lg dark:text-white">{rule.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    rule.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-extrabold">{rule.regionCode}</p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Base Registration Fee:</span>
                    <span className="text-sm font-bold text-gray-800">${rule.baseAmount} {rule.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Regional Discount:</span>
                    <span className="text-sm font-bold text-red-500">{rule.discountValue}{rule.discountType === 'percentage' ? '%' : ' Fixed'}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-100 pt-3">
                    <span className="text-sm font-bold text-[#2B3674]">Final Seller Fee:</span>
                    <span className="text-base font-black text-primary">${finalPrice} {rule.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-500">Active Promo Code:</span>
                    <span className="text-xs font-bold text-gray-700">{rule.promoCodeId?.code || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-500">Total Countries Mapped:</span>
                    <span className="text-xs font-bold text-gray-700">{rule.countries?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setEditRule(rule)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-sm text-[#2B3674]"
                >
                  <Edit3 size={15} />
                  Edit Pricing Rule
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section 2: Country Regional Mapping list */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#2B3674] dark:text-white">Country Assignment Panel</h2>
            <p className="text-sm text-gray-500">Manage country-region pricing groups. Changes will automatically apply to future registration offers.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none w-full md:w-60"
              />
            </div>

            <select
              value={countryRegionFilter}
              onChange={(e) => setCountryRegionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Regions</option>
              <option value="HIGH_COST">High Cost</option>
              <option value="MIDDLE_COST">Middle Cost</option>
              <option value="LOW_COST">Low Cost</option>
            </select>

            <select
              value={countryStatusFilter}
              onChange={(e) => setCountryStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        {/* Table of countries */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Country Code</th>
                <th className="py-3 px-4">Country Name</th>
                <th className="py-3 px-4">Region Assigned</th>
                <th className="py-3 px-4">Eligibility Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredCountries.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-800">{c.countryCode}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#2B3674]">{c.countryName}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.regionCode === 'HIGH_COST' ? 'bg-red-50 text-red-700' :
                      c.regionCode === 'MIDDLE_COST' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {c.regionCode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button 
                      onClick={() => handleToggleCountry(c._id, c.countryName)}
                      className="flex items-center gap-1.5"
                    >
                      {c.isActive ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-xs font-bold text-green-700">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-500" />
                          <span className="text-xs font-bold text-red-700">Disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setMovingCountry(c)
                        setTargetRegion(c.regionCode)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition text-[#2B3674] text-xs font-bold rounded-lg"
                    >
                      <ArrowRightLeft size={13} />
                      Move Region
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCountries.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">No countries found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Change Audit Logs */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-bold text-[#2B3674] dark:text-white">Pricing Audit History</h2>
        </div>
        
        <div className="overflow-y-auto max-h-75">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-[#2B3674]">
                    {log.adminName} <span className="text-gray-400 font-semibold">({log.action})</span>
                  </p>
                  <p className="text-gray-600 font-medium">
                    Changed <span className="font-bold">{log.target}</span> {log.fieldChanged || 'configuration'}:
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold">
                      {typeof log.oldValue === 'object' ? JSON.stringify(log.oldValue) : String(log.oldValue)}
                    </span>
                    <span className="text-gray-400">➔</span>
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold">
                      {typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-gray-400 font-semibold self-start md:self-center">
                  <p>{new Date(log.createdAt).toLocaleString()}</p>
                  {log.ipAddress && <p className="text-[10px] text-gray-400 font-mono mt-0.5">IP: {log.ipAddress}</p>}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center py-6 text-gray-400">No pricing changes recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Rule Edit Modal */}
      {editRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#2B3674] mb-4">Edit {editRule.name} Tiers</h3>
            
            <form onSubmit={handleUpdateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Rule Name</label>
                <input
                  type="text"
                  required
                  value={editRule.name}
                  onChange={(e) => setEditRule({ ...editRule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Base Fee (USD)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editRule.baseAmount}
                    onChange={(e) => setEditRule({ ...editRule, baseAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Discount Type</label>
                  <select
                    value={editRule.discountType}
                    onChange={(e) => setEditRule({ ...editRule, discountType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editRule.discountValue}
                    onChange={(e) => setEditRule({ ...editRule, discountValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Rule Status</label>
                  <select
                    value={String(editRule.isActive)}
                    onChange={(e) => setEditRule({ ...editRule, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Calculated Final Amount</label>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-primary">
                  ${calculateFinalAmount(editRule.baseAmount, editRule.discountType, editRule.discountValue)} USD
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Country ISO Codes (comma separated)</label>
                <textarea
                  value={Array.isArray(editRule.countries) ? editRule.countries.join(', ') : editRule.countries}
                  onChange={(e) => setEditRule({ ...editRule, countries: e.target.value })}
                  placeholder="IN, BD, PK"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs uppercase"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditRule(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-hover transition font-bold"
                >
                  {savingRule ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Country Modal */}
      {movingCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-[#2B3674] mb-3">Reassign Region</h3>
            <p className="text-xs text-gray-500 mb-4">Select target pricing region group for <span className="font-bold text-gray-800">{movingCountry.countryName}</span>.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Target Pricing Region</label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="HIGH_COST">High Cost countries</option>
                  <option value="MIDDLE_COST">Middle Cost countries</option>
                  <option value="LOW_COST">Low Cost countries</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setMovingCountry(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCountryMove}
                  disabled={savingCountryMove}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary-hover transition font-bold"
                >
                  {savingCountryMove ? 'Moving...' : 'Confirm Move'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegionalSellerPricing
