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
import { changePassword } from '@/app/actions/profiles';

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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
    setPasswordError(null);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError(null);

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Call the server action to change the password
      const formData = new FormData();
      formData.append('currentPassword', passwordForm.currentPassword);
      formData.append('newPassword', passwordForm.newPassword);
      formData.append('confirmPassword', passwordForm.confirmPassword);

      console.log('[ProfileSettings] Calling changePassword action');
      await changePassword(formData);
      console.log('[ProfileSettings] Password changed successfully');

      alert('Password updated successfully');
      setShowChangePasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('[ProfileSettings] Password change error:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
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
      onAction: handleChangePasswordClick,
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
            {isLoading && section.label === 'Sign Out'
              ? 'Signing out...'
              : isLoading && section.label === 'Delete Account'
                ? 'Deleting...'
                : section.label}
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => !isChangingPassword && setShowChangePasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg bg-white p-6"
            style={{ boxShadow: SHADOWS.xl }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: COLORS['text-dark'] }}
            >
              Change Password
            </h2>

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border-l-4"
                style={{ borderColor: COLORS['danger'] }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: COLORS['danger'] }}
                >
                  {passwordError}
                </p>
              </motion.div>
            )}

            <motion.div variants={ANIMATIONS.containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={ANIMATIONS.itemVariants}>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  disabled={isChangingPassword}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all disabled:opacity-50"
                  style={{
                    borderColor: COLORS['border-light'],
                    backgroundColor: 'white',
                  }}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants}>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: COLORS['text-dark'] }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  disabled={isChangingPassword}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all disabled:opacity-50"
                  style={{
                    borderColor: COLORS['border-light'],
                    backgroundColor: 'white',
                  }}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants}>
                <label
                  className="block text-sm font-bold mb-2"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isChangingPassword}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all disabled:opacity-50"
                  style={{
                    borderColor: COLORS['border-light'],
                    backgroundColor: 'white',
                  }}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants} className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isChangingPassword && setShowChangePasswordModal(false)}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: COLORS['bg-light'],
                    color: COLORS['text-dark'],
                    border: `2px solid ${COLORS['border-light']}`,
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChangePasswordSubmit}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: COLORS['energy-orange'],
                  }}
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
