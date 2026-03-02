'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, X, Plus, Trash2 } from 'lucide-react';
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
    hourly_rate?: number;
  };
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

interface Specialty {
  id: string;
  specialty: string;
}

interface ServiceArea {
  id: string;
  area_name: string;
  latitude: number;
  longitude: number;
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
  
  // Specialty and service area state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingServiceAreas, setLoadingServiceAreas] = useState(false);

  // Fetch specialties and service areas on mount (for fundis only)
  useEffect(() => {
    if (userType === 'fundi') {
      fetchSpecialties();
      fetchServiceAreas();
    }
  }, [userType]);

  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await fetch('/api/specialties?fundiId=current');
      if (response.ok) {
        const data = await response.json();
        console.log('[EditProfileForm] Fetched specialties:', data);
        setSpecialties(data || []);
      }
    } catch (error) {
      console.error('[EditProfileForm] Error fetching specialties:', error);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchServiceAreas = async () => {
    try {
      setLoadingServiceAreas(true);
      const response = await fetch('/api/service-areas?fundiId=current');
      if (response.ok) {
        const data = await response.json();
        console.log('[EditProfileForm] Fetched service areas:', data);
        setServiceAreas(data || []);
      }
    } catch (error) {
      console.error('[EditProfileForm] Error fetching service areas:', error);
    } finally {
      setLoadingServiceAreas(false);
    }
  };

  const addSpecialty = async () => {
    if (!newSpecialty.trim()) {
      console.warn('[EditProfileForm] Specialty input is empty');
      return;
    }

    try {
      console.log('[EditProfileForm] Adding specialty:', newSpecialty);
      const response = await fetch('/api/specialties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty: newSpecialty.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[EditProfileForm] Specialty added:', result);
        setSpecialties([...specialties, result]);
        setNewSpecialty('');
      } else {
        const error = await response.json();
        console.error('[EditProfileForm] Failed to add specialty:', error);
      }
    } catch (error) {
      console.error('[EditProfileForm] Error adding specialty:', error);
    }
  };

  const removeSpecialty = async (id: string) => {
    try {
      console.log('[EditProfileForm] Removing specialty:', id);
      const response = await fetch(`/api/specialties/${id}`, { method: 'DELETE' });

      if (response.ok) {
        console.log('[EditProfileForm] Specialty removed');
        setSpecialties(specialties.filter((s) => s.id !== id));
      } else {
        console.error('[EditProfileForm] Failed to remove specialty');
      }
    } catch (error) {
      console.error('[EditProfileForm] Error removing specialty:', error);
    }
  };

  const addServiceArea = async () => {
    if (!newServiceArea.trim()) {
      console.warn('[EditProfileForm] Service area input is empty');
      return;
    }

    try {
      console.log('[EditProfileForm] Adding service area:', newServiceArea);
      // For now, we'll use a default location (0, 0) - in a real app, you'd use a map picker
      const response = await fetch('/api/service-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_name: newServiceArea.trim(),
          latitude: 0,
          longitude: 0,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[EditProfileForm] Service area added:', result);
        setServiceAreas([...serviceAreas, result]);
        setNewServiceArea('');
      } else {
        const error = await response.json();
        console.error('[EditProfileForm] Failed to add service area:', error);
      }
    } catch (error) {
      console.error('[EditProfileForm] Error adding service area:', error);
    }
  };

  const removeServiceArea = async (id: string) => {
    try {
      console.log('[EditProfileForm] Removing service area:', id);
      const response = await fetch(`/api/service-areas/${id}`, { method: 'DELETE' });

      if (response.ok) {
        console.log('[EditProfileForm] Service area removed');
        setServiceAreas(serviceAreas.filter((s) => s.id !== id));
      } else {
        console.error('[EditProfileForm] Failed to remove service area');
      }
    } catch (error) {
      console.error('[EditProfileForm] Error removing service area:', error);
    }
  };

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
    console.log(`[EditProfileForm] Field changed: ${field} = ${value}`);
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
    console.log("[EditProfileForm] Form submitted with data:", formData);
    if (!validateForm()) {
      console.log("[EditProfileForm] Validation failed");
      return;
    }

    setLoading(true);
    try {
      console.log("[EditProfileForm] Calling onSave...");
      await onSave?.({
        ...formData,
        profile_image: profileImage || previewUrl,
      });
      console.log("[EditProfileForm] Save completed");
    } catch (error) {
      console.error("[EditProfileForm] Save error:", error);
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
            {/* Specialties */}
            <motion.div variants={ANIMATIONS.itemVariants}>
              <label
                className="block text-sm font-bold mb-3"
                style={{ color: COLORS['text-dark'] }}
              >
                Specialties
              </label>
              <div className="space-y-3">
                {/* Add Specialty Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Electrical Work"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border-2"
                    style={{
                      borderColor: COLORS['trust-green'],
                      backgroundColor: `${COLORS['trust-green']}10`,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addSpecialty}
                    className="px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2"
                    style={{ backgroundColor: COLORS['trust-green'] }}
                  >
                    <Plus size={18} />
                  </motion.button>
                </div>

                {/* Specialties List */}
                <div className="flex flex-wrap gap-2">
                  {loadingSpecialties ? (
                    <p style={{ color: COLORS['text-muted'] }}>Loading specialties...</p>
                  ) : specialties.length > 0 ? (
                    specialties.map((spec) => (
                      <motion.div
                        key={spec.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="px-3 py-2 rounded-full flex items-center gap-2"
                        style={{
                          backgroundColor: `${COLORS['trust-green']}20`,
                          border: `1px solid ${COLORS['trust-green']}`,
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: COLORS['trust-green'] }}>
                          {spec.specialty}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSpecialty(spec.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <p style={{ color: COLORS['text-muted'] }}>No specialties added yet</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Service Areas */}
            <motion.div variants={ANIMATIONS.itemVariants}>
              <label
                className="block text-sm font-bold mb-3"
                style={{ color: COLORS['text-dark'] }}
              >
                Service Areas
              </label>
              <div className="space-y-3">
                {/* Add Service Area Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Nairobi CBD, Westlands"
                    value={newServiceArea}
                    onChange={(e) => setNewServiceArea(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addServiceArea();
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border-2"
                    style={{
                      borderColor: COLORS['energy-orange'],
                      backgroundColor: `${COLORS['energy-orange']}10`,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addServiceArea}
                    className="px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2"
                    style={{ backgroundColor: COLORS['energy-orange'] }}
                  >
                    <Plus size={18} />
                  </motion.button>
                </div>

                {/* Service Areas List */}
                <div className="flex flex-wrap gap-2">
                  {loadingServiceAreas ? (
                    <p style={{ color: COLORS['text-muted'] }}>Loading service areas...</p>
                  ) : serviceAreas.length > 0 ? (
                    serviceAreas.map((area) => (
                      <motion.div
                        key={area.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="px-3 py-2 rounded-full flex items-center gap-2"
                        style={{
                          backgroundColor: `${COLORS['energy-orange']}20`,
                          border: `1px solid ${COLORS['energy-orange']}`,
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: COLORS['energy-orange'] }}>
                          {area.area_name}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeServiceArea(area.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <p style={{ color: COLORS['text-muted'] }}>No service areas added yet</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={ANIMATIONS.itemVariants}>
              <ModernFormInput
                label="Hourly Rate (KES)"
                placeholder="e.g., 500"
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) =>
                  handleInputChange('hourly_rate', parseInt(e.target.value) || 0)
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
