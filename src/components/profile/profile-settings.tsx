'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  Bell,
  LogOut,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface SettingsSection {
  icon: React.ReactNode;
  label: string;
  description: string;
  onAction?: () => void;
  isDangerous?: boolean;
}

interface ProfileSettingsProps {
  settings: {
    private_profile?: boolean;
    show_phone?: boolean;
    show_email?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    marketing_emails?: boolean;
  };
  onSettingChange?: (setting: string, value: boolean) => void;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
}

export function ProfileSettings({
  settings,
  onSettingChange,
  onSignOut,
  onDeleteAccount,
}: ProfileSettingsProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSignOutClick = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) {
      return;
    }

    setIsSigningOut(true);
    try {
      await onSignOut?.();
    } catch (error) {
      console.error('[ProfileSettings] Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccountClick = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await onDeleteAccount?.();
    } catch (error) {
      console.error('[ProfileSettings] Delete account error:', error);
      setIsDeletingAccount(false);
    }
  };
  const privacySections: SettingsSection[] = [
    {
      icon: <Eye size={20} color={COLORS['text-muted']} />,
      label: 'Private Profile',
      description: 'Hide your profile from public search',
      onAction: () => onSettingChange?.('private_profile', !settings.private_profile),
    },
    {
      icon: <Lock size={20} color={COLORS['text-muted']} />,
      label: 'Show Phone',
      description: 'Allow clients to see your phone number',
      onAction: () => onSettingChange?.('show_phone', !settings.show_phone),
    },
    {
      icon: <Lock size={20} color={COLORS['text-muted']} />,
      label: 'Show Email',
      description: 'Allow clients to see your email address',
      onAction: () => onSettingChange?.('show_email', !settings.show_email),
    },
  ];

  const notificationSections: SettingsSection[] = [
    {
      icon: <Bell size={20} color={COLORS['text-muted']} />,
      label: 'Email Notifications',
      description: 'Get notified about new bids and messages',
      onAction: () =>
        onSettingChange?.('email_notifications', !settings.email_notifications),
    },
    {
      icon: <Bell size={20} color={COLORS['text-muted']} />,
      label: 'SMS Notifications',
      description: 'Receive SMS alerts for urgent updates',
      onAction: () => onSettingChange?.('sms_notifications', !settings.sms_notifications),
    },
    {
      icon: <Bell size={20} color={COLORS['text-muted']} />,
      label: 'Marketing Emails',
      description: 'Receive tips and promotional offers',
      onAction: () => onSettingChange?.('marketing_emails', !settings.marketing_emails),
    },
  ];

  const securitySections: SettingsSection[] = [
    {
      icon: <Lock size={20} color={COLORS['text-muted']} />,
      label: 'Change Password',
      description: 'Update your account password',
    },
    {
      icon: <LogOut size={20} color={COLORS['text-muted']} />,
      label: 'Sign Out',
      description: 'Sign out from this device',
      onAction: handleSignOutClick,
    },
    {
      icon: <Trash2 size={20} color={COLORS['danger']} />,
      label: 'Delete Account',
      description: 'Permanently delete your account',
      onAction: handleDeleteAccountClick,
      isDangerous: true,
    },
  ];

  const SettingItem = ({ section, enabled, isLoading }: { section: SettingsSection; enabled?: boolean; isLoading?: boolean }) => (
    <motion.button
      whileHover={!isLoading ? { backgroundColor: COLORS['bg-light'] } : {}}
      onClick={section.onAction}
      disabled={isLoading}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
        isLoading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      style={{
        backgroundColor: section.isDangerous ? `${COLORS['danger']}10` : 'transparent',
      }}
    >
      <div className="flex items-start gap-3">
        {section.icon}
        <div className="text-left">
          <p
            className="font-bold text-sm"
            style={{
              color: section.isDangerous ? COLORS['danger'] : COLORS['text-dark'],
            }}
          >
            {isLoading && section.label === 'Sign Out' ? 'Signing out...' : section.label}
            {isLoading && section.label === 'Delete Account' ? 'Deleting...' : section.label}
          </p>
          <p
            className="text-xs"
            style={{ color: COLORS['text-muted'] }}
          >
            {section.description}
          </p>
        </div>
      </div>

      {enabled !== undefined ? (
        <div
          className={`w-10 h-6 rounded-full transition-all flex items-center ${
            enabled ? 'pl-5' : 'pr-5'
          }`}
          style={{
            backgroundColor: enabled ? COLORS['trust-green'] : '#d1d5db',
          }}
        >
          <div
            className="w-5 h-5 rounded-full bg-white transition-all"
          />
        </div>
      ) : (
        <motion.div
          animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
        >
          <ChevronRight size={20} color={COLORS['text-muted']} />
        </motion.div>
      )}
    </motion.button>
  );

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Privacy Section */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: COLORS['text-dark'] }}
        >
          Privacy Settings
        </h2>
        <div
          className="rounded-lg overflow-hidden bg-white"
          style={{ boxShadow: SHADOWS.sm }}
        >
          {privacySections.map((section, i) => (
            <div
              key={i}
              className={i < privacySections.length - 1 ? 'border-b-2' : ''}
              style={{ borderColor: '#e5e7eb' }}
            >
              <SettingItem
                section={section}
                enabled={
                  section.label === 'Private Profile'
                    ? settings.private_profile
                    : section.label === 'Show Phone'
                      ? settings.show_phone
                      : section.label === 'Show Email'
                        ? settings.show_email
                        : undefined
                }
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notification Section */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: COLORS['text-dark'] }}
        >
          Notification Preferences
        </h2>
        <div
          className="rounded-lg overflow-hidden bg-white"
          style={{ boxShadow: SHADOWS.sm }}
        >
          {notificationSections.map((section, i) => (
            <div
              key={i}
              className={i < notificationSections.length - 1 ? 'border-b-2' : ''}
              style={{ borderColor: '#e5e7eb' }}
            >
              <SettingItem
                section={section}
                enabled={
                  section.label === 'Email Notifications'
                    ? settings.email_notifications
                    : section.label === 'SMS Notifications'
                      ? settings.sms_notifications
                      : section.label === 'Marketing Emails'
                        ? settings.marketing_emails
                        : undefined
                }
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: COLORS['text-dark'] }}
        >
          Account & Security
        </h2>
        <div
          className="rounded-lg overflow-hidden bg-white"
          style={{ boxShadow: SHADOWS.sm }}
        >
          {securitySections.map((section, i) => (
            <div
              key={i}
              className={i < securitySections.length - 1 ? 'border-b-2' : ''}
              style={{ borderColor: '#e5e7eb' }}
            >
              <SettingItem
                section={section}
                isLoading={
                  section.label === 'Sign Out' ? isSigningOut : section.label === 'Delete Account' ? isDeletingAccount : false
                }
              />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
