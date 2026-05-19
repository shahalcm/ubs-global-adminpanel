import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Truck, 
  Languages, 
  Shield, 
  Code, 
  Bell,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Check
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  
  const tabs = [
    { id: 'General', icon: SettingsIcon },
    { id: 'Payments', icon: CreditCard },
    { id: 'Shipping', icon: Truck },
    { id: 'Languages', icon: Languages },
    { id: 'Security', icon: Shield },
    { id: 'API', icon: Code },
    { id: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Global environment controls and core administrative parameters</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Discard
          </button>
          <button className="px-5 py-2 bg-[#0A0F2C] text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Save Changes
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
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors text-left ${
                  isActive 
                    ? 'bg-[#0A0F2C] text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />
                {tab.id}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab === 'General' && (
            <>
              {/* Brand Identity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <SettingsIcon className="text-[#0A0F2C]" size={20} />
                  <h2 className="text-lg font-bold text-[#0A0F2C]">Brand Identity</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-3">Company Logo</label>
                      <div className="flex items-center gap-5">
                        <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
                          <UploadCloud size={24} className="mb-1" />
                          <span className="text-[10px] font-medium">200x200</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm text-slate-500 mb-2 leading-relaxed">Supports PNG, SVG, JPG.<br/>Max file size: 2MB.</p>
                          <button className="text-sm font-bold text-slate-900 hover:text-indigo-700 text-left">Remove Current</button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Favicon</label>
                      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
                        <ImageIcon size={20} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Email</label>
                        <input type="text" defaultValue="ops@logistics-pro.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A0F2C] focus:border-transparent outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
                        <input type="text" defaultValue="+1 (555) 098-7654" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#0A0F2C] focus:border-transparent outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-red-600">Maintenance Mode</p>
                        <p className="text-xs text-slate-500 mt-0.5">Restrict customer access for updates</p>
                      </div>
                      <div className="w-11 h-6 bg-slate-200 rounded-full flex items-center p-1 cursor-pointer transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Infrastructure */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="text-[#0A0F2C]" size={20} />
                  <h2 className="text-lg font-bold text-[#0A0F2C]">Payment Infrastructure</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Stripe Card */}
                  <div className="border border-indigo-100 rounded-xl p-5 bg-white shadow-sm shadow-indigo-50/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-[#635BFF] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">STRIPE</div>
                      <div className="w-10 h-5 bg-[#007A7C] rounded-full flex items-center justify-end p-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3">
                        <span className="text-xl tracking-[0.2em] text-slate-400 mt-1.5">••••••••••••••</span>
                      </div>
                      <div className="h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3">
                        <span className="text-xl tracking-[0.2em] text-slate-400 mt-1.5">••••••••••••••</span>
                      </div>
                      <div className="relative">
                        <select className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 px-3 appearance-none outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer">
                          <option>Live Mode</option>
                          <option>Test Mode</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PayPal Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-[#003087] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">PAYPAL</div>
                      <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center p-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input type="text" placeholder="Client ID" className="w-full h-9 bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-sm text-slate-400 placeholder-slate-300" disabled />
                      <input type="text" placeholder="Client Secret" className="w-full h-9 bg-slate-50/50 border border-slate-200 rounded-lg px-3 text-sm text-slate-400 placeholder-slate-300" disabled />
                      <div className="relative">
                        <select className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 px-3 appearance-none outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                          <option>Sandbox Mode</option>
                          <option>Live Mode</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COD Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-[#475569] text-white text-xs font-bold px-4 py-1.5 rounded-md tracking-wide">COD</div>
                      <div className="w-10 h-5 bg-[#007A7C] rounded-full flex items-center justify-end p-0.5 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-600 mb-8 leading-relaxed pr-2">
                      Allow customers to pay upon package arrival at the destination.
                    </p>
                    <label className="flex items-center gap-2.5 cursor-pointer mt-auto">
                      <div className="w-4 h-4 bg-[#0A0F2C] rounded-sm flex items-center justify-center shadow-sm">
                        <Check size={12} className="text-white font-bold" strokeWidth={3} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 tracking-wider">ADD HANDLING FEE</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex items-center gap-2 mb-8">
                    <Shield className="text-[#0A0F2C]" size={20} />
                    <h2 className="text-lg font-bold text-[#0A0F2C]">Security</h2>
                  </div>
                  
                  <div className="space-y-7 flex-1">
                    <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                      <div>
                        <p className="text-[15px] font-bold text-slate-800">Two-Factor Auth</p>
                        <p className="text-sm text-slate-500 mt-0.5">Mandatory for all admins</p>
                      </div>
                      <div className="w-5 h-5 bg-[#0A0F2C] rounded shadow-sm flex items-center justify-center cursor-pointer">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-2.5 uppercase tracking-wider">SESSION TIMEOUT (MIN)</label>
                      <input type="text" defaultValue="30" className="w-full sm:w-1/3 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A0F2C] focus:border-transparent outline-none transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-2.5 uppercase tracking-wider">IP WHITELIST</label>
                      <textarea className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A0F2C] focus:border-transparent outline-none transition-all text-slate-600 bg-slate-50/50 min-h-[90px] resize-none" defaultValue="192.168.1.1, 10.0.0.45" />
                    </div>
                  </div>
                </div>

                {/* API Integrations */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Code className="text-[#0A0F2C]" size={20} />
                      <h2 className="text-lg font-bold text-[#0A0F2C]">API Integrations</h2>
                    </div>
                    <button className="bg-[#007A7C] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#006567] transition-colors flex items-center gap-1.5 shadow-sm">
                      <span className="text-lg leading-none">+</span> Generate Key
                    </button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm min-w-[500px]">
                        <thead className="bg-slate-50/80 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3.5">KEY NAME</th>
                            <th className="px-5 py-3.5">LAST USED</th>
                            <th className="px-5 py-3.5">STATUS</th>
                            <th className="px-4 py-3.5 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="px-5 py-3.5 text-slate-800 font-medium text-xs">ERP_Production_v2</td>
                            <td className="px-5 py-3.5 text-slate-500 text-[11px]">Oct 24,<br/>14:02</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">ACTIVE</span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                              <Trash2 size={16} />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5 text-slate-800 font-medium text-xs">Mobile_App_iOS</td>
                            <td className="px-5 py-3.5 text-slate-500 text-[11px]">Oct 22,<br/>09:15</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">ACTIVE</span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
                              <Trash2 size={16} />
                            </td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="px-5 py-3.5 text-slate-500 font-medium text-xs">Legacy_Tracker_Old</td>
                            <td className="px-5 py-3.5 text-slate-400 text-[11px]">Never</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded uppercase tracking-wider">REVOKED</span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-300 hover:text-red-500 cursor-pointer transition-colors">
                              <Trash2 size={16} />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'General' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <SettingsIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-700">{activeTab} Settings</h3>
                <p className="text-slate-500 text-sm mt-1">This section is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
