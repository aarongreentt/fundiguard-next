'use client';

import { motion } from 'framer-motion';
import {
  User,
  MessageSquare,
  Star,
  Settings,
  Shield,
  Heart,
  Briefcase,
  Bell,
} from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface ProfileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface ProfileNavbarProps {
  userType?: 'fundi' | 'client';
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  unreadMessages?: number;
  pendingJobs?: number;
}

export function ProfileNavbar({
  userType = 'fundi',
  activeSection = 'profile',
  onSectionChange,
  unreadMessages = 0,
  pendingJobs = 0,
}: ProfileNavbarProps) {
  const baseItems: ProfileNavItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={20} />,
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <Briefcase size={20} />,
      disabled: userType === 'client',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star size={20} />,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare size={20} />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
  ];

  const fundiItems: ProfileNavItem[] = [
    ...baseItems,
    {
      id: 'verification',
      label: 'Verification',
      icon: <Shield size={20} />,
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: <Star size={20} />,
    },
  ];

  const clientItems: ProfileNavItem[] = [
    ...baseItems,
    {
      id: 'saved',
      label: 'Saved',
      icon: <Heart size={20} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      badge: pendingJobs > 0 ? pendingJobs : undefined,
    },
  ];

  const items = userType === 'fundi' ? fundiItems : clientItems;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-20 bg-white z-20 border-b-2"
      style={{ borderColor: '#e5e7eb', boxShadow: SHADOWS.sm }}
    >
      <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !item.disabled && onSectionChange?.(item.id)}
            disabled={item.disabled}
            className={`px-4 py-3 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all relative whitespace-nowrap ${
              activeSection === item.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-700'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              backgroundColor:
                activeSection === item.id ? COLORS['energy-orange'] : 'transparent',
              borderBottom:
                activeSection === item.id ? 'none' : `2px solid transparent`,
            }}
          >
            <motion.div
              initial={false}
              animate={{
                color:
                  activeSection === item.id
                    ? 'white'
                    : COLORS['text-muted'],
              }}
            >
              {item.icon}
            </motion.div>

            {item.label}

            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: COLORS['danger'] }}
              >
                {typeof item.badge === 'number' && item.badge > 9
                  ? '9+'
                  : item.badge}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
