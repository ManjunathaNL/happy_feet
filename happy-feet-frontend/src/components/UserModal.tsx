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

  // Populate form when editing
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.roleId) newErrors.roleId = 'Please select a role';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
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
      toast.error('Please fix the errors in the form');
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
        toast.success('User created and onboarding email sent');
      }

      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div 
          className="px-8 py-6 border-b flex items-center justify-between"
          style={{ backgroundColor: 'var(--dynamic-accent-bg)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <User className="text-white" size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {user ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-white/70 text-sm mt-0.5">
                {user ? 'Update account information' : 'Add a new team member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-md">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User size={48} className="text-slate-400" />
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-3xl cursor-pointer">
                <div className="flex flex-col items-center text-white">
                  <Camera size={28} />
                  <span className="text-xs mt-1 font-medium">Change Photo</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-3">Recommended: 400x400px</p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-base ${
                  errors.firstName 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                    : 'border-slate-200 focus:ring-[var(--dynamic-accent-bg)] focus:border-transparent'
                }`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-base ${
                  errors.lastName 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                    : 'border-slate-200 focus:ring-[var(--dynamic-accent-bg)] focus:border-transparent'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!!user}
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-base ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-slate-200 focus:ring-[var(--dynamic-accent-bg)]'
                } ${user ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                placeholder="john.doe@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-base ${
                  errors.mobile 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                    : 'border-slate-200 focus:ring-[var(--dynamic-accent-bg)]'
                }`}
                placeholder="+91 98765 43210"
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all bg-white text-base ${
                  errors.roleId 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-slate-200 focus:ring-[var(--dynamic-accent-bg)]'
                }`}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--dynamic-accent-bg)] bg-white text-base"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-base font-semibold border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.985]"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: 'var(--dynamic-accent-bg)',
                color: 'var(--dynamic-accent-text)',
              }}
              className="flex-1 py-4 text-base font-semibold rounded-2xl hover:brightness-105 active:scale-[0.985] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};