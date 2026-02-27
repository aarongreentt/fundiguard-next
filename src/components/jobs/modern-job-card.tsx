'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Users, Zap } from 'lucide-react';
import { COLORS, ANIMATIONS, BORDER_RADIUS, SHADOWS } from '@/lib/design-tokens';

interface ModernJobCardProps {
  id: string;
  title: string;
  location: string;
  category: string;
  budget_range: string;
  status: 'open' | 'assigned';
  image?: string;
  bidCount?: number;
  isUrgent?: boolean;
  distance?: number;
  index?: number;
}

export function ModernJobCard({
  id,
  title,
  location,
  category,
  budget_range,
  status,
  image,
  bidCount = 0,
  isUrgent = false,
  distance,
  index = 0,
}: ModernJobCardProps) {
  return (
    <motion.div
      variants={ANIMATIONS.itemVariants}
      whileHover={{ y: -4, boxShadow: SHADOWS.hover }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/jobs/${id}`}>
        <div
          className="rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-xl cursor-pointer h-full flex flex-col"
          style={{
            boxShadow: SHADOWS.md,
            borderRadius: BORDER_RADIUS.lg,
          }}
        >
          {/* Image Section */}
          <div className="relative h-40 bg-gray-200 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-3xl"
                style={{ backgroundColor: COLORS['trust-green'] }}
              >
                📷
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              {isUrgent && (
                <div
                  className="px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
                  style={{ backgroundColor: COLORS['energy-orange'] }}
                >
                  <Zap size={14} />
                  Urgent
                </div>
              )}
              <div
                className="px-3 py-1 rounded-full text-white text-xs font-bold"
                style={{
                  backgroundColor: status === 'open' ? COLORS['trust-green'] : COLORS['warning'],
                }}
              >
                {status === 'open' ? 'Open' : 'Assigned'}
              </div>
            </div>

            {/* Bid Count */}
            {bidCount > 0 && (
              <div
                className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              >
                <Users size={14} />
                {bidCount} bids
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category */}
            <div
              className="text-xs font-bold mb-2 px-2 py-1 rounded-full inline-block w-fit"
              style={{
                color: COLORS['trust-green'],
                backgroundColor: `${COLORS['trust-green']}15`,
              }}
            >
              {category}
            </div>

            {/* Title */}
            <h3
              className="font-bold text-base line-clamp-2 mb-2"
              style={{ color: COLORS['text-dark'] }}
            >
              {title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3 flex-1">
              <MapPin size={16} color={COLORS['text-muted']} />
              <span
                className="text-sm line-clamp-1"
                style={{ color: COLORS['text-muted'] }}
              >
                {location}
              </span>
            </div>

            {distance !== undefined && (
              <div
                className="text-xs font-medium mb-3"
                style={{ color: COLORS['info'] }}
              >
                📍 {distance.toFixed(1)}km away
              </div>
            )}

            {/* Budget & Button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span
                className="font-bold text-sm"
                style={{ color: COLORS['energy-orange'] }}
              >
                {budget_range}
              </span>
              <button
                className="px-4 py-2 rounded-full font-bold text-white text-sm transition-all hover:shadow-lg"
                style={{
                  backgroundColor: COLORS['trust-green'],
                }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                View
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
