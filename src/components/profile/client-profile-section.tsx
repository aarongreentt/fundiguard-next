'use client';

import { motion } from 'framer-motion';
import { Heart, Star, Wallet, Clock, BookOpen } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface ClientProfileSectionProps {
  profile: {
    total_jobs_posted?: number;
    total_spent?: number;
    average_rating_given?: number;
    saved_fundis?: Array<{
      id: string;
      name: string;
      specialty: string;
      rating: number;
      image?: string;
    }>;
    job_history?: Array<{
      id: string;
      title: string;
      status: 'completed' | 'in-progress' | 'cancelled';
      amount: number;
      fundi_name: string;
      date: string;
      rating?: number;
    }>;
    recent_reviews?: Array<{
      id: string;
      fundi_name: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  isOwnProfile?: boolean;
}

export function ClientProfileSection({ profile, isOwnProfile = false }: ClientProfileSectionProps) {
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
          { icon: BookOpen, label: 'Jobs Posted', value: profile.total_jobs_posted || 0 },
          { icon: Wallet, label: 'Total Spent', value: `KES ${profile.total_spent || 0}` },
          { icon: Star, label: 'Avg Rating', value: `${profile.average_rating_given || 0}★` },
          { icon: Heart, label: 'Saved Fundis', value: profile.saved_fundis?.length || 0 },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-lg text-center bg-white"
              style={{ boxShadow: SHADOWS.sm }}
            >
              <Icon size={24} color={COLORS['trust-green']} className="mx-auto mb-2" />
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

      {/* Saved Fundis */}
      {profile.saved_fundis && profile.saved_fundis.length > 0 && (
        <motion.div variants={ANIMATIONS.itemVariants}>
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: COLORS['text-dark'] }}
          >
            Your Favorite Fundis
          </h3>

          <motion.div
            variants={ANIMATIONS.containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-4"
          >
            {profile.saved_fundis.slice(0, 4).map((fundi) => (
              <motion.div
                key={fundi.id}
                variants={ANIMATIONS.itemVariants}
                className="p-4 rounded-lg bg-white"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {fundi.image && (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img src={fundi.image} alt={fundi.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: COLORS['text-dark'] }}
                    >
                      {fundi.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: COLORS['text-muted'] }}
                    >
                      {fundi.specialty}
                    </p>
                  </div>
                  <Heart size={18} color={COLORS['energy-orange']} fill={COLORS['energy-orange']} />
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      color={i < Math.floor(fundi.rating) ? COLORS['warning'] : '#e5e7eb'}
                      fill={i < Math.floor(fundi.rating) ? COLORS['warning'] : 'none'}
                    />
                  ))}
                  <span
                    className="text-xs font-bold ml-1"
                    style={{ color: COLORS['text-muted'] }}
                  >
                    {fundi.rating}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Recent Job History */}
      {profile.job_history && profile.job_history.length > 0 && (
        <motion.div variants={ANIMATIONS.itemVariants}>
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: COLORS['text-dark'] }}
          >
            Recent Jobs
          </h3>

          <motion.div
            variants={ANIMATIONS.containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {profile.job_history.slice(0, 5).map((job) => (
              <motion.div
                key={job.id}
                variants={ANIMATIONS.itemVariants}
                className="p-4 rounded-lg bg-white border-l-4"
                style={{
                  boxShadow: SHADOWS.sm,
                  borderColor:
                    job.status === 'completed'
                      ? COLORS['success']
                      : job.status === 'in-progress'
                        ? COLORS['warning']
                        : COLORS['danger'],
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: COLORS['text-dark'] }}
                    >
                      {job.title}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: COLORS['text-muted'] }}
                    >
                      with {job.fundi_name}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold whitespace-nowrap"
                    style={{ color: COLORS['trust-green'] }}
                  >
                    KES {job.amount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span
                    className="px-2 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        job.status === 'completed'
                          ? `${COLORS['success']}20`
                          : job.status === 'in-progress'
                            ? `${COLORS['warning']}20`
                            : `${COLORS['danger']}20`,
                      color:
                        job.status === 'completed'
                          ? COLORS['success']
                          : job.status === 'in-progress'
                            ? COLORS['warning']
                            : COLORS['danger'],
                    }}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
                  </span>

                  {job.rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < job.rating! ? COLORS['warning'] : '#e5e7eb'}
                          fill={i < job.rating! ? COLORS['warning'] : 'none'}
                        />
                      ))}
                    </div>
                  )}

                  <span style={{ color: COLORS['text-muted'] }}>{job.date}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Recent Reviews Given */}
      {profile.recent_reviews && profile.recent_reviews.length > 0 && (
        <motion.div variants={ANIMATIONS.itemVariants}>
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: COLORS['text-dark'] }}
          >
            Reviews You've Given
          </h3>

          <motion.div
            variants={ANIMATIONS.containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {profile.recent_reviews.slice(0, 3).map((review) => (
              <motion.div
                key={review.id}
                variants={ANIMATIONS.itemVariants}
                className="p-4 rounded-lg bg-white"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <div className="flex items-start justify-between mb-2">
                  <p
                    className="font-bold text-sm"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {review.fundi_name}
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={i < review.rating ? COLORS['warning'] : '#e5e7eb'}
                        fill={i < review.rating ? COLORS['warning'] : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <p
                  className="text-sm mb-2"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {review.comment}
                </p>

                <p
                  className="text-xs"
                  style={{ color: COLORS['text-muted'] }}
                >
                  {review.date}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
