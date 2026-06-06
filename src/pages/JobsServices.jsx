import { useState, useEffect, useCallback } from 'react';
import { 
  getAdminProducts, 
  approveProduct, 
  rejectProduct, 
  updateAdminProduct, 
  createAdminProduct, 
  deleteAdminProduct, 
  getAdminCategories, 
  getSellers,
  getJobApplications,
  deleteJobApplication,
  downloadJobApplicationCV
} from '../services/adminService';
import toast from 'react-hot-toast';
import { 
  Plus, Search, Edit, Trash2, Briefcase, Wrench, Check, X, AlertCircle, FileText, ShieldAlert, Upload, Download
} from 'lucide-react';
import { getProductImageUrl } from '../utils/formatters';
 
const JobsServices = () => {
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'services', or 'applications'
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalServices: 0,
    pendingApprovals: 0
  });

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  
  // Forms
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '', // category ID
    subcategory: '',
    status: 'active',
    approvalStatus: 'approved',
    sellerId: '',
    images: null
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    subcategory: '',
    status: 'active',
    approvalStatus: 'approved'
  });

  // File Upload Preview
  const [imagePreview, setImagePreview] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Categories and Sellers initially
  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await getAdminCategories();
        setCategories(catRes.categories || []);
        
        const sellerRes = await getSellers({ status: 'approved' });
        setSellers(sellerRes.sellers || []);
      } catch (error) {
        console.error('initData error:', error);
        toast.error('Failed to load category / seller list');
      }
    };
    initData();
  }, []);

  // Helper to find category ID by name/slug
  const getCategoryIdByTab = useCallback((tab) => {
    const found = categories.find(c => {
      const name = (c.name || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      if (tab === 'jobs') {
        return name === 'job portal' || name === 'jobs' || name === 'job' || name.includes('job') || slug === 'job-portal' || slug === 'job' || slug.includes('job');
      } else {
        return name === 'service portal' || name === 'services' || name === 'service' || name.includes('service') || slug === 'service-portal' || slug === 'service' || slug.includes('service');
      }
    });
    return found ? found._id : null;
  }, [categories]);

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application permanently?')) return;
    try {
      setLoading(true);
      await deleteJobApplication(id);
      toast.success('Job application deleted successfully');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleDeleteApplication error:', error);
      toast.error('Failed to delete job application');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async (appId, filename) => {
    if (!appId) return;
    try {
      setLoading(true);
      const blob = await downloadJobApplicationCV(appId);
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobURL);
      toast.success('CV downloaded successfully');
    } catch (error) {
      console.error('Download CV failed:', error);
      toast.error('Failed to download CV');
    } finally {
      setLoading(false);
    }
  };

  // Reload listings, applications, and stats when activeTab, page, search, category, or reloadTrigger changes
  useEffect(() => {
    if (categories.length === 0) return;
    let active = true;

    const fetchData = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);

      const catId = getCategoryIdByTab(activeTab);

      try {
        if (activeTab === 'applications') {
          const res = await getJobApplications({
            page: currentPage,
            limit,
            search: debouncedSearch
          });
          if (active) {
            setApplications(res.applications || []);
            setTotalPages(res.pagination?.pages || 1);
          }
        } else {
          if (!catId) {
            if (active) {
              setListings([]);
            }
          } else {
            const res = await getAdminProducts({
              category: catId,
              page: currentPage,
              limit,
              search: debouncedSearch
            });
            if (active) {
              setListings(res.products || []);
              setTotalPages(res.pagination?.pages || 1);
            }
          }
        }

        // Fetch Stats
        const jobCatId = getCategoryIdByTab('jobs');
        const serviceCatId = getCategoryIdByTab('services');

        const jobPromise = jobCatId 
          ? getAdminProducts({ category: jobCatId, limit: 1 })
          : Promise.resolve({ pagination: { total: 0 } });
          
        const servicePromise = serviceCatId 
          ? getAdminProducts({ category: serviceCatId, limit: 1 })
          : Promise.resolve({ pagination: { total: 0 } });

        const pendingIds = [jobCatId, serviceCatId].filter(Boolean).join(',');
        const pendingPromise = pendingIds 
          ? getAdminProducts({ categories: pendingIds, approvalStatus: 'pending', limit: 1 })
          : Promise.resolve({ pagination: { total: 0 } });

        const [jobsRes, servicesRes, pendingRes] = await Promise.all([
          jobPromise,
          servicePromise,
          pendingPromise
        ]);

        if (active) {
          setStats({
            totalJobs: jobsRes.pagination?.total || 0,
            totalServices: servicesRes.pagination?.total || 0,
            pendingApprovals: pendingRes.pagination?.total || 0
          });
        }
      } catch (error) {
        console.error('fetchData error:', error);
        toast.error('Failed to load data');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [activeTab, currentPage, debouncedSearch, categories, reloadTrigger, getCategoryIdByTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Approve Listing
  const handleApprove = async (id) => {
    try {
      await approveProduct(id);
      toast.success('Listing approved successfully');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleApprove error:', error);
      toast.error('Failed to approve listing');
    }
  };

  // Reject Listing
  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await rejectProduct(id, reason);
      toast.success('Listing rejected successfully');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleReject error:', error);
      toast.error('Failed to reject listing');
    }
  };

  // Delete Listing
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await deleteAdminProduct(id);
      toast.success('Listing deleted successfully');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleDelete error:', error);
      toast.error('Failed to delete listing');
    }
  };

  // File Selector helper
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setCreateForm({ ...createForm, images: files });
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const catId = createForm.category || getCategoryIdByTab(activeTab);
    if (!catId) {
      toast.error('Please select a valid category');
      return;
    }

    const formData = new FormData();
    formData.append('title', createForm.title);
    formData.append('description', createForm.description);
    formData.append('price', createForm.price);
    formData.append('category', catId);
    formData.append('subcategory', createForm.subcategory);
    formData.append('status', createForm.status);
    formData.append('approvalStatus', createForm.approvalStatus);
    if (createForm.sellerId) {
      formData.append('sellerId', createForm.sellerId);
    }
    if (createForm.images) {
      for (let i = 0; i < createForm.images.length; i++) {
        formData.append('images', createForm.images[i]);
      }
    }

    try {
      setLoading(true);
      await createAdminProduct(formData);
      toast.success('New listing created successfully');
      setIsCreateModalOpen(false);
      setImagePreview(null);
      // Reset form
      setCreateForm({
        title: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        status: 'active',
        approvalStatus: 'approved',
        sellerId: '',
        images: null
      });
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleCreateSubmit error:', error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Click
  const handleEditClick = (listing) => {
    setSelectedListing(listing);
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      price: String(listing.price || ''),
      subcategory: listing.subcategory || '',
      status: listing.status || 'active',
      approvalStatus: listing.approvalStatus || 'approved'
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (req) => {
    req.preventDefault();
    try {
      setLoading(true);
      await updateAdminProduct(selectedListing._id, editForm);
      toast.success('Listing updated successfully');
      setIsEditModalOpen(false);
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleEditSubmit error:', error);
      toast.error(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl focus:z-20 transition-all ${
            i === currentPage
              ? 'bg-primary text-white shadow-soft'
              : 'text-[#2B3674] dark:text-gray-200 bg-white dark:bg-[#111C44] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#2B3674] dark:text-white tracking-tight">Jobs & Services Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">Review, moderate, create, and manage platform listings.</p>
        </div>
        {activeTab !== 'applications' && (
          <button
            onClick={() => {
              const catId = getCategoryIdByTab(activeTab);
              setCreateForm(prev => ({ ...prev, category: catId || '' }));
              setIsCreateModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-2xl font-bold shadow-soft flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Listing
          </button>
        )}
      </div>
 
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Jobs Card */}
        <div className="card flex items-center gap-4 bg-white dark:bg-dark-card rounded-[20px] p-5 shadow-soft dark:shadow-soft-dark border border-white/5">
          <div className="p-4 rounded-full bg-[#F4F7FE] dark:bg-dark-bg text-primary">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-400">Total Careers</p>
            <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white">{stats.totalJobs} listings</p>
          </div>
        </div>
 
        {/* Services Card */}
        <div className="card flex items-center gap-4 bg-white dark:bg-dark-card rounded-[20px] p-5 shadow-soft dark:shadow-soft-dark border border-white/5">
          <div className="p-4 rounded-full bg-[#F4F7FE] dark:bg-dark-bg text-primary">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-400">Total Services</p>
            <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white">{stats.totalServices} listings</p>
          </div>
        </div>
 
        {/* Pending Approvals Card */}
        <div className="card flex items-center gap-4 bg-white dark:bg-dark-card rounded-[20px] p-5 shadow-soft dark:shadow-soft-dark border border-white/5">
          <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[#FFB547]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-400">Pending Review</p>
            <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white">{stats.pendingApprovals} pending</p>
          </div>
        </div>
      </div>
 
      {/* Filter and Search Card */}
      <div className="card bg-white dark:bg-dark-card p-4 rounded-[20px] shadow-soft dark:shadow-soft-dark border border-white/5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Segment Tabs */}
        <div className="flex bg-[#F4F7FE] dark:bg-dark-bg p-1 rounded-xl w-fit">
          <button
            onClick={() => handleTabChange('jobs')}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-white dark:bg-dark-card text-primary dark:text-white shadow-soft'
                : 'text-gray-500 hover:text-primary dark:hover:text-white'
            }`}
          >
            <Briefcase size={14} />
            Job Listings
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-white dark:bg-dark-card text-primary dark:text-white shadow-soft'
                : 'text-gray-500 hover:text-primary dark:hover:text-white'
            }`}
          >
            <Wrench size={14} />
            Service Portal
          </button>
          <button
            onClick={() => handleTabChange('applications')}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-dark-card text-primary dark:text-white shadow-soft'
                : 'text-gray-500 hover:text-primary dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            Job Applications
          </button>
        </div>
 
        {/* Search Field */}
        <div className="w-full lg:w-80 relative">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'jobs' ? 'jobs...' : activeTab === 'services' ? 'services...' : 'applications...'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
          />
          <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Listings Table Card */}
      <div className="card bg-white dark:bg-dark-card rounded-[20px] shadow-soft dark:shadow-soft-dark border border-white/5 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {activeTab === 'applications' ? (
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-bg/40 text-[#2B3674]/60 dark:text-white/60 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Applicant</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Applied Position</th>
                  <th className="py-4 px-6">Experience / Skills</th>
                  <th className="py-4 px-6">Cover Letter / Note</th>
                  <th className="py-4 px-6">Resume (PDF)</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
            ) : (
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-dark-bg/40 text-[#2B3674]/60 dark:text-white/60 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-20">Preview</th>
                  <th className="py-4 px-6">Title / Details</th>
                  <th className="py-4 px-6">Subcategory</th>
                  <th className="py-4 px-6">Assigned Seller</th>
                  <th className="py-4 px-6">Rate / Price</th>
                  <th className="py-4 px-6">Workflow Status</th>
                  <th className="py-4 px-6">Visibility</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-sm">
              {activeTab === 'applications' ? (
                loading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="py-4 px-6 text-right"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-dark-bg/10">
                      <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={38} />
                      <p className="font-semibold">No job applications found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try modifying your search.</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-all border-b border-gray-100 dark:border-white/10">
                      <td className="py-4 px-6 font-bold text-[#2B3674] dark:text-white">{app.name}</td>
                      <td className="py-4 px-6">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{app.email}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{app.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-primary">{app.jobId?.title || 'Unknown Job'}</div>
                        <div className="text-xs text-gray-400">${app.jobId?.price}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-650 dark:text-gray-350 font-medium">{app.experience}</td>
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={app.coverLetter}>
                        {app.coverLetter || <span className="italic text-gray-400">None provided</span>}
                      </td>
                      <td className="py-4 px-6">
                        {app.cvUrl ? (
                          <button 
                            onClick={() => handleDownloadCV(app._id, `${app.name}_CV.pdf`)}
                            className="text-primary hover:text-primary-dark hover:underline font-semibold flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-dark-bg/60 border border-slate-200 dark:border-white/5 w-fit px-3 py-1.5 rounded-xl transition-all shadow-sm"
                            title="Download Candidate CV"
                          >
                            <Download size={14} className="shrink-0" />
                            <span>Download CV</span>
                          </button>
                        ) : (
                          <span className="italic text-gray-400 text-xs">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-450 text-xs">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteApplication(app._id)}
                          className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-[#FF5E5E] hover:bg-red-100 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          title="Delete application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                loading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="py-4 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></td>
                      <td className="py-4 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-14"></div></td>
                      <td className="py-4 px-6 text-right"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-28 ml-auto"></div></td>
                    </tr>
                  ))
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-dark-bg/10">
                      <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={38} />
                      <p className="font-semibold">No portal listings found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try modifying your search or filters.</p>
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-all border-b border-gray-100 dark:border-white/10">
                      <td className="py-4 px-6">
                        <img 
                          src={getProductImageUrl(listing.images && listing.images[0] ? listing.images[0] : '')} 
                          alt={listing.title}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-white/10"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#2B3674] dark:text-white text-base">{listing.title}</div>
                        {listing.rejectionReason && listing.approvalStatus === 'rejected' && (
                          <div className="text-xs text-[#FF5E5E] mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> Reason: {listing.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-650 dark:text-gray-350 font-medium">
                        {listing.subcategory || <span className="text-gray-400 text-xs italic font-normal">General</span>}
                      </td>
                      <td className="py-4 px-6 text-gray-650 dark:text-gray-350">
                        {listing.sellerId?.shopName || <span className="text-gray-400 text-xs italic">System / Admin</span>}
                      </td>
                      <td className="py-4 px-6 text-[#2B3674] dark:text-white font-extrabold text-base">
                        ${listing.price}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          listing.approvalStatus === 'approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#05CD99]' 
                            : listing.approvalStatus === 'rejected' 
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-[#FF5E5E]' 
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#FFB547]'
                        }`}>
                          {listing.approvalStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          listing.status === 'active' 
                            ? 'bg-indigo-50 dark:bg-primary/10 text-primary dark:text-[#868CFF]' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 shrink-0">
                        {listing.approvalStatus !== 'approved' && (
                          <button 
                            onClick={() => handleApprove(listing._id)}
                            className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#05CD99] hover:bg-emerald-100 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Approve"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        )}
                        {listing.approvalStatus !== 'rejected' && (
                          <button 
                            onClick={() => handleReject(listing._id)}
                            className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-[#FF5E5E] hover:bg-rose-100 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Reject"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(listing)}
                          className="bg-indigo-50 dark:bg-primary/10 text-primary dark:text-[#868CFF] hover:bg-primary/15 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(listing._id)}
                          className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-[#FF5E5E] hover:bg-red-100 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                          title="Delete listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-dark-card px-6 py-4 rounded-[20px] shadow-soft dark:shadow-soft-dark border border-white/5">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Showing page <span className="font-bold text-[#2B3674] dark:text-white">{currentPage}</span> of{' '}
              <span className="font-bold text-[#2B3674] dark:text-white">{totalPages}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-card text-sm font-bold text-[#2B3674] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-card text-sm font-bold text-[#2B3674] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-white/10 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
                {activeTab === 'jobs' ? <Briefcase className="text-primary" /> : <Wrench className="text-primary" />}
                Create New {activeTab === 'jobs' ? 'Job Listing' : 'Service Listing'}
              </h3>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setImagePreview(null);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Title / Role</label>
                <input 
                  type="text" 
                  required
                  placeholder={activeTab === 'jobs' ? "e.g. Senior Software Architect" : "e.g. Master Plumbing Service"}
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Detail the job requirements, responsibilities, rates, and qualifications..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">
                    {activeTab === 'jobs' ? 'Salary ($)' : 'Hourly Rate / Price ($)'}
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 5000"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Subcategory</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tech, Finance, Cleaning"
                    value={createForm.subcategory}
                    onChange={(e) => setCreateForm({ ...createForm, subcategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Assign Seller Profile</label>
                <select
                  value={createForm.sellerId}
                  onChange={(e) => setCreateForm({ ...createForm, sellerId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                >
                  <option value="">Default Admin / Auto-assign Profile</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>{s.shopName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Visibility Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Approval State</label>
                  <select
                    value={createForm.approvalStatus}
                    onChange={(e) => setCreateForm({ ...createForm, approvalStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">List Image / Icon</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary bg-[#F4F7FE]/40 dark:bg-dark-bg/20 rounded-xl p-4 cursor-pointer transition-all">
                    <Upload className="text-primary mb-1" size={20} />
                    <span className="text-xs font-bold text-primary">Upload File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                    />
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-150 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setImagePreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-[#2B3674] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-white/10 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
                <Edit className="text-primary" />
                Edit {activeTab === 'jobs' ? 'Job Listing' : 'Service Listing'}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Title / Role</label>
                <input 
                  type="text" 
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">
                    {activeTab === 'jobs' ? 'Salary ($)' : 'Hourly Rate / Price ($)'}
                  </label>
                  <input 
                    type="number" 
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Subcategory</label>
                  <input 
                    type="text" 
                    value={editForm.subcategory}
                    onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Visibility Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B3674]/60 dark:text-white/60 uppercase tracking-wider mb-1">Approval State</label>
                  <select
                    value={editForm.approvalStatus}
                    onChange={(e) => setEditForm({ ...editForm, approvalStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-dark-bg text-[#2B3674] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-card transition-all text-sm shadow-sm"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-150 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[#2B3674] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsServices;
