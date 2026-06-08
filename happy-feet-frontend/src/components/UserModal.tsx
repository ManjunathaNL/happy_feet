import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';

interface UserModalProps {
  user?: any | null;
  onClose: () => void;
  onSave: () => void;
  roles: any[];
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  onClose,
  onSave,
  roles,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    roleId: '',
    status: 'active',
    profilePhoto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        roleId: user.roleId?._id || user.roleId || '',
        status: user.status || 'active',
        profilePhoto: user.profilePhoto || '',
      });
      setPreviewUrl(user.profilePhoto || '');
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        roleId: '',
        status: 'active',
        profilePhoto: '',
      });
      setPreviewUrl('');
    }
    setErrors({});
  }, [user, roles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Standard Character Validation Layers
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Strict Regex Validation Mapping Layers
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Please provide a valid corporate email profile';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile phone number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile configuration must consist of exactly 10 numerical digits';
    }

    if (!formData.roleId) newErrors.roleId = 'Security clearance profile role assignment required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Strict Input Filter Layer for Mobile Field (Blocks characters/letters immediately)
    if (name === "mobile") {
      const sanitizedDigitsOnlyValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitizedDigitsOnlyValue }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file configuration asset');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, profilePhoto: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve validation anomalies.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };

      if (user) {
        await userAPI.update(user._id, payload);
        toast.success('User updated successfully');
      } else {
        await userAPI.create(payload);
        toast.success('Access configuration node initialized.');
      }

      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transaction error on context deploy execution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* MODAL TITLE TOP HEADER */}
        <div className="px-6 py-5 bg-[#7f1d1d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/15">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-md font-black text-white uppercase tracking-wide">
                {user ? 'Edit Identity Profile' : 'Create Team Member'}
              </h2>
              <p className="text-white/70 text-[11px] mt-0.5">
                {user ? 'Modify operational staff authorization layers.' : 'Deploy new access management registry nodes.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* MAIN BODY INPUT FIELDS MODULE GRID CONTAINER */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
          <div className="p-6 overflow-y-auto space-y-5 max-h-full scrollbar-thin">
            
            {/* Round Photo Selection Badge Layer */}
            <div className="flex flex-col items-center justify-center pb-4 border-b border-dashed border-slate-100">
              <div className="relative group">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <User size={32} />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-3xl cursor-pointer">
                  <div className="flex flex-col items-center text-white text-center p-1">
                    <Camera size={18} />
                    <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Upload</span>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-2">Format: 400 x 400 px</p>
            </div>

            {/* Structured Dual Row Layout Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Row 1: First Name & Last Name Input Modules */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  First Name <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full h-10 px-3.5 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName ? 'border-red-500 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50'
                  }`}
                  placeholder="e.g. John"
                />
                {errors.firstName && <p className="text-red-500 text-[10px] font-bold mt-1 tracking-wide">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Last Name <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full h-10 px-3.5 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName ? 'border-red-500 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50'
                  }`}
                  placeholder="e.g. Doe"
                />
                {errors.lastName && <p className="text-red-500 text-[10px] font-bold mt-1 tracking-wide">{errors.lastName}</p>}
              </div>

              {/* Row 2: Email Address & Contact Mobile Fields */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Email Address <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!!user}
                  className={`w-full h-10 px-3.5 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-500 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50'
                  } ${user ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/80 font-mono' : ''}`}
                  placeholder="name@company.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 tracking-wide">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`w-full h-10 px-3.5 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.mobile ? 'border-red-500 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50'
                  }`}
                  placeholder="10-digit number"
                />
                {errors.mobile && <p className="text-red-500 text-[10px] font-bold mt-1 tracking-wide">{errors.mobile}</p>}
              </div>

              {/* Row 3: Role Management Assignment Selection & Status */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Role Assignment <span className="text-rose-600 font-bold">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={`w-full h-10 px-3 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all bg-white ${
                    errors.roleId ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <option value="">Choose System Role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
                {errors.roleId && <p className="text-red-500 text-[10px] font-bold mt-1 tracking-wide">{errors.roleId}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Account Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-900/10 focus:border-slate-400 bg-slate-50/50 bg-white"
                >
                  <option value="active">Active System Node</option>
                  <option value="inactive">Inactive Suspended</option>
                </select>
              </div>

            </div>
          </div>

          {/* CONTROLS FOOTER ACTION TRIGGER LAYER */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  {user ? 'Syncing...' : 'Deploying...'}
                </>
              ) : (
                user ? 'Update Profile' : 'Save Access Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};