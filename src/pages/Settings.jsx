import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/adminService';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Truck, 
  Languages as LanguagesIcon, 
  Shield, 
  Code, 
  Bell,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Check,
  Globe
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(false);

  // General Settings
  const [requireJobApproval, setRequireJobApproval] = useState(true);
  const [requireServiceApproval, setRequireServiceApproval] = useState(true);
  const [supportEmail, setSupportEmail] = useState('ops@ubs-global.com');
  const [contactPhone, setContactPhone] = useState('+1 (555) 098-7654');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Logo & Favicon Files and Previews
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  // Payments Settings
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeMode, setStripeMode] = useState('test');
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [paypalMode, setPaypalMode] = useState('sandbox');
  const [codEnabled, setCodEnabled] = useState(true);
  const [codHandlingFee, setCodHandlingFee] = useState(false);

  // Shipping Settings
  const [shippingRate, setShippingRate] = useState(10);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [expressShippingRate, setExpressShippingRate] = useState(25);

  // Languages Settings
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [enabledLanguages, setEnabledLanguages] = useState(['en', 'es', 'fr']);

  // Security Settings
  const [twoFactorMandatory, setTwoFactorMandatory] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.1, 10.0.0.45');

  // Notifications Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // API Integrations
  const [apiKeys, setApiKeys] = useState([]);

  // Fetch Settings on mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res.success && res.settings) {
        const s = res.settings;
        setRequireJobApproval(s.requireJobApproval ?? true);
        setRequireServiceApproval(s.requireServiceApproval ?? true);
        setSupportEmail(s.supportEmail || 'ops@ubs-global.com');
        setContactPhone(s.contactPhone || '+1 (555) 098-7654');
        setMaintenanceMode(s.maintenanceMode ?? false);
        setLogoUrl(s.logoUrl || '');
        setLogoPreview(s.logoUrl || '');
        setFaviconUrl(s.faviconUrl || '');
        setFaviconPreview(s.faviconUrl || '');
        
        setStripeEnabled(s.stripeEnabled ?? true);
        setStripePublicKey(s.stripePublicKey || '');
        setStripeSecretKey(s.stripeSecretKey || '');
        setStripeMode(s.stripeMode || 'test');
        setPaypalEnabled(s.paypalEnabled ?? false);
        setPaypalClientId(s.paypalClientId || '');
        setPaypalSecret(s.paypalSecret || '');
        setPaypalMode(s.paypalMode || 'sandbox');
        setCodEnabled(s.codEnabled ?? true);
        setCodHandlingFee(s.codHandlingFee ?? false);

        setShippingRate(s.shippingRate ?? 10);
        setFreeShippingThreshold(s.freeShippingThreshold ?? 150);
        setExpressShippingRate(s.expressShippingRate ?? 25);

        setDefaultLanguage(s.defaultLanguage || 'en');
        setEnabledLanguages(s.enabledLanguages || ['en', 'es', 'fr']);

        setTwoFactorMandatory(s.twoFactorMandatory ?? false);
        setSessionTimeout(s.sessionTimeout ?? 30);
        setIpWhitelist(s.ipWhitelist || '192.168.1.1, 10.0.0.45');

        setEmailAlerts(s.emailAlerts ?? true);
        setSmsNotifications(s.smsNotifications ?? false);
        setPushNotifications(s.pushNotifications ?? true);

        setApiKeys(s.apiKeys || []);
        
        setLogoFile(null);
        setFaviconFile(null);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('requireJobApproval', String(requireJobApproval));
      formData.append('requireServiceApproval', String(requireServiceApproval));
      formData.append('supportEmail', supportEmail);
      formData.append('contactPhone', contactPhone);
      formData.append('maintenanceMode', String(maintenanceMode));
      formData.append('logoUrl', logoUrl);
      formData.append('faviconUrl', faviconUrl);
      formData.append('stripeEnabled', String(stripeEnabled));
      formData.append('stripePublicKey', stripePublicKey);
      formData.append('stripeSecretKey', stripeSecretKey);
      formData.append('stripeMode', stripeMode);
      formData.append('paypalEnabled', String(paypalEnabled));
      formData.append('paypalClientId', paypalClientId);
      formData.append('paypalSecret', paypalSecret);
      formData.append('paypalMode', paypalMode);
      formData.append('codEnabled', String(codEnabled));
      formData.append('codHandlingFee', String(codHandlingFee));
      formData.append('shippingRate', String(shippingRate));
      formData.append('freeShippingThreshold', String(freeShippingThreshold));
      formData.append('expressShippingRate', String(expressShippingRate));
      formData.append('defaultLanguage', defaultLanguage);
      formData.append('enabledLanguages', JSON.stringify(enabledLanguages));
      formData.append('twoFactorMandatory', String(twoFactorMandatory));
      formData.append('sessionTimeout', String(sessionTimeout));
      formData.append('ipWhitelist', ipWhitelist);
      formData.append('emailAlerts', String(emailAlerts));
      formData.append('smsNotifications', String(smsNotifications));
      formData.append('pushNotifications', String(pushNotifications));
      formData.append('apiKeys', JSON.stringify(apiKeys));

      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }

      const res = await updateSettings(formData);
      if (res.success) {
        toast.success('Settings updated successfully!');
        if (res.settings) {
          setLogoUrl(res.settings.logoUrl || '');
          setLogoPreview(res.settings.logoUrl || '');
          setFaviconUrl(res.settings.faviconUrl || '');
          setFaviconPreview(res.settings.faviconUrl || '');
          setLogoFile(null);
          setFaviconFile(null);
        }
      } else {
        toast.error(res.message || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Generate new API Key
  const handleGenerateKey = async () => {
    const name = window.prompt("Enter a name for the new API key:");
    if (!name) return;
    if (!name.trim()) {
      toast.error("API Key name is required");
      return;
    }
    
    const randomKey = 'ubs_pk_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newKey = {
      name: name.trim(),
      key: randomKey,
      status: 'active',
      lastUsed: null
    };

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    
    try {
      const res = await updateSettings({ apiKeys: updatedKeys });
      if (res.success) {
        toast.success("New API key generated successfully!");
      }
    } catch (e) {
      toast.error("Failed to save new API key");
    }
  };

  // Revoke/Delete API Key
  const handleDeleteKey = async (index) => {
    if (!window.confirm("Are you sure you want to revoke this API key? This cannot be undone.")) return;
    
    const updatedKeys = apiKeys.map((k, idx) => idx === index ? { ...k, status: 'revoked' } : k);
    setApiKeys(updatedKeys);
    
    try {
      const res = await updateSettings({ apiKeys: updatedKeys });
      if (res.success) {
        toast.success("API key revoked successfully!");
      }
    } catch (e) {
      toast.error("Failed to revoke API key");
    }
  };

  const tabs = [
    { id: 'General', icon: SettingsIcon },
    { id: 'Payments', icon: CreditCard },
    { id: 'Shipping', icon: Truck },
    { id: 'Languages', icon: LanguagesIcon },
    { id: 'Security', icon: Shield },
    { id: 'API', icon: Code },
    { id: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Global environment controls and core administrative parameters</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSettings}
            className="px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 xl:w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all text-left border ${
                  isActive 
                    ? 'bg-primary text-white shadow-md border-transparent' 
                    : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-800 text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                {tab.id}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          {loading ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center min-h-[350px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 animate-pulse">Loading settings metadata...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: General Settings */}
              {activeTab === 'General' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <SettingsIcon className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Brand & Portal Rules</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Brand Logos */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Company Logo</label>
                        <div className="flex items-center gap-5">
                          <label className="relative w-24 h-24 bg-gray-50 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoChange} 
                              className="hidden" 
                            />
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <>
                                <UploadCloud size={24} className="mb-1" />
                                <span className="text-[10px] font-medium">Upload</span>
                              </>
                            )}
                          </label>
                          <div className="flex flex-col">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">Supports PNG, SVG, JPG.<br/>Max file size: 2MB.</p>
                            {logoPreview && (
                              <button 
                                onClick={() => {
                                  setLogoFile(null);
                                  setLogoPreview('');
                                  setLogoUrl('');
                                }}
                                className="text-sm font-bold text-red-650 dark:text-red-400 hover:underline text-left"
                              >
                                Remove Current
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Favicon</label>
                        <div className="flex items-center gap-5">
                          <label className="relative w-12 h-12 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFaviconChange} 
                              className="hidden" 
                            />
                            {faviconPreview ? (
                              <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </label>
                          {faviconPreview && (
                            <button 
                              onClick={() => {
                                setFaviconFile(null);
                                setFaviconPreview('');
                                setFaviconUrl('');
                              }}
                              className="text-sm font-bold text-red-650 dark:text-red-400 hover:underline text-left"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Contacts & Switches */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Support Email</label>
                          <input 
                            type="text" 
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Contact Phone</label>
                          <input 
                            type="text" 
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-all" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">Maintenance Mode</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Restrict customer access for updates</p>
                        </div>
                        <div 
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${maintenanceMode ? 'bg-red-600' : 'bg-gray-250 dark:bg-gray-800'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${maintenanceMode ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
   
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Job Portal Approval</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">New/edited jobs require admin approval before going live</p>
                        </div>
                        <div 
                          onClick={() => setRequireJobApproval(!requireJobApproval)}
                          className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${requireJobApproval ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-800'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${requireJobApproval ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
   
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Service Portal Approval</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">New/edited services require admin approval before going live</p>
                        </div>
                        <div 
                          onClick={() => setRequireServiceApproval(!requireServiceApproval)}
                          className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${requireServiceApproval ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-800'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${requireServiceApproval ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Payments Settings */}
              {activeTab === 'Payments' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Gateways</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Stripe Card */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-dark-card shadow-sm shadow-gray-100/50 dark:shadow-none flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div className="bg-[#635BFF] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">STRIPE</div>
                        <div 
                          onClick={() => setStripeEnabled(!stripeEnabled)}
                          className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${stripeEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${stripeEnabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Publishable Key"
                          value={stripePublicKey}
                          onChange={(e) => setStripePublicKey(e.target.value)}
                          className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-750 dark:text-gray-300 placeholder-gray-400 focus:outline-none" 
                        />
                        <input 
                          type="password" 
                          placeholder="Secret Key"
                          value={stripeSecretKey}
                          onChange={(e) => setStripeSecretKey(e.target.value)}
                          className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-755 dark:text-gray-300 placeholder-gray-400 focus:outline-none" 
                        />
                        <div className="relative">
                          <select 
                            value={stripeMode}
                            onChange={(e) => setStripeMode(e.target.value)}
                            className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300 px-3 appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="live">Live Mode</option>
                            <option value="test">Test Mode</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
   
                    {/* PayPal Card */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-dark-card flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div className="bg-[#003087] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">PAYPAL</div>
                        <div 
                          onClick={() => setPaypalEnabled(!paypalEnabled)}
                          className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${paypalEnabled ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${paypalEnabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Client ID" 
                          value={paypalClientId}
                          onChange={(e) => setPaypalClientId(e.target.value)}
                          className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-750 dark:text-gray-300 placeholder-gray-400 focus:outline-none" 
                        />
                        <input 
                          type="password" 
                          placeholder="Client Secret" 
                          value={paypalSecret}
                          onChange={(e) => setPaypalSecret(e.target.value)}
                          className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-750 dark:text-gray-300 placeholder-gray-400 focus:outline-none" 
                        />
                        <div className="relative">
                          <select 
                            value={paypalMode}
                            onChange={(e) => setPaypalMode(e.target.value)}
                            className="w-full h-9 bg-gray-50 dark:bg-dark-bg border border-gray-255 dark:border-gray-700 rounded-lg text-xs text-gray-550 dark:text-gray-300 px-3 appearance-none outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="sandbox">Sandbox Mode</option>
                            <option value="live">Live Mode</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                    </div>
   
                    {/* COD Card */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-gray-50/50 dark:bg-dark-card/50 relative overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-[#475569] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">COD</div>
                        <div 
                          onClick={() => setCodEnabled(!codEnabled)}
                          className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${codEnabled ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${codEnabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-650 dark:text-gray-300 mb-6 leading-relaxed">
                        Allow customers to pay upon package arrival at the destination.
                      </p>
                      <label 
                        onClick={() => setCodHandlingFee(!codHandlingFee)}
                        className="flex items-center gap-2.5 cursor-pointer mt-auto"
                      >
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center shadow-sm border ${codHandlingFee ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                          {codHandlingFee && <Check size={12} className="text-white font-bold" strokeWidth={3} />}
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-250 tracking-wider uppercase">ADD HANDLING FEE</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Shipping Settings */}
              {activeTab === 'Shipping' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping & Logistics Rates</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Shipping Rate ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-gray-400 font-medium">$</span>
                        <input 
                          type="number" 
                          value={shippingRate} 
                          onChange={(e) => setShippingRate(Number(e.target.value))}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Free Shipping Threshold ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-gray-400 font-medium">$</span>
                        <input 
                          type="number" 
                          value={freeShippingThreshold} 
                          onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Express Shipping Rate ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-gray-400 font-medium">$</span>
                        <input 
                          type="number" 
                          value={expressShippingRate} 
                          onChange={(e) => setExpressShippingRate(Number(e.target.value))}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Languages Settings */}
              {activeTab === 'Languages' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Globe className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Localization & Translations</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Platform Language</label>
                      <select 
                        value={defaultLanguage}
                        onChange={(e) => setDefaultLanguage(e.target.value)}
                        className="w-full sm:w-1/3 border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español (ES)</option>
                        <option value="fr">Français (FR)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Enabled Languages</label>
                      <div className="space-y-3">
                        {['en', 'es', 'fr'].map((langCode) => {
                          const langLabel = langCode === 'en' ? 'English (US)' : langCode === 'es' ? 'Español' : 'Français';
                          const isChecked = enabledLanguages.includes(langCode);
                          return (
                            <div 
                              key={langCode}
                              onClick={() => {
                                if (isChecked) {
                                  if (enabledLanguages.length > 1) {
                                    setEnabledLanguages(enabledLanguages.filter(l => l !== langCode));
                                  } else {
                                    toast.error("At least one language must remain enabled");
                                  }
                                } else {
                                  setEnabledLanguages([...enabledLanguages, langCode]);
                                }
                              }}
                              className="flex items-center gap-2.5 cursor-pointer"
                            >
                              <div className={`w-4 h-4 rounded-sm flex items-center justify-center shadow-sm border ${isChecked ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'}`}>
                                {isChecked && <Check size={12} className="text-white font-bold" strokeWidth={3} />}
                              </div>
                              <span className="text-sm text-gray-800 dark:text-gray-200">{langLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Security Settings */}
              {activeTab === 'Security' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                  <div className="flex items-center gap-2 mb-8">
                    <Shield className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security & Policies</h2>
                  </div>
                  
                  <div className="space-y-7">
                    <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-[15px] font-bold text-gray-800 dark:text-gray-200">Two-Factor Auth</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Mandatory 2FA verification for all administrators</p>
                      </div>
                      <div 
                        onClick={() => setTwoFactorMandatory(!twoFactorMandatory)}
                        className={`w-5 h-5 rounded shadow-sm flex items-center justify-center cursor-pointer border ${twoFactorMandatory ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        {twoFactorMandatory && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wider">SESSION TIMEOUT (MIN)</label>
                      <input 
                        type="number" 
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(Number(e.target.value))}
                        className="w-full sm:w-1/3 border border-gray-300 dark:border-gray-700 dark:bg-dark-bg dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wider">IP WHITELIST</label>
                      <textarea 
                        value={ipWhitelist}
                        onChange={(e) => setIpWhitelist(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 bg-gray-50/50 dark:bg-dark-bg min-h-[90px] resize-none font-mono" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: API Integrations */}
              {activeTab === 'API' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Code className="text-primary dark:text-accent" size={20} />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">API Integrations</h2>
                    </div>
                    <button 
                      onClick={handleGenerateKey}
                      className="bg-primary text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-lg leading-none">+</span> Generate Key
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex-1 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm min-w-[500px]">
                        <thead className="bg-gray-50/80 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-5 py-3.5">KEY NAME</th>
                            <th className="px-5 py-3.5">KEY TOKEN</th>
                            <th className="px-5 py-3.5">STATUS</th>
                            <th className="px-4 py-3.5 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-dark-card">
                          {apiKeys.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">No API keys registered. Click generate to create one.</td>
                            </tr>
                          ) : (
                            apiKeys.map((keyObj, index) => (
                              <tr key={keyObj._id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-5 py-3.5 text-gray-800 dark:text-gray-200 font-semibold text-xs">{keyObj.name}</td>
                                <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-[11px] font-mono">{keyObj.key.slice(0, 10)}••••••••••</td>
                                <td className="px-5 py-3.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                    keyObj.status === 'active' 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : 'text-gray-400 dark:text-gray-500'
                                  }`}>
                                    {keyObj.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors text-right">
                                  {keyObj.status === 'active' ? (
                                    <button 
                                      onClick={() => handleDeleteKey(index)}
                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                      title="Revoke API Key"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-gray-600 italic">Revoked</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Notifications Settings */}
              {activeTab === 'Notifications' && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="text-primary dark:text-accent" size={20} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Email Alerts</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Send mail alerts to administrator on system status updates</p>
                      </div>
                      <div 
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${emailAlerts ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm transform transition-transform ${emailAlerts ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">SMS Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Send carrier SMS warnings on critical failures</p>
                      </div>
                      <div 
                        onClick={() => setSmsNotifications(!smsNotifications)}
                        className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${smsNotifications ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm transform transition-transform ${smsNotifications ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Push Notifications</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Allow web browser notification popups</p>
                      </div>
                      <div 
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${pushNotifications ? 'bg-primary' : 'bg-gray-250 dark:bg-gray-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm transform transition-transform ${pushNotifications ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
