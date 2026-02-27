'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, X } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { ModernFormInput } from '@/components/forms/modern-form-input';
import { ModernFormTextarea } from '@/components/forms/modern-form-textarea';

interface EditProfileFormProps {
  userType: 'client' | 'fundi';
  initialData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    profile_image?: string;
    // Fundi specific
    specialties?: string[];
    hourly_rate?: number;
    experience_years?: number;
    // Client specific
    preferred_budget_min?: number;
    preferred_budget_max?: number;
  };
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function EditProfileForm({
  userType,
  initialData,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.profile_image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave?.({ ...formData, profile_image: profileImage || previewUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-6 md:p-8"
      style={{ boxShadow: SHADOWS.md }}
    >
      <motion.div
        variants={ANIMATIONS.containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile Picture */}
        <motion.div variants={ANIMATIONS.itemVariants}>
          <label
            className="block text-sm font-bold mb-3"
            style={{ color: COLORS['text-dark'] }}
          >
            Profile Picture
          </label>
          <div className="flex gap-4 items-start">
            {previewUrl && (
              <div
                className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                style={{
                  borderColor: COLORS['trust-green'],
                  backgroundColor: `${COLORS['trust-green']}10`,
                }}
              >
                <Upload size={20} color={COLORS['trust-green']} />
                <span
                  className="font-bold text-sm"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Upload Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </motion.label>
              <p
                className="text-xs mt-2"
                style={{ color: COLORS['text-muted'] }}
              >
                JPG, PNG, or GIF up to 5MB
              </p>
            </div>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div variants={ANIMATIONS.itemVariants} className="grid md:grid-cols-2 gap-4">
          <ModernFormInput
            label="First Name"
            placeholder="e.g., John"
            value={formData.first_name || ''}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            error={errors.first_name}
          />
          <ModernFormInput
            label="Last Name"
            placeholder="e.g., Doe"
            value={formData.last_name || ''}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            error={errors.last_name}
          />
        </motion.div>

        <motion.div variants={ANIMATIONS.itemVariants}>
          <ModernFormInput
            label="Phone"
            placeholder="+254712345678"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
          />
        </motion.div>

        <motion.div variants={ANIMATIONS.itemVariants}>
          <ModernFormInput
            label="Location"
            placeholder="e.g., Karen, Nairobi"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            error={errors.location}
          />
        </motion.div>

        <motion.div variants={ANIMATIONS.itemVariants}>
          <ModernFormTextarea
            label="Bio"
            placeholder="Tell people about yourself..."
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            charLimit={500}
          />
        </motion.div>

        {/* Fundi-Specific Fields */}
        {userType === 'fundi' && (
          <>
            <motion.div variants={ANIMATIONS.itemVariants} className="grid md:grid-cols-2 gap-4">
              <ModernFormInput
                label="Hourly Rate (KES)"
                placeholder="e.g., 500"
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) =>
                  handleInputChange('hourly_rate', parseInt(e.target.value) || 0)
                }
              />
              <ModernFormInput
                label="Years of Experience"
                placeholder="e.g., 5"
                type="number"
                value={formData.experience_years || ''}
                onChange={(e) =>
                  handleInputChange('experience_years', parseInt(e.target.value) || 0)
                }
              />
            </motion.div>
          </>
        )}

        {/* Client-Specific Fields */}
        {userType === 'client' && (
          <>
            <motion.div variants={ANIMATIONS.itemVariants} className="grid md:grid-cols-2 gap-4">
              <ModernFormInput
                label="Preferred Min Budget (KES)"
                placeholder="e.g., 1000"
                type="number"
                value={formData.preferred_budget_min || ''}
                onChange={(e) =>
                  handleInputChange('preferred_budget_min', parseInt(e.target.value) || 0)
                }
              />
              <ModernFormInput
                label="Preferred Max Budget (KES)"
                placeholder="e.g., 10000"
                type="number"
                value={formData.preferred_budget_max || ''}
                onChange={(e) =>
                  handleInputChange('preferred_budget_max', parseInt(e.target.value) || 0)
                }
              />
            </motion.div>
          </>
        )}

        {/* Buttons */}
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="flex gap-3 pt-4 border-t-2"
          style={{ borderColor: '#e5e7eb' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            style={{
              backgroundColor: COLORS['bg-light'],
              color: COLORS['text-dark'],
              border: `2px solid #e5e7eb`,
            }}
          >
            <X size={18} />
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-full font-bold text-white flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ backgroundColor: COLORS['trust-green'] }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
