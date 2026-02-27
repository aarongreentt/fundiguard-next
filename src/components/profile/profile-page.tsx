'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Share2,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { ProfileCompletionIndicator } from '@/components/profile/profile-completion-indicator';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { FundiProfileSection } from '@/components/profile/fundi-profile-section';
import { ClientProfileSection } from '@/components/profile/client-profile-section';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfilePreferences } from '@/components/profile/profile-preferences';
import { ProfileVerification } from '@/components/profile/profile-verification';
import { ProfileReviews } from '@/components/profile/profile-reviews';

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  user_type?: 'client' | 'fundi';
  hourly_rate?: number;
  experience_years?: number;
  preferred_budget_min?: number;
  preferred_budget_max?: number;
  completion_percentage?: number;
  is_pro?: boolean;
  verification_status?: 'verified' | 'pending' | 'rejected' | 'not_started';
}

interface TabInfo {
  id: string;
  label: string;
  enabled: boolean;
}

export function ProfilePage({ isOwnProfile = true }: { isOwnProfile?: boolean }) {
  const [profile, setProfile] = useState<ProfileData>({
    id: 'user-123',
    first_name: 'John',
    last_name: 'Ochieng',
    phone: '+254 712 345 678',
    email: 'john@example.com',
    location: 'Nairobi, Kenya',
    bio: 'Professional electrician with 8+ years of experience',
    avatar_url: '👨',
    user_type: 'fundi',
    hourly_rate: 1500,
    experience_years: 8,
    completion_percentage: 85,
    is_pro: true,
    verification_status: 'verified',
  });

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [settings, setSettings] = useState({
    private_profile: false,
    show_phone: true,
    show_email: false,
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
  });

  const tabs: TabInfo[] = [
    { id: 'profile', label: 'Profile', enabled: true },
    { id: 'reviews', label: 'Reviews', enabled: true },
    { id: 'verification', label: 'Verification', enabled: profile.user_type === 'fundi' },
    { id: 'preferences', label: 'Preferences', enabled: true },
    { id: 'settings', label: 'Settings', enabled: isOwnProfile },
  ];

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleProfileUpdate = (updatedData: Partial<ProfileData>) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
      completion_percentage: Math.min(
        100,
        (Object.keys(updatedData).length / 8) * 100
      ),
    }));
    setIsEditingProfile(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-4 pb-32 px-4"
      style={{ backgroundColor: COLORS['bg-light'] }}
    >
      {/* Header */}
      <motion.div
        variants={ANIMATIONS.slideUpIn}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg transition-all"
            style={{ backgroundColor: 'white', boxShadow: SHADOWS.sm }}
          >
            <ArrowLeft size={20} color={COLORS['text-dark']} />
          </motion.button>

          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg transition-all"
                style={{ backgroundColor: 'white', boxShadow: SHADOWS.sm }}
              >
                <Share2 size={20} color={COLORS['energy-orange']} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg transition-all"
                style={{ backgroundColor: 'white', boxShadow: SHADOWS.sm }}
              >
                <MoreVertical size={20} color={COLORS['text-muted']} />
              </motion.button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <motion.div
          variants={ANIMATIONS.slideUpIn}
          className="p-6 rounded-lg bg-white mb-6"
          style={{ boxShadow: SHADOWS.md }}
        >
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl relative"
              style={{ backgroundColor: COLORS['bg-light'] }}
            >
              {profile.avatar_url}
              {profile.is_pro && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: COLORS['energy-orange'] }}
                >
                  ✓
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: COLORS['text-muted'] }}>
                    {profile.user_type === 'fundi'
                      ? `${profile.experience_years} years experience`
                      : 'Business Owner'}
                  </p>
                </div>

                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
                    style={{
                      backgroundColor: COLORS['energy-orange'],
                      color: 'white',
                    }}
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </motion.button>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {settings.show_phone && profile.phone && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: COLORS['text-muted'] }}>
                    <Phone size={16} />
                    {profile.phone}
                  </div>
                )}
                {settings.show_email && profile.email && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: COLORS['text-muted'] }}>
                    <Mail size={16} />
                    {profile.email}
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: COLORS['text-muted'] }}>
                    <MapPin size={16} />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: COLORS['text-dark'] }}
            >
              {profile.bio}
            </p>
          )}
        </motion.div>

        {/* Completion Indicator */}
        {isOwnProfile && (
          <motion.div variants={ANIMATIONS.slideUpIn} className="mb-6">
            <ProfileCompletionIndicator
              completionPercentage={profile.completion_percentage || 75}
              completedFields={['first_name', 'last_name', 'phone', 'bio', 'location']}
              totalFields={8}
            />
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          variants={ANIMATIONS.slideUpIn}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {tabs
            .filter((tab) => tab.enabled)
            .map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-600 bg-white'
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab.id ? COLORS['energy-orange'] : 'white',
                  boxShadow: activeTab === tab.id ? SHADOWS.md : SHADOWS.sm,
                }}
              >
                {tab.label}
              </motion.button>
            ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {profile.user_type === 'fundi' ? (
                <FundiProfileSection
                  profile={{
                    hourly_rate: profile.hourly_rate,
                    experience_years: profile.experience_years,
                    average_rating: 4.8,
                    total_reviews: 47,
                    total_jobs: 47,
                    specialties: ['Electrical', 'Installation', 'Repairs'],
                    service_areas: ['Nairobi CBD', 'Westlands', 'Karen'],
                    portfolio_items: [],
                    verification_status: (
                      profile.verification_status === 'not_started'
                        ? undefined
                        : (profile.verification_status as 'verified' | 'pending' | 'rejected')
                    ),
                  }}
                  isOwnProfile={isOwnProfile}
                />
              ) : (
                <ClientProfileSection
                  profile={{}}
                  isOwnProfile={isOwnProfile}
                />
              )}
            </>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <ProfileReviews userType={profile.user_type} />
          )}

          {/* Verification Tab (Fundi only) */}
          {activeTab === 'verification' && profile.user_type === 'fundi' && (
            <ProfileVerification
              isPro={profile.is_pro}
              verificationStatus={profile.verification_status}
            />
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <ProfilePreferences userType={profile.user_type || 'fundi'} />
          )}

          {/* Settings Tab (Own profile only) */}
          {activeTab === 'settings' && isOwnProfile && (
            <ProfileSettings
              settings={settings}
              onSettingChange={handleSettingChange}
              onSignOut={() => console.log('Sign out clicked')}
              onDeleteAccount={() => console.log('Delete account clicked')}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setIsEditingProfile(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6"
            style={{ boxShadow: SHADOWS.xl }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: COLORS['text-dark'] }}
            >
              Edit Profile
            </h2>
            <EditProfileForm
              userType={profile.user_type || 'fundi'}
              initialData={profile}
              onSave={async (data) => {
                await Promise.resolve(handleProfileUpdate(data));
              }}
              onCancel={() => setIsEditingProfile(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
