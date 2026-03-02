'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';
import { initializeUserProfile } from '@/app/actions/profiles';
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Share2,
  MoreVertical,
  ArrowLeft,
  Upload,
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
import { updateProfileData } from '@/app/actions/profiles';

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
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [portfolioImage, setPortfolioImage] = useState<File | null>(null);
  const [portfolioPreview, setPortfolioPreview] = useState<string>('');
  const [ratings, setRatings] = useState({ average: 0, count: 0, jobs: 0 });
  const [settings, setSettings] = useState({
    private_profile: false,
    show_phone: true,
    show_email: false,
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!supabase) {
          console.error("[ProfilePage] Supabase client not available");
          setError('Supabase is not configured');
          setIsLoading(false);
          return;
        }

        console.log("[ProfilePage] Loading profile...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error("[ProfilePage] Auth error:", authError);
        }

        if (!user) {
          console.log("[ProfilePage] No user found, redirecting to sign-in");
          setError('Not authenticated');
          router.push('/sign-in');
          return;
        }

        console.log("[ProfilePage] User found:", user.id);

        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error("[ProfilePage] Profile query error:", profileError);
          setError(profileError.message);
          return;
        }

        // Auto-create profile if it doesn't exist (for users who signed in before profile creation was auto)
        if (!profileData) {
          console.warn("[ProfilePage] Profile not found for user, attempting to auto-create...");
          try {
            await initializeUserProfile();
            console.log("[ProfilePage] Profile auto-created, retrying query...");
            
            // Retry the query
            const { data: newProfileData, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (retryError) {
              console.error("[ProfilePage] Error retrying profile query:", retryError);
              setError(retryError.message);
              return;
            }
            
            profileData = newProfileData;
          } catch (createError) {
            console.error("[ProfilePage] Error auto-creating profile:", createError);
            setError('Failed to create profile');
            return;
          }
        }

        if (!profileData) {
          console.error("[ProfilePage] No profile data found for user:", user.id);
          setError('Profile not found');
          return;
        }

        console.log("[ProfilePage] Profile data loaded:", profileData);

        setProfile({
          id: profileData.id,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone,
          email: user.email,
          location: profileData.location,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          user_type: profileData.role || 'client',
          hourly_rate: profileData.hourly_rate,
          completion_percentage: profileData.completion_percentage || 0,
          is_pro: profileData.is_pro || false,
          verification_status: profileData.verification_status || 'not_started',
        });

        // Check if this is initial setup (no name/location set yet)
        const isSetup = !!(profileData.first_name && profileData.location);
        setIsInitialSetup(!isSetup);
        
        // If initial setup not complete, open edit form automatically
        if (!isSetup) {
          console.log("[ProfilePage] Initial setup detected, opening edit form");
          setIsEditingProfile(true);
        }
      } catch (err) {
        console.error('[ProfilePage] Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [supabase, router]);

  // Fetch portfolio items for fundis
  useEffect(() => {
    if (profile?.user_type === 'fundi' && profile.id) {
      const fetchPortfolio = async () => {
        try {
          console.log('[ProfilePage] Fetching portfolio items for:', profile.id);
          const response = await fetch(`/api/portfolio?fundiId=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('[ProfilePage] Portfolio items loaded:', data);
            setPortfolioItems(data || []);
          } else {
            console.error('[ProfilePage] Failed to fetch portfolio');
          }
        } catch (error) {
          console.error('[ProfilePage] Error fetching portfolio:', error);
        }
      };
      fetchPortfolio();
    }
  }, [profile?.id, profile?.user_type]);

  // Fetch specialties for fundis
  useEffect(() => {
    if (profile?.user_type === 'fundi' && profile.id) {
      const fetchSpecialties = async () => {
        try {
          console.log('[ProfilePage] Fetching specialties for:', profile.id);
          const response = await fetch(`/api/specialties?fundiId=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('[ProfilePage] Specialties loaded:', data);
            setSpecialties(data?.map((s: any) => s.specialty) || []);
          } else {
            console.error('[ProfilePage] Failed to fetch specialties');
          }
        } catch (error) {
          console.error('[ProfilePage] Error fetching specialties:', error);
        }
      };
      fetchSpecialties();
    }
  }, [profile?.id, profile?.user_type]);

  // Fetch service areas for fundis
  useEffect(() => {
    if (profile?.user_type === 'fundi' && profile.id) {
      const fetchServiceAreas = async () => {
        try {
          console.log('[ProfilePage] Fetching service areas for:', profile.id);
          const response = await fetch(`/api/service-areas?fundiId=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('[ProfilePage] Service areas loaded:', data);
            setServiceAreas(data?.map((s: any) => s.area_name) || []);
          } else {
            console.error('[ProfilePage] Failed to fetch service areas');
          }
        } catch (error) {
          console.error('[ProfilePage] Error fetching service areas:', error);
        }
      };
      fetchServiceAreas();
    }
  }, [profile?.id, profile?.user_type]);

  // Fetch reviews/ratings for fundis
  useEffect(() => {
    if (profile?.user_type === 'fundi' && profile.id) {
      const fetchRatings = async () => {
        try {
          console.log('[ProfilePage] Fetching reviews for:', profile.id);
          const response = await fetch(`/api/reviews?userId=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('[ProfilePage] Reviews loaded:', data);
            const totalReviews = data?.length || 0;
            const averageRating = totalReviews > 0 
              ? data.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews 
              : 0;
            setRatings({
              average: Math.round(averageRating * 10) / 10,
              count: totalReviews,
              jobs: totalReviews, // Approximation - would need more data
            });
          }
        } catch (error) {
          console.error('[ProfilePage] Error fetching reviews:', error);
        }
      };
      fetchRatings();
    }
  }, [profile?.id, profile?.user_type]);

  const handleAddPortfolio = async () => {
    console.log('[ProfilePage] Opening portfolio upload modal');
    setIsAddingPortfolio(true);
  };

  const handlePortfolioImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPortfolioImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPortfolioPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      console.log('[ProfilePage] Portfolio image selected:', file.name);
    }
  };

  const handlePortfolioSubmit = async () => {
    console.log('[ProfilePage] Submitting portfolio item:', portfolioForm);
    
    if (!portfolioForm.title.trim() || !portfolioForm.description.trim() || !portfolioImage) {
      console.error('[ProfilePage] Missing required portfolio fields');
      alert('Title, description, and image are required');
      return;
    }

    try {
      setPortfolioLoading(true);

      // First, upload the image
      console.log('[ProfilePage] Uploading portfolio image...');
      const imageFormData = new FormData();
      imageFormData.append('file', portfolioImage);
      imageFormData.append('folder', 'portfolio');

      const imageResponse = await fetch('/api/images', {
        method: 'POST',
        body: imageFormData,
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url: imageUrl } = await imageResponse.json();
      console.log('[ProfilePage] Image uploaded to:', imageUrl);

      // Then, create the portfolio item
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: portfolioForm.title.trim(),
          description: portfolioForm.description.trim(),
          category: portfolioForm.category.trim() || null,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portfolio item');
      }

      const newItem = await response.json();
      console.log('[ProfilePage] Portfolio item created:', newItem);

      // Add to local state
      setPortfolioItems([newItem, ...portfolioItems]);

      // Reset form
      setPortfolioForm({ title: '', description: '', category: '' });
      setPortfolioImage(null);
      setPortfolioPreview('');
      setIsAddingPortfolio(false);

      alert('Portfolio item added successfully!');
    } catch (error) {
      console.error('[ProfilePage] Error uploading portfolio item:', error);
      alert('Failed to add portfolio item. Please try again.');
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    console.log('[ProfilePage] Deleting portfolio item:', itemId);
    
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/${itemId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete portfolio item');
      }
      console.log('[ProfilePage] Portfolio item deleted');
      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('[ProfilePage] Error deleting portfolio item:', error);
      alert('Failed to delete portfolio item');
    }
  };

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.warn('[Header] Supabase not configured, cannot logout');
        return;
      }
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[SignOut] Error:', error.message);
        alert('Failed to sign out: ' + error.message);
        return;
      }

      console.log('[SignOut] Successfully signed out');
      
      // Refresh server state and redirect
      router.refresh();
      router.push('/sign-in');
    } catch (error) {
      console.error('[SignOut] Exception:', error);
      alert('An error occurred while signing out');
    }
  };

  const tabs: TabInfo[] = [
    { id: 'profile', label: 'Profile', enabled: true },
    { id: 'reviews', label: 'Reviews', enabled: true },
    { id: 'verification', label: 'Verification', enabled: profile?.user_type === 'fundi' },
    { id: 'preferences', label: 'Preferences', enabled: true },
    { id: 'settings', label: 'Settings', enabled: isOwnProfile },
  ];

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleProfileUpdate = async (updatedData: Partial<ProfileData>) => {
    if (!profile) return;

    try {
      // Create FormData for the server action
      const formData = new FormData();
      if (updatedData.first_name) formData.append("first_name", updatedData.first_name);
      if (updatedData.last_name) formData.append("last_name", updatedData.last_name);
      if (updatedData.phone) formData.append("phone", updatedData.phone);
      if (updatedData.location) formData.append("location", updatedData.location);
      if (updatedData.bio) formData.append("bio", updatedData.bio);
      if (updatedData.hourly_rate) formData.append("hourly_rate", String(updatedData.hourly_rate));

      // Call the server action to save changes
      console.log("[ProfilePage] Saving profile updates...");
      await updateProfileData(formData);
      console.log("[ProfilePage] Profile saved successfully");

      // Update local state
      setProfile((prev) => 
        prev ? {
          ...prev,
          ...updatedData,
          completion_percentage: Math.min(
            100,
            (Object.keys(updatedData).length / 8) * 100
          ),
        } : null
      );
      setIsEditingProfile(false);

      // If this was initial setup, redirect to dashboard after saving
      if (isInitialSetup && updatedData.first_name && updatedData.location) {
        console.log("[ProfilePage] Initial setup complete, redirecting to dashboard");
        setIsInitialSetup(false);
        
        // Give user feedback before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dashboardUrl = profile.user_type === 'fundi' ? '/pro-dashboard' : '/dashboard';
        console.log("[ProfilePage] Redirecting to:", dashboardUrl);
        router.push(dashboardUrl);
      }
    } catch (error) {
      console.error("[ProfilePage] Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to save profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS['bg-light'] }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 rounded-full"
          style={{ borderColor: COLORS['energy-orange'], borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS['bg-light'] }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: COLORS['danger'] }}>
            {error || 'Profile not found'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-lg font-bold text-white"
            style={{ backgroundColor: COLORS['energy-orange'] }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                      ? 'Professional Fundi'
                      : 'Business Owner'}
                  </p>
                </div>

                {isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log("[ProfilePage] Edit Profile button clicked");
                      setIsEditingProfile(true);
                    }}
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
                    average_rating: ratings.average,
                    total_reviews: ratings.count,
                    total_jobs: ratings.jobs,
                    specialties: specialties,
                    service_areas: serviceAreas,
                    portfolio_items: portfolioItems.map(item => ({
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      image: item.image_url,
                      category: item.category,
                    })),
                    verification_status: (
                      profile.verification_status === 'not_started'
                        ? undefined
                        : (profile.verification_status as 'verified' | 'pending' | 'rejected')
                    ),
                  }}
                  isOwnProfile={isOwnProfile}
                  onAddPortfolio={handleAddPortfolio}
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
              onSignOut={handleSignOut}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ 
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
          onClick={() => {
            console.log("[ProfilePage] Modal background clicked, closing");
            setIsEditingProfile(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => {
              console.log("[ProfilePage] Modal content clicked (should not close)");
              e.stopPropagation();
            }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6"
            style={{ 
              boxShadow: SHADOWS.xl,
              zIndex: 10000,
              pointerEvents: 'auto'
            }}
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
                console.log("[ProfilePage] Profile save requested with data:", data);
                await Promise.resolve(handleProfileUpdate(data));
              }}
              onCancel={() => {
                console.log("[ProfilePage] Edit form cancelled");
                setIsEditingProfile(false);
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Portfolio Upload Modal */}
      {isAddingPortfolio && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ 
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
          onClick={() => {
            console.log("[ProfilePage] Portfolio modal background clicked, closing");
            setIsAddingPortfolio(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-8 max-w-md w-full"
            style={{ 
              boxShadow: SHADOWS.xl,
              zIndex: 10000,
              pointerEvents: 'auto'
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: COLORS['text-dark'] }}
            >
              Add Portfolio Item
            </h2>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Work Image
                </label>
                {portfolioPreview && (
                  <div className="mb-3 rounded-lg overflow-hidden" style={{ boxShadow: SHADOWS.sm }}>
                    <img src={portfolioPreview} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                  style={{
                    borderColor: COLORS['trust-green'],
                    backgroundColor: `${COLORS['trust-green']}10`,
                  }}
                >
                  <Upload size={20} color={COLORS['trust-green']} />
                  <span className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
                    {portfolioPreview ? 'Change Image' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioImageChange}
                    className="hidden"
                  />
                </motion.label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: COLORS['text-dark'] }}>
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kitchen Renovation"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2"
                  style={{
                    borderColor: COLORS['trust-green'],
                    backgroundColor: `${COLORS['trust-green']}10`,
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: COLORS['text-dark'] }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe the project..."
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 resize-none"
                  rows={4}
                  style={{
                    borderColor: COLORS['trust-green'],
                    backgroundColor: `${COLORS['trust-green']}10`,
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: COLORS['text-dark'] }}>
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Electrical, Plumbing"
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2"
                  style={{
                    borderColor: COLORS['trust-green'],
                    backgroundColor: `${COLORS['trust-green']}10`,
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddingPortfolio(false)}
                  disabled={portfolioLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-bold border-2 transition-all disabled:opacity-50"
                  style={{
                    borderColor: COLORS['text-muted'],
                    color: COLORS['text-dark'],
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePortfolioSubmit}
                  disabled={portfolioLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: COLORS['trust-green'] }}
                >
                  {portfolioLoading ? 'Adding...' : 'Add Portfolio'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
