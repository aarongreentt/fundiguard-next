'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Award, Clock, Plus, Edit2 } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from '@/lib/design-tokens';

interface FundiProfileSectionProps {
  profile: {
    hourly_rate?: number;
    experience_years?: number;
    specialties?: string[];
    service_areas?: string[];
    average_rating?: number;
    total_reviews?: number;
    total_jobs?: number;
    portfolio_items?: Array<{
      id: string;
      title: string;
      image: string;
      description?: string;
    }>;
    verification_status?: 'pending' | 'verified' | 'rejected';
  };
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onAddPortfolio?: () => void;
}

export function FundiProfileSection({
  profile,
  isOwnProfile = false,
  onEdit,
  onAddPortfolio,
}: FundiProfileSectionProps) {
  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Quick Stats */}
      <motion.div variants={ANIMATIONS.itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Rate', value: `KES ${profile.hourly_rate || 0}/hr` },
          { icon: Award, label: 'Experience', value: `${profile.experience_years || 0} yrs` },
          { icon: Star, label: 'Rating', value: `${profile.average_rating || 0}★` },
          { icon: Clock, label: 'Jobs', value: `${profile.total_jobs || 0} done` },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-lg text-center bg-white"
              style={{ boxShadow: SHADOWS.sm }}
            >
              <Icon size={24} color={COLORS['energy-orange']} className="mx-auto mb-2" />
              <p
                className="text-xs"
                style={{ color: COLORS['text-muted'] }}
              >
                {stat.label}
              </p>
              <p
                className="font-bold text-sm mt-1"
                style={{ color: COLORS['text-dark'] }}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* Specialties */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-lg font-bold"
            style={{ color: COLORS['text-dark'] }}
          >
            Specialties
          </h3>
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Edit2 size={18} color={COLORS['energy-orange']} />
            </motion.button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.specialties && profile.specialties.length > 0 ? (
            profile.specialties.map((specialty, i) => (
              <motion.div
                key={specialty}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: COLORS['trust-green'] }}
              >
                #{specialty}
              </motion.div>
            ))
          ) : (
            <p style={{ color: COLORS['text-muted'] }}>No specialties added yet</p>
          )}
        </div>
      </motion.div>

      {/* Service Areas */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-lg font-bold"
            style={{ color: COLORS['text-dark'] }}
          >
            Service Areas
          </h3>
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Edit2 size={18} color={COLORS['energy-orange']} />
            </motion.button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.service_areas && profile.service_areas.length > 0 ? (
            profile.service_areas.map((area, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: COLORS['energy-orange'] }}
              >
                <MapPin size={16} />
                {area}
              </motion.div>
            ))
          ) : (
            <p style={{ color: COLORS['text-muted'] }}>No service areas added yet</p>
          )}
        </div>
      </motion.div>

      {/* Verification Status */}
      {profile.verification_status && (
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="p-4 rounded-lg"
          style={{
            backgroundColor:
              profile.verification_status === 'verified'
                ? `${COLORS['success']}15`
                : profile.verification_status === 'pending'
                  ? `${COLORS['warning']}15`
                  : `${COLORS['danger']}15`,
            borderLeft: `4px solid ${
              profile.verification_status === 'verified'
                ? COLORS['success']
                : profile.verification_status === 'pending'
                  ? COLORS['warning']
                  : COLORS['danger']
            }`,
          }}
        >
          <p
            className="font-bold text-sm"
            style={{
              color:
                profile.verification_status === 'verified'
                  ? COLORS['success']
                  : profile.verification_status === 'pending'
                    ? COLORS['warning']
                    : COLORS['danger'],
            }}
          >
            {profile.verification_status === 'verified'
              ? '✓ Verified Fundi'
              : profile.verification_status === 'pending'
                ? '⏳ Verification Pending'
                : '✗ Verification Rejected'}
          </p>
        </motion.div>
      )}

      {/* Portfolio */}
      <motion.div variants={ANIMATIONS.itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold"
            style={{ color: COLORS['text-dark'] }}
          >
            Portfolio
          </h3>
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddPortfolio}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white transition-all"
              style={{ backgroundColor: COLORS['trust-green'] }}
            >
              <Plus size={18} />
              Add Work
            </motion.button>
          )}
        </div>

        {profile.portfolio_items && profile.portfolio_items.length > 0 ? (
          <motion.div
            variants={ANIMATIONS.containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {profile.portfolio_items.map((item, i) => (
              <motion.div
                key={item.id}
                variants={ANIMATIONS.itemVariants}
                className="rounded-lg overflow-hidden group cursor-pointer"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <p className="text-white font-bold text-sm text-center px-4">{item.title}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="p-8 rounded-lg text-center"
            style={{ backgroundColor: COLORS['bg-light'] }}
          >
            <p style={{ color: COLORS['text-muted'] }}>
              No portfolio items yet. Showcase your best work!
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
