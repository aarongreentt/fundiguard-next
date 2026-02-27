'use client';

import { motion } from 'framer-motion';
import { Star, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
  jobTitle?: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProfileReviewsProps {
  userType?: 'fundi' | 'client';
  summary?: RatingSummary;
  reviews?: Review[];
  onFilterChange?: (filter: 'all' | 'recent' | 'highest' | 'lowest') => void;
}

export function ProfileReviews({
  userType = 'fundi',
  summary,
  reviews = [],
  onFilterChange,
}: ProfileReviewsProps) {
  const defaultSummary: RatingSummary = summary || {
    averageRating: 4.8,
    totalReviews: 47,
    distribution: { 5: 42, 4: 3, 3: 1, 2: 1, 1: 0 },
  };

  const defaultReviews: Review[] =
    reviews.length > 0
      ? reviews
      : [
          {
            id: '1',
            author: 'John Ochieng',
            avatar: '👨',
            rating: 5,
            comment:
              'Excellent work! Very professional and completed ahead of schedule. Highly recommended!',
            date: '2 weeks ago',
            verified: true,
            jobTitle: 'Electrical Repairs',
          },
          {
            id: '2',
            author: 'Sarah Kipchoge',
            avatar: '👩',
            rating: 5,
            comment: 'Amazing service. Very responsive and attention to detail is incredible.',
            date: '1 month ago',
            verified: true,
            jobTitle: 'Plumbing Installation',
          },
          {
            id: '3',
            author: 'Michael Mwangi',
            avatar: '👨',
            rating: 4,
            comment: 'Good work overall. Small communication gap but resolved quickly.',
            date: '2 months ago',
            verified: true,
            jobTitle: 'Electronic Repairs',
          },
        ];

  const RatingBar = ({ stars, count }: { stars: number; count: number }) => {
    const percentage = (count / defaultSummary.totalReviews) * 100;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold w-6" style={{ color: COLORS['text-muted'] }}>
          {stars}★
        </span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: COLORS['energy-orange'] }}
          />
        </div>
        <span className="text-xs font-semibold w-12 text-right" style={{ color: COLORS['text-muted'] }}>
          {count}
        </span>
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <motion.div
      variants={ANIMATIONS.itemVariants}
      className="p-4 rounded-lg bg-white"
      style={{ boxShadow: SHADOWS.sm }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: COLORS['bg-light'] }}
          >
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm" style={{ color: COLORS['text-dark'] }}>
                {review.author}
              </p>
              {review.verified && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${COLORS['trust-green']}20`,
                    color: COLORS['trust-green'],
                  }}
                >
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
              {review.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < review.rating ? COLORS['energy-orange'] : '#e5e7eb'}
              color={i < review.rating ? COLORS['energy-orange'] : '#e5e7eb'}
            />
          ))}
        </div>
      </div>

      {review.jobTitle && (
        <p className="text-xs font-semibold mb-2" style={{ color: COLORS['text-muted'] }}>
          {review.jobTitle}
        </p>
      )}

      <p className="text-sm leading-relaxed" style={{ color: COLORS['text-dark'] }}>
        {review.comment}
      </p>
    </motion.div>
  );

  return (
    <motion.div
      variants={ANIMATIONS.containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Rating Summary */}
      <motion.div
        variants={ANIMATIONS.itemVariants}
        className="p-6 rounded-lg bg-white"
        style={{ boxShadow: SHADOWS.md }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b-2" style={{ borderColor: '#e5e7eb' }}>
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p
                className="text-4xl font-bold"
                style={{ color: COLORS['energy-orange'] }}
              >
                {defaultSummary.averageRating}
              </p>
              <div className="flex justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(defaultSummary.averageRating) ? COLORS['energy-orange'] : '#e5e7eb'}
                    color={i < Math.floor(defaultSummary.averageRating) ? COLORS['energy-orange'] : '#e5e7eb'}
                  />
                ))}
              </div>
            </div>

            <div>
              <p
                className="text-sm font-bold"
                style={{ color: COLORS['text-dark'] }}
              >
                {defaultSummary.totalReviews} Reviews
              </p>
              <p className="text-xs" style={{ color: COLORS['text-muted'] }}>
                {userType === 'fundi'
                  ? 'Based on completed jobs'
                  : 'From fundis you hired'}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-2">
            <RatingBar stars={5} count={defaultSummary.distribution[5]} />
            <RatingBar stars={4} count={defaultSummary.distribution[4]} />
            <RatingBar stars={3} count={defaultSummary.distribution[3]} />
            <RatingBar stars={2} count={defaultSummary.distribution[2]} />
            <RatingBar stars={1} count={defaultSummary.distribution[1]} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold" style={{ color: COLORS['text-muted'] }}>
              APPROVAL RATE
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: COLORS['trust-green'] }}
            >
              98%
            </p>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: COLORS['text-muted'] }}>
              REPEAT CLIENTS
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: COLORS['energy-orange'] }}
            >
              32
            </p>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: COLORS['text-muted'] }}>
              RESPONSE TIME
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: COLORS['info'] }}
            >
              2h
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter & Sort */}
      <motion.div variants={ANIMATIONS.itemVariants} className="flex gap-2">
        {['All', 'Recent', 'Highest', 'Lowest'].map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              onFilterChange?.(filter.toLowerCase() as 'all' | 'recent' | 'highest' | 'lowest')
            }
            className="px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 bg-white border-2 transition-all"
            style={{
              borderColor: COLORS['energy-orange'],
              color: COLORS['energy-orange'],
            }}
          >
            <Filter size={16} />
            {filter}
          </motion.button>
        ))}
      </motion.div>

      {/* Reviews List */}
      <motion.div
        variants={ANIMATIONS.containerVariants}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={20} color={COLORS['energy-orange']} />
          <h3 className="text-lg font-bold" style={{ color: COLORS['text-dark'] }}>
            Recent Reviews
          </h3>
        </div>

        {defaultReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </motion.div>

      {/* No Reviews Message */}
      {defaultReviews.length === 0 && (
        <motion.div
          variants={ANIMATIONS.itemVariants}
          className="p-8 rounded-lg text-center"
          style={{ backgroundColor: COLORS['bg-light'] }}
        >
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold" style={{ color: COLORS['text-muted'] }}>
            No reviews yet
          </p>
          <p className="text-sm mt-1" style={{ color: COLORS['text-muted'] }}>
            {userType === 'fundi'
              ? 'Complete your first job to receive reviews'
              : 'Reviews will appear here after you hire fundis'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
