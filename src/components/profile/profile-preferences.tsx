'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface PreferencesCategory {
  id: string;
  label: string;
  description: string;
  value: string;
  icon: React.ReactNode;
}

interface ProfilePreferencesProps {
  userType: 'client' | 'fundi';
  preferences?: {
    preferred_categories?: string[];
    preferred_locations?: string[];
    preferred_budget_range?: { min: number; max: number };
    language?: string;
    currency?: string;
  };
  onPreferenceChange?: (category: string, value: string | string[]) => void;
}

export function ProfilePreferences({
  userType,
  preferences,
  onPreferenceChange,
}: ProfilePreferencesProps) {
  const fundiPreferences: PreferencesCategory[] = [
    {
      id: 'categories',
      label: 'Preferred Services',
      description: `Select the services you'd like to offer`,
      value: preferences?.preferred_categories?.join(', ') || 'Not set',
      icon: <Briefcase size={20} color={COLORS['energy-orange']} />,
    },
    {
      id: 'locations',
      label: 'Service Areas',
      description: 'Areas where you provide services',
      value: preferences?.preferred_locations?.join(', ') || 'Not set',
      icon: <MapPin size={20} color={COLORS['energy-orange']} />,
    },
    {
      id: 'language',
      label: 'Language',
      description: 'Preferred communication language',
      value: preferences?.language || 'English',
      icon: <FileText size={20} color={COLORS['energy-orange']} />,
    },
  ];

  const clientPreferences: PreferencesCategory[] = [
    {
      id: 'categories',
      label: 'Service Interests',
      description: 'Types of services you frequently need',
      value: preferences?.preferred_categories?.join(', ') || 'Not set',
      icon: <Briefcase size={20} color={COLORS['trust-green']} />,
    },
    {
      id: 'budget',
      label: 'Budget Range',
      description: 'Your typical project budget',
      value:
        preferences?.preferred_budget_range
          ? `KES ${preferences.preferred_budget_range.min?.toLocaleString()} - ${preferences.preferred_budget_range.max?.toLocaleString()}`
          : 'Not set',
      icon: <DollarSign size={20} color={COLORS['trust-green']} />,
    },
    {
      id: 'language',
      label: 'Language',
      description: 'Preferred communication language',
      value: preferences?.language || 'English',
      icon: <FileText size={20} color={COLORS['trust-green']} />,
    },
    {
      id: 'currency',
      label: 'Currency',
      description: 'Currency for displaying amounts',
      value: preferences?.currency || 'KES',
      icon: <TrendingUp size={20} color={COLORS['trust-green']} />,
    },
  ];

  const categoryList = userType === 'fundi' ? fundiPreferences : clientPreferences;
  const accentColor = userType === 'fundi' ? COLORS['energy-orange'] : COLORS['trust-green'];

  const PreferenceCard = ({ item }: { item: PreferencesCategory }) => (
    <motion.div
      variants={ANIMATIONS.itemVariants}
      whileHover={{ y: -2, boxShadow: SHADOWS.md }}
      onClick={() => onPreferenceChange?.(item.id, '')}
      className="p-4 rounded-lg bg-white cursor-pointer transition-all"
      style={{ boxShadow: SHADOWS.sm }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {item.icon}
            <p className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
              {item.label}
            </p>
          </div>
          <p className="text-xs mb-2" style={{ color: COLORS['text-muted'] }}>
            {item.description}
          </p>
          <p className="text-sm font-semibold" style={{ color: accentColor }}>
            {item.value}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h2 className="text-lg font-bold" style={{ color: COLORS['text-dark'] }}>
          Your Preferences
        </h2>
        <p className="text-sm mt-1" style={{ color: COLORS['text-muted'] }}>
          {userType === 'fundi'
            ? 'Customize your profile to attract better matches'
            : 'Help us recommend relevant services and fundis'}
        </p>
      </motion.div>

      {/* Preferences Grid */}
      <motion.div
        variants={ANIMATIONS.containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {categoryList.map((item) => (
          <PreferenceCard key={item.id} item={item} />
        ))}
      </motion.div>

      {/* Info Box */}
      <motion.div
        variants={ANIMATIONS.itemVariants}
        className="p-4 rounded-lg"
        style={{
          backgroundColor: `${accentColor}15`,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div className="flex gap-3">
          <Users size={20} style={{ color: accentColor, marginTop: '2px' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: COLORS['text-dark'] }}>
              {userType === 'fundi' ? 'Attract Better Clients' : 'Get Better Recommendations'}
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS['text-muted'] }}>
              {userType === 'fundi'
                ? 'Updating your preferences helps clients find you for the right jobs'
                : 'Your preferences help us show you the most relevant opportunity and fundis'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
