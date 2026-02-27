'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Upload,
  FileCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface VerificationStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  actionLabel?: string;
  onAction?: () => void;
}

interface ProfileVerificationProps {
  isPro?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected' | 'not_started';
  steps?: VerificationStep[];
  onStartVerification?: () => void;
  onSubmitVerification?: () => void;
}

export function ProfileVerification({
  isPro,
  verificationStatus = 'not_started',
  steps = [],
  onStartVerification,
  onSubmitVerification,
}: ProfileVerificationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return COLORS['trust-green'];
      case 'pending':
        return COLORS['warning'];
      case 'rejected':
      case 'failed':
        return COLORS['danger'];
      default:
        return COLORS['text-muted'];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <CheckCircle size={20} color={COLORS['trust-green']} />;
      case 'pending':
        return <Clock size={20} color={COLORS['warning']} />;
      case 'rejected':
      case 'failed':
        return <AlertCircle size={20} color={COLORS['danger']} />;
      default:
        return <AlertCircle size={20} color={COLORS['text-muted']} />;
    }
  };

  const defaultSteps: VerificationStep[] =
    steps.length > 0
      ? steps
      : [
          {
            id: 'identity',
            label: 'Identity Verification',
            description: 'Upload your national ID, passport, or driver license',
            status: 'pending',
            actionLabel: 'Upload Document',
          },
          {
            id: 'police',
            label: 'Police Clearance',
            description: 'Submit clearance certificate from local police station',
            status: 'pending',
            actionLabel: 'Submit Certificate',
          },
          {
            id: 'address',
            label: 'Address Verification',
            description: 'Verify your residential address with utility bill or lease',
            status: 'pending',
            actionLabel: 'Upload Proof',
          },
        ];

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Pro Status Header */}
      <motion.div
        variants={ANIMATIONS.itemVariants}
        className="p-6 rounded-lg text-white relative overflow-hidden"
        style={{ backgroundColor: isPro ? COLORS['energy-orange'] : '#9ca3af' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={24} />
            <h2 className="text-xl font-bold">
              {isPro ? 'Pro Fundi Badge' : 'Get Verified'}
            </h2>
          </div>
          <p className="text-sm mb-4 opacity-90">
            {isPro
              ? 'You are a verified professional. Your badge builds client trust.'
              : 'Complete verification to unlock Pro features and get more bookings'}
          </p>

          {!isPro && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartVerification}
              className="mt-4 px-6 py-2 rounded-lg bg-white font-bold text-sm flex items-center gap-2 transition-all"
              style={{ color: COLORS['energy-orange'] }}
            >
              Start Verification <ArrowRight size={16} />
            </motion.button>
          )}
        </div>

        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Current Status */}
      {verificationStatus !== 'not_started' && (
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="p-4 rounded-lg flex items-center gap-3"
          style={{
            backgroundColor: `${getStatusColor(verificationStatus)}15`,
            borderLeft: `4px solid ${getStatusColor(verificationStatus)}`,
          }}
        >
          {getStatusIcon(verificationStatus)}
          <div>
            <p className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
              Status: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
            </p>
            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
              {verificationStatus === 'verified' &&
                'Congratulations! Your profile is verified.'}
              {verificationStatus === 'pending' && 'Your verification is under review.'}
              {verificationStatus === 'rejected' &&
                'Verification was rejected. Please review requirements and resubmit.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Verification Steps */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS['text-dark'] }}>
          Verification Steps
        </h3>

        <motion.div
          variants={ANIMATIONS.containerVariants}
          className="space-y-3"
        >
          {defaultSteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={ANIMATIONS.itemVariants}
              className="p-4 rounded-lg bg-white transition-all"
              style={{ boxShadow: SHADOWS.sm }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        backgroundColor: getStatusColor(step.status),
                      }}
                    >
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
                      {step.label}
                    </h4>
                  </div>
                  <p className="text-xs mb-3" style={{ color: COLORS['text-muted'] }}>
                    {step.description}
                  </p>

                  {step.actionLabel && step.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={step.onAction}
                      className="px-4 py-2 rounded-lg bg-white font-semibold text-sm border-2 flex items-center gap-2 transition-all"
                      style={{
                        borderColor: getStatusColor(step.status),
                        color: getStatusColor(step.status),
                      }}
                    >
                      <Upload size={16} />
                      {step.actionLabel}
                    </motion.button>
                  )}

                  {step.status === 'completed' && (
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <CheckCircle size={16} color={COLORS['trust-green']} />
                      <span style={{ color: COLORS['trust-green'] }}>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <h3 className="text-lg font-bold mb-4" style={{ color: COLORS['text-dark'] }}>
          Pro Benefits
        </h3>

        <motion.div
          variants={ANIMATIONS.containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {[
            { icon: Shield, label: 'Blue checkmark badge' },
            { icon: TrendingUp, label: 'Higher visibility' },
            { icon: Users, label: 'Better client matches' },
            { icon: FileCheck, label: 'Priority support' },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              variants={ANIMATIONS.itemVariants}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: `${COLORS['energy-orange']}10` }}
            >
              <benefit.icon size={18} color={COLORS['energy-orange']} />
              <p className="text-sm font-semibold" style={{ color: COLORS['text-dark'] }}>
                {benefit.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Submit Button */}
      {verificationStatus === 'pending' && (
        <motion.button
          variants={ANIMATIONS.itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmitVerification}
          className="w-full py-3 rounded-lg font-bold text-white transition-all"
          style={{ backgroundColor: COLORS['trust-green'] }}
        >
          Submit for Review
        </motion.button>
      )}
    </motion.div>
  );
}
