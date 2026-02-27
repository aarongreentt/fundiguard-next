'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface CompletionField {
  key: string;
  label: string;
  completed: boolean;
  importance: 'required' | 'recommended' | 'optional';
  hint?: string;
}

interface ProfileCompletionChecklistProps {
  userType?: 'fundi' | 'client';
  fields?: CompletionField[];
  onFieldClick?: (fieldKey: string) => void;
}

export function ProfileCompletionChecklist({
  userType = 'fundi',
  fields,
  onFieldClick,
}: ProfileCompletionChecklistProps) {
  const defaultFields: CompletionField[] =
    fields ||
    (userType === 'fundi'
      ? [
          {
            key: 'avatar',
            label: 'Profile Picture',
            completed: false,
            importance: 'required',
            hint: 'Fundis with photos get 3x more inquiries',
          },
          {
            key: 'bio',
            label: 'Professional Bio',
            completed: true,
            importance: 'required',
            hint: 'Tell clients about your experience',
          },
          {
            key: 'specialties',
            label: 'Specialties',
            completed: false,
            importance: 'required',
            hint: 'Help clients find exactly what they need',
          },
          {
            key: 'service_areas',
            label: 'Service Areas',
            completed: true,
            importance: 'required',
            hint: 'Define where you operate',
          },
          {
            key: 'portfolio',
            label: 'Portfolio',
            completed: false,
            importance: 'recommended',
            hint: 'Add photos of your best work',
          },
          {
            key: 'hourly_rate',
            label: 'Hourly Rate',
            completed: true,
            importance: 'required',
            hint: 'Set your pricing',
          },
          {
            key: 'verification',
            label: 'Get Verified',
            completed: false,
            importance: 'recommended',
            hint: 'Complete Pro verification for trust badge',
          },
          {
            key: 'reviews',
            label: 'First Review',
            completed: false,
            importance: 'optional',
            hint: 'Complete your first job',
          },
        ]
      : [
          {
            key: 'avatar',
            label: 'Profile Picture',
            completed: false,
            importance: 'recommended',
            hint: 'Help fundis recognize you',
          },
          {
            key: 'bio',
            label: 'About You',
            completed: true,
            importance: 'recommended',
            hint: 'Share your background and preferences',
          },
          {
            key: 'location',
            label: 'Service Location',
            completed: true,
            importance: 'required',
            hint: 'Help fundis find you',
          },
          {
            key: 'budget',
            label: 'Budget Range',
            completed: false,
            importance: 'recommended',
            hint: 'Set your typical project budget',
          },
          {
            key: 'preferences',
            label: 'Service Preferences',
            completed: false,
            importance: 'optional',
            hint: 'Help us match you with better fundis',
          },
        ]);

  const requiredFields = defaultFields.filter((f) => f.importance === 'required');
  const recommendedFields = defaultFields.filter((f) => f.importance === 'recommended');
  const optionalFields = defaultFields.filter((f) => f.importance === 'optional');

  const completedCount = defaultFields.filter((f) => f.completed).length;
  const completedRequired = requiredFields.filter((f) => f.completed).length;

  const CompletionSectionHeader = ({
    title,
    count,
    total,
  }: {
    title: string;
    count: number;
    total: number;
  }) => (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <p className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
        {title}
      </p>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${COLORS['energy-orange']}20`,
          color: COLORS['energy-orange'],
        }}
      >
        {count}/{total}
      </span>
    </div>
  );

  const FieldItem = ({ field }: { field: CompletionField }) => (
    <motion.button
      variants={ANIMATIONS.itemVariants}
      whileHover={{ translateX: 4, backgroundColor: 'white' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onFieldClick?.(field.key)}
      className="w-full p-3 rounded-lg text-left transition-all flex items-start gap-3 group"
      style={{
        backgroundColor: field.completed ? `${COLORS['trust-green']}10` : COLORS['bg-light'],
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {field.completed ? (
          <CheckCircle size={20} color={COLORS['trust-green']} />
        ) : (
          <Circle size={20} color={COLORS['text-muted']} />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold"
            style={{
              color: field.completed ? COLORS['trust-green'] : COLORS['text-dark'],
              textDecoration: field.completed ? 'line-through' : 'none',
            }}
          >
            {field.label}
          </p>
          {field.importance === 'required' && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${COLORS['danger']}20`,
                color: COLORS['danger'],
              }}
            >
              Required
            </span>
          )}
        </div>
        {field.hint && (
          <p className="text-xs mt-1" style={{ color: COLORS['text-muted'] }}>
            {field.hint}
          </p>
        )}
      </div>
    </motion.button>
  );

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 rounded-lg bg-white"
      style={{ boxShadow: SHADOWS.md }}
    >
      {/* Header */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold" style={{ color: COLORS['text-dark'] }}>
              Complete Your Profile
            </h3>
            <p className="text-sm mt-1" style={{ color: COLORS['text-muted'] }}>
              {completedCount}/{defaultFields.length} fields completed
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-3xl font-bold"
              style={{
                color: COLORS['energy-orange'],
              }}
            >
              {Math.round((completedCount / defaultFields.length) * 100)}%
            </p>
            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
              Complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(completedCount / defaultFields.length) * 100}%`,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: COLORS['energy-orange'] }}
          />
        </div>
      </motion.div>

      {/* Status Alert */}
      {completedRequired < requiredFields.length && (
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="mt-4 p-3 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: `${COLORS['warning']}15`,
            borderLeft: `4px solid ${COLORS['warning']}`,
          }}
        >
          <AlertCircle size={18} color={COLORS['warning']} style={{ marginTop: '2px' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: COLORS['text-dark'] }}>
              {requiredFields.length - completedRequired} required field
              {requiredFields.length - completedRequired > 1 ? 's' : ''} missing
            </p>
            <p className="text-xs mt-1" style={{ color: COLORS['text-muted'] }}>
              Complete all required fields to get discovered by more clients
            </p>
          </div>
        </motion.div>
      )}

      {/* Required Fields Section */}
      {requiredFields.length > 0 && (
        <motion.div variants={ANIMATIONS.containerVariants}>
          <CompletionSectionHeader
            title="Required"
            count={completedRequired}
            total={requiredFields.length}
          />
          <motion.div variants={ANIMATIONS.containerVariants} className="space-y-2">
            {requiredFields.map((field) => (
              <FieldItem key={field.key} field={field} />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Recommended Fields Section */}
      {recommendedFields.length > 0 && (
        <motion.div variants={ANIMATIONS.containerVariants}>
          <CompletionSectionHeader
            title="Recommended"
            count={recommendedFields.filter((f) => f.completed).length}
            total={recommendedFields.length}
          />
          <motion.div variants={ANIMATIONS.containerVariants} className="space-y-2">
            {recommendedFields.map((field) => (
              <FieldItem key={field.key} field={field} />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Optional Fields Section */}
      {optionalFields.length > 0 && (
        <motion.div variants={ANIMATIONS.containerVariants}>
          <CompletionSectionHeader
            title="Nice to Have"
            count={optionalFields.filter((f) => f.completed).length}
            total={optionalFields.length}
          />
          <motion.div variants={ANIMATIONS.containerVariants} className="space-y-2">
            {optionalFields.map((field) => (
              <FieldItem key={field.key} field={field} />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Completion Message */}
      {completedCount === defaultFields.length && (
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="mt-6 p-4 rounded-lg text-center text-white"
          style={{ backgroundColor: COLORS['trust-green'] }}
        >
          <p className="font-bold">🎉 Profile Complete!</p>
          <p className="text-sm mt-1">You're all set. Start getting job requests now!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
