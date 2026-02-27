'use client';

import { motion } from 'framer-motion';
import {
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  BookOpen,
  Hammer,
  Box,
  Settings,
  Wrench as MechanicsIcon,
  UtensilsCrossed,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { COLORS, ANIMATIONS } from '@/lib/design-tokens';

const CATEGORIES = [
  { name: 'Plumbing', icon: Wrench, color: '#FF6D00' },
  { name: 'Electrical', icon: Zap, color: '#00C853' },
  { name: 'Painting', icon: Paintbrush, color: '#D32F2F' },
  { name: 'Cleaning', icon: Sparkles, color: '#1976D2' },
  { name: 'Tutoring', icon: BookOpen, color: '#7B1FA2' },
  { name: 'Carpentry', icon: Hammer, color: '#F57C00' },
  { name: 'Installation', icon: Box, color: '#0097A7' },
  { name: 'Repairs', icon: Settings, color: '#455A64' },
  { name: 'Mechanics', icon: MechanicsIcon, color: '#6D4C41' },
  { name: 'Catering', icon: UtensilsCrossed, color: '#C2185B' },
  { name: 'Staffing', icon: Users, color: '#512DA8' },
  { name: 'Other', icon: MoreHorizontal, color: '#999999' },
];

interface ModernCategorySelectorProps {
  value?: string;
  onChange?: (category: string) => void;
  error?: string;
}

export function ModernCategorySelector({
  value,
  onChange,
  error,
}: ModernCategorySelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <label
        className="block text-sm font-bold mb-4"
        style={{ color: COLORS['text-dark'] }}
      >
        What type of job is this?
      </label>

      <motion.div
        variants={ANIMATIONS.containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = value === category.name;

          return (
            <motion.button
              key={category.name}
              variants={ANIMATIONS.itemVariants}
              type="button"
              onClick={() => onChange?.(category.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg text-center transition-all ${
                isSelected ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: isSelected ? `${category.color}20` : COLORS['bg-light'],
                borderColor: isSelected ? category.color : 'transparent',
                color: COLORS['text-dark'],
              }}
            >
              <Icon
                size={28}
                color={category.color}
                className="mx-auto mb-2"
              />
              <p className="text-xs font-bold text-center line-clamp-1">{category.name}</p>
            </motion.button>
          );
        })}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500 mt-2"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
