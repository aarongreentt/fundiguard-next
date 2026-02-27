'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wrench,
  Lightbulb,
  Droplet,
  Sparkles,
  BookOpen,
  Hammer,
  Zap,
  Home,
  Car,
  Utensils,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { COLORS, ANIMATIONS, BORDER_RADIUS } from '@/lib/design-tokens';

const CATEGORIES = [
  { icon: Wrench, label: 'Plumbing', color: '#3B82F6' },
  { icon: Lightbulb, label: 'Electrical', color: '#F59E0B' },
  { icon: Droplet, label: 'Painting', color: '#8B5CF6' },
  { icon: Sparkles, label: 'Cleaning', color: '#10B981' },
  { icon: BookOpen, label: 'Tutoring', color: '#EC4899' },
  { icon: Hammer, label: 'Carpentry', color: '#D97706' },
  { icon: Zap, label: 'Installation', color: '#00C853' },
  { icon: Home, label: 'Repairs', color: '#6B7280' },
  { icon: Car, label: 'Mechanics', color: '#14B8A6' },
  { icon: Utensils, label: 'Catering', color: '#F43F5E' },
  { icon: Users, label: 'Staffing', color: '#3B82F6' },
  { icon: MoreHorizontal, label: 'More', color: '#6B7280' },
];

export function ModernCategoryGrid() {
  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4"
    >
      {CATEGORIES.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.div key={index} variants={ANIMATIONS.itemVariants}>
            <Link href={`/browse?category=${category.label.toLowerCase()}`}>
              <div
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group"
                style={{ borderRadius: BORDER_RADIUS.lg }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all group-hover:scale-110"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon size={24} />
                </div>
                <span
                  className="text-xs font-bold text-center line-clamp-1 group-hover:text-green-600 transition-colors"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {category.label}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
