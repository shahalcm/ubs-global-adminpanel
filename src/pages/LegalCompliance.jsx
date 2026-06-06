import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  ShieldAlert,
  FileText,
  UserX,
  Database,
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Save,
  Eye,
  Columns,
  Sparkles,
  Inbox
} from 'lucide-react'
import {
  getLegalDoc,
  updateLegalDoc,
  getGDPRRequests,
  updateGDPRRequest
} from '../services/complianceService'

// Custom Markdown parser helper for CMS Live Preview
const parseMarkdownToHTML = (md) => {
  if (!md) return '';
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-xl font-extrabold text-[#2B3674] dark:text-white mt-6 mb-3 border-b border-gray-200 dark:border-gray-800 pb-1.5">$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-bold text-[#2B3674] dark:text-white mt-5 mb-2">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-md font-bold text-gray-850 dark:text-gray-200 mt-4 mb-2">$1</h3>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');

  // Lists
  html = html.replace(/^[\-\*•]\s+(.+)$/gm, '<li class="ml-4 list-disc text-sm text-gray-700 dark:text-gray-300 my-1">$1</li>');

  // Paragraph blocks
  const blocks = html.split('\n\n');
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) {
      return block;
    }
    return `<p class="mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">${block}</p>`;
  });

  return formattedBlocks.join('\n');
};

