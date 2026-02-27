'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapIcon, List, X } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';
import { ModernJobCard } from '@/components/jobs/modern-job-card';
import { ModernCategoryGrid } from '@/components/categories/modern-category-grid';
import { BrowseJobsMap } from '@/components/maps/browse-jobs-map';
import { mockJobs } from '@/lib/mock-data';

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter jobs based on selected category and search term
  const filteredJobs = mockJobs.filter(job => {
    const matchesCategory = !selectedCategory || job.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const mapJobs = filteredJobs.map(job => ({
    id: job.id,
    title: job.title,
    location: job.location,
    latitude: 51.5074,
    longitude: -0.1278,
    budget_range: job.budgetRange,
    status: job.status,
  }));

  return (
    <div style={{ backgroundColor: COLORS['bg-light'] }}>
      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white py-8 px-4 md:px-8"
        style={{ boxShadow: SHADOWS.sm }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <motion.h1
              variants={ANIMATIONS.slideUpIn}
              initial="initial"
              animate="animate"
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: COLORS['text-dark'] }}
            >
              Browse Available Jobs
            </motion.h1>
            <p
              className="text-lg"
              style={{ color: COLORS['text-muted'] }}
            >
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Search and Filter Controls */}
          <motion.div
            variants={ANIMATIONS.containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row gap-4 items-stretch md:items-center"
          >
            <motion.div variants={ANIMATIONS.itemVariants} className="flex-1">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-full bg-gray-50"
                style={{ boxShadow: SHADOWS.sm }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke={COLORS['text-muted']}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs by title or location..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: COLORS['text-dark'] }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>

            {/* View Mode Toggle */}
            <motion.div
              variants={ANIMATIONS.itemVariants}
              className="flex gap-2 bg-white rounded-full p-1"
              style={{ boxShadow: SHADOWS.sm }}
            >
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'list' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'list' ? COLORS['trust-green'] : 'transparent',
                  color: viewMode === 'list' ? 'white' : COLORS['text-muted'],
                }}
              >
                <List size={18} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'map' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'map' ? COLORS['trust-green'] : 'transparent',
                  color: viewMode === 'map' ? 'white' : COLORS['text-muted'],
                }}
              >
                <MapIcon size={18} />
                <span className="hidden sm:inline">Map</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Filter Quick Links */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-4 md:px-8 py-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                selectedCategory === null ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: selectedCategory === null ? COLORS['energy-orange'] : COLORS['bg-light'],
                color: selectedCategory === null ? 'white' : COLORS['text-muted'],
                border: selectedCategory === null ? 'none' : `1px solid ${COLORS['border-light']}`,
              }}
            >
              All Jobs
            </motion.button>

            {['Plumbing', 'Electrical', 'Painting', 'Cleaning', 'Carpentry', 'Repairs'].map(
              (category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    selectedCategory === category ? 'text-white' : ''
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === category ? COLORS['trust-green'] : COLORS['bg-light'],
                    color:
                      selectedCategory === category ? 'white' : COLORS['text-muted'],
                    border:
                      selectedCategory === category
                        ? 'none'
                        : `1px solid ${COLORS['border-light']}`,
                  }}
                >
                  {category}
                </motion.button>
              ),
            )}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        {viewMode === 'list' ? (
          <>
            {/* List View */}
            {filteredJobs.length > 0 ? (
              <motion.div
                variants={ANIMATIONS.containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredJobs.map((job, i) => (
                  <ModernJobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    location={job.location}
                    category={job.category}
                    budget_range={job.budgetRange}
                    status={job.status as 'open' | 'assigned'}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12">
                <p
                  className="text-lg"
                  style={{ color: COLORS['text-muted'] }}
                >
                  No jobs found matching your criteria
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* Map View */}
            {mapJobs.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <BrowseJobsMap jobs={mapJobs} height="600px" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p
                  className="text-lg"
                  style={{ color: COLORS['text-muted'] }}
                >
                  No jobs with location data available
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
