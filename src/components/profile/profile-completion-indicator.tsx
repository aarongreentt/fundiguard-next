'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { COLORS, ANIMATIONS } from '@/lib/design-tokens';

interface ProfileCompletionIndicatorProps {
  completionPercentage: number;
  completedFields: string[];
  totalFields: number;
}

export function ProfileCompletionIndicator({
  completionPercentage,
  completedFields,
  totalFields,
}: ProfileCompletionIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg bg-white border-2"
      style={{
        borderColor: COLORS['energy-orange'],
        boxShadow: `0 0 0 1px ${COLORS['energy-orange']}20`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-bold"
          style={{ color: COLORS['text-dark'] }}
        >
          Profile Completion
        </h3>
        <span
          className="font-bold text-lg"
          style={{ color: COLORS['energy-orange'] }}
        >
          {completionPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: '#e5e7eb' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: COLORS['energy-orange'] }}
        />
      </motion.div>

      {/* Completed Fields */}
      <p
        className="text-xs mt-3"
        style={{ color: COLORS['text-muted'] }}
      >
        {completedFields.length} of {totalFields} fields completed
      </p>

      {/* Field List */}
      <motion.div
        variants={ANIMATIONS.containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-3 space-y-1"
      >
        {completedFields.map((field) => (
          <motion.div
            key={field}
            variants={ANIMATIONS.itemVariants}
            className="flex items-center gap-2 text-xs"
            style={{ color: COLORS['success'] }}
          >
            <CheckCircle2 size={14} />
            <span>{field}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