export default function LegalCompliance() {
  const [activeTab, setActiveTab] = useState('editor')
  
  // Editor Layout State
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [splitView, setSplitView] = useState(true) // side-by-side splits

  // Editor Document State
  const [selectedKey, setSelectedKey] = useState('privacy-policy')
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [editorLoading, setEditorLoading] = useState(false)

  // Requests Queue & Stats States
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [filters, setFilters] = useState({ requestType: '', status: '', page: 1, limit: 10 })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [stats, setStats] = useState({
    total: 0,
    pendingDeletions: 0,
    pendingExports: 0,
    completed: 0
  })
  
  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminNoteInput, setAdminNoteInput] = useState('')
  const [processingId, setProcessingId] = useState(null)

  // Load selected document for editor
  useEffect(() => {
    loadLegalDoc()
  }, [selectedKey])

  // Load requests on tab switch or filter change
  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests()
      fetchStats()
    }
  }, [activeTab, filters.requestType, filters.status, filters.page])

  const loadLegalDoc = async () => {
    try {
      setEditorLoading(true)
      const res = await getLegalDoc(selectedKey)
      if (res.success && res.legalDoc) {
        setDocTitle(res.legalDoc.title)
        setDocContent(res.legalDoc.content)
      }
    } catch (err) {
      toast.error('Failed to load document content.')
    } finally {
      setEditorLoading(false)
    }
  }

  const handleSaveDoc = async (e) => {
    if (e) e.preventDefault()
    if (!docTitle.trim() || !docContent.trim()) {
      toast.error('Title and content are required.')
      return
    }

    try {
      setEditorLoading(true)
      const res = await updateLegalDoc(selectedKey, { title: docTitle, content: docContent })
      if (res.success) {
        toast.success(`${res.legalDoc.title} updated successfully!`)
      }
    } catch (err) {
      toast.error('Failed to save document updates.')
    } finally {
      setEditorLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      setRequestsLoading(true)
      const res = await getGDPRRequests({
        requestType: filters.requestType || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit
      })
      if (res.success) {
        setRequests(res.requests)
        setPagination(res.pagination)
      }
    } catch (err) {
      toast.error('Could not load GDPR queue.')
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await getGDPRRequests({ limit: 1000 })
      if (res.success && res.requests) {
        const reqs = res.requests
        const total = reqs.length
        const pendingDeletions = reqs.filter(r => (r.status === 'pending' || r.status === 'processing') && (r.requestType === 'delete-account' || r.requestType === 'delete-data')).length
        const pendingExports = reqs.filter(r => (r.status === 'pending' || r.status === 'processing') && r.requestType === 'export-data').length
        const completed = reqs.filter(r => r.status === 'completed').length
        setStats({ total, pendingDeletions, pendingExports, completed })
      }
    } catch (e) {
      console.error('Error fetching compliance counts:', e)
    }
  }

  const handleProcessRequest = async (id, newStatus) => {
    try {
      setProcessingId(id)
      const res = await updateGDPRRequest(id, {
        status: newStatus,
        adminNote: adminNoteInput || undefined
      })
      if (res.success) {
        toast.success(`Request status updated to ${newStatus}`)
        setSelectedRequest(null)
        setAdminNoteInput('')
        loadRequests()
        fetchStats()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request state.')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 flex items-center w-fit gap-1"><CheckCircle size={12} /> Completed</span>
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 flex items-center w-fit gap-1"><XCircle size={12} /> Cancelled</span>
      case 'processing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 flex items-center w-fit gap-1"><Clock size={12} /> Processing</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 flex items-center w-fit gap-1"><Clock size={12} /> Pending</span>
    }
  }

  const getRequestTypeBadge = (type) => {
    switch (type) {
      case 'delete-account':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 flex items-center w-fit gap-1"><UserX size={12} /> Profile Deletion</span>
      case 'export-data':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 flex items-center w-fit gap-1"><ArrowDownToLine size={12} /> Data Export</span>
      case 'delete-data':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 flex items-center w-fit gap-1"><Database size={12} /> GDPR Purge</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400 flex items-center w-fit gap-1"><HelpCircle size={12} /> Request</span>
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 dark:bg-slate-900 min-h-screen">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-primary dark:text-indigo-400" size={26} /> Legal & Compliance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage legal agreements, privacy policies, GDPR inquiries, and account deletion requests.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-slate-700 text-[#2B3674] dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-[#2B3674] dark:hover:text-white'
            }`}
          >
            Legal Editor
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-700 text-[#2B3674] dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-[#2B3674] dark:hover:text-white'
            }`}
          >
            GDPR Queue
          </button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document selection panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm space-y-2 h-fit">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">Select Document</h3>
            {[
              { key: 'privacy-policy', label: 'Privacy Policy' },
              { key: 'terms-and-conditions', label: 'Terms & Conditions' },
              { key: 'refund-policy', label: 'Refund Policy' },
              { key: 'account-deletion-policy', label: 'Account Deletion Policy' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setSelectedKey(item.key)
                  setIsPreviewMode(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                  selectedKey === item.key
                    ? 'bg-primary/5 dark:bg-primary/10 text-primary dark:text-indigo-400'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#2B3674] dark:hover:text-white'
                }`}
              >
                <FileText size={16} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Document editing area */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-primary/5 dark:bg-primary/10 rounded-lg text-primary dark:text-indigo-400">
                  <FileText size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#2B3674] dark:text-white capitalize">
                    {selectedKey.replace(/-/g, ' ')}
                  </h2>
                  <p className="text-xs text-gray-400">Configure formatting via markdown live.</p>
                </div>
              </div>

              {/* Layout Mode Segmented Control */}
              <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl shadow-sm text-xs font-semibold border dark:border-white/5 self-start">
                <button
                  type="button"
                  onClick={() => { setIsPreviewMode(false); setSplitView(false); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    !isPreviewMode && !splitView
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-850 dark:hover:text-white'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPreviewMode(false); setSplitView(true); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    !isPreviewMode && splitView
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-850 dark:hover:text-white'
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPreviewMode(true); setSplitView(false); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isPreviewMode
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-slate-850 dark:hover:text-white'
                  }`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            {editorLoading ? (
              <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-400 mt-2">Loading document content...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mode: Live Preview Only */}
                {isPreviewMode && (
                  <div className="p-6 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-white/10 min-h-[400px] max-h-[500px] overflow-y-auto shadow-sm">
                    <h1 className="text-2xl font-extrabold text-[#2B3674] dark:text-white mb-6 border-b pb-2 dark:border-slate-800">{docTitle}</h1>
                    <div 
                      className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(docContent) }}
                    />
                  </div>
                )}

                {/* Mode: Side-By-Side Split View */}
                {!isPreviewMode && splitView && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Form */}
                    <div className="space-y-4 border-r border-gray-100 dark:border-white/5 pr-0 md:pr-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Document Title</label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="Document Title"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2">
                          Markdown Contents <Sparkles size={12} className="text-amber-500" />
                        </label>
                        <textarea
                          value={docContent}
                          onChange={(e) => setDocContent(e.target.value)}
                          placeholder="Enter document text content..."
                          rows={14}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary text-sm font-medium leading-relaxed font-mono"
                        />
                      </div>
                    </div>

                    {/* Right Live Preview Panel */}
                    <div className="p-6 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-white/10 max-h-[515px] overflow-y-auto shadow-sm">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Live Markdown Preview</h3>
                      <h1 className="text-xl font-extrabold text-[#2B3674] dark:text-white mb-4 pb-2 border-b dark:border-slate-800">{docTitle || 'Untitled Document'}</h1>
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(docContent) }}
                      />
                    </div>
                  </div>
                )}

                {/* Mode: Editor Only */}
                {!isPreviewMode && !splitView && (
                  <form onSubmit={handleSaveDoc} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Document Title</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="Document Title"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Content (Plain text with formatting)</label>
                      <textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        placeholder="Enter document text content..."
                        rows={12}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary text-sm leading-relaxed"
                      />
                    </div>
                  </form>
                )}

                {/* Save button panel */}
                {!isPreviewMode && (
                  <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={handleSaveDoc}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-opacity-90 rounded-xl shadow-md transition-all"
                    >
                      <Save size={16} /> Save Document
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Summary KPI Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Requests</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#2B3674] dark:text-white">{stats.total}</span>
                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Inbox size={18} /></span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Deletions Pending</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#2B3674] dark:text-white">{stats.pendingDeletions}</span>
                <span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><UserX size={18} /></span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Exports Pending</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#2B3674] dark:text-white">{stats.pendingExports}</span>
                <span className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg"><ArrowDownToLine size={18} /></span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Resolved Requests</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#2B3674] dark:text-white">{stats.completed}</span>
                <span className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle size={18} /></span>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Request Type</label>
              <select
                value={filters.requestType}
                onChange={(e) => setFilters({ ...filters, requestType: e.target.value, page: 1 })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none text-sm font-semibold"
              >
                <option value="">All Types</option>
                <option value="delete-account">Profile Deletion (Soft)</option>
                <option value="export-data">GDPR Data Export</option>
                <option value="delete-data">GDPR Hard Purge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-slate-900 dark:text-white focus:outline-none text-sm font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ requestType: '', status: '', page: 1, limit: 10 })
                }}
                className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-[#2B3674] dark:text-white border border-gray-200 dark:border-white/10 rounded-xl transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Queue List Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            {requestsLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Request Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date Requested</th>
                      <th className="py-4 px-6">Admin Note</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                    {Array(filters.limit).fill(0).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                            <div className="h-3 bg-gray-150 dark:bg-gray-850 rounded w-16"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-24"></div></td>
                        <td className="py-4 px-6"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                        <td className="py-4 px-6 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-20 ml-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-850/50">
                <ShieldAlert className="mx-auto text-gray-300 dark:text-white/20 mb-4 animate-bounce" size={48} />
                <h3 className="text-lg font-bold text-[#2B3674] dark:text-white">Queue is Empty</h3>
                <p className="text-sm text-gray-450 mt-1">No pending legal or GDPR requests match your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Request Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date Requested</th>
                      <th className="py-4 px-6">Admin Note</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                    {requests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.userId?.avatar || 'https://via.placeholder.com/150'}
                              alt="User"
                              className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/10 shadow-sm"
                            />
                            <div>
                              <p className="font-bold text-[#2B3674] dark:text-white">
                                {request.userId?.name || 'Deleted User'}
                                {request.userId?.isDeleted && <span className="ml-2 text-xs text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">Deleted</span>}
                              </p>
                              <p className="text-xs text-gray-400">{request.userId?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">{getRequestTypeBadge(request.requestType)}</td>
                        <td className="py-4 px-6">{getStatusBadge(request.status)}</td>
                        <td className="py-4 px-6 text-gray-550 dark:text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate text-gray-500 italic">
                          {request.adminNote || <span className="text-gray-300 dark:text-gray-600">None</span>}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {request.status !== 'completed' && request.status !== 'cancelled' ? (
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setAdminNoteInput(request.adminNote || '')
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-opacity-90 rounded-lg shadow-sm transition-all"
                            >
                              Process
                            </button>
                          ) : (
                            <span className="text-xs text-gray-350 dark:text-gray-550 font-bold uppercase tracking-wider">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!requestsLoading && pagination.pages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-white/10 bg-slate-50 dark:bg-slate-850">
                <span className="text-xs text-gray-400 font-semibold">
                  Showing Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                    className="px-3 py-1 text-xs font-bold rounded-md border border-gray-200 dark:border-white/10 dark:text-white bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                    className="px-3 py-1 text-xs font-bold rounded-md border border-gray-200 dark:border-white/10 dark:text-white bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Processing Overlay Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/5 space-y-5 mx-4 transform scale-100 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#2B3674] dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="text-amber-500" size={20} /> Process GDPR Request
              </h3>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setAdminNoteInput('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold">Request details</p>
                <p className="text-gray-700 dark:text-gray-200">
                  Type: <strong className="text-primary dark:text-indigo-400 capitalize">{selectedRequest.requestType.replace(/-/g, ' ')}</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  User: <strong>{selectedRequest.userId?.name || 'Deleted User'}</strong> ({selectedRequest.userId?.email || 'N/A'})
                </p>
              </div>

              {selectedRequest.requestType === 'delete-data' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 rounded-xl text-xs font-semibold leading-relaxed border border-rose-100 dark:border-rose-900/30">
                  ⚠️ <strong>HARD PURGE WARNING:</strong> Completing this request executes a complete erase. All user database records (Seller store, products listed, reviews, tokens, messages, notifications) will be permanently purged.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase">Administrator Notes / Logs</label>
              <textarea
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Specify logs, audit details, or processing description..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 dark:bg-slate-950 dark:text-white focus:outline-none rounded-xl text-sm leading-relaxed"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => handleProcessRequest(selectedRequest._id, 'cancelled')}
                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all"
                disabled={processingId !== null}
              >
                Cancel / Deny
              </button>

              <button
                type="button"
                onClick={() => handleProcessRequest(selectedRequest._id, 'completed')}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-opacity-90 rounded-xl shadow-md"
                disabled={processingId !== null}
              >
                {processingId ? 'Processing...' : 'Approve & Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
