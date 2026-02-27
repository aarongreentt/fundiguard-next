import Link from 'next/link';
import { ArrowRight, Search, Plus, Shield, MapPin, Star, TrendingUp } from 'lucide-react';
import { COLORS, ANIMATIONS, BORDER_RADIUS, SHADOWS } from '@/lib/design-tokens';
import { ModernCategoryGrid } from '@/components/categories/modern-category-grid';
import { ModernJobCard } from '@/components/jobs/modern-job-card';
import { mockJobs } from '@/lib/mock-data';

export default async function HomePage() {
  // Using mock jobs for now - client will see latest from home page
  const jobs = mockJobs.slice(0, 6);

  return (
    <div style={{ backgroundColor: COLORS['bg-light'] }}>
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ color: COLORS['text-dark'] }}
            >
              Get the Best{' '}
              <span style={{ color: COLORS['trust-green'] }}>Fundis in Kenya</span>
            </h1>
            <p
              className="text-lg md:text-xl mb-8"
              style={{ color: COLORS['text-muted'] }}
            >
              Find trusted professionals for any job. Fast, secure, verified.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
              <div
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full bg-white"
                style={{ boxShadow: SHADOWS.md }}
              >
                <Search size={20} color={COLORS['text-muted']} />
                <input
                  type="text"
                  placeholder="What do you need? (e.g., plumber, electrician)"
                  className="flex-1 outline-none text-sm"
                  style={{ color: COLORS['text-dark'] }}
                />
              </div>
              <Link
                href="/browse"
                className="px-8 py-3 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                style={{ backgroundColor: COLORS['energy-orange'] }}
              >
                <Search size={18} />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: TrendingUp, label: '2,500+', text: 'Fundis Verified' },
              { icon: Star, label: '4.8★', text: 'Avg Rating' },
              { icon: Shield, label: '100%', text: 'Secure' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-4 bg-white rounded-lg text-center"
                  style={{ boxShadow: SHADOWS.sm }}
                >
                  <Icon size={24} color={COLORS['trust-green']} className="mx-auto mb-2" />
                  <div
                    className="font-bold text-lg"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: COLORS['text-muted'] }}
                  >
                    {stat.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: COLORS['text-dark'] }}
            >
              How It Works
            </h2>
            <p
              className="text-lg"
              style={{ color: COLORS['text-muted'] }}
            >
              Three simple steps to get your job done
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Post Your Job',
                desc: 'Tell us what needs to be done, add photos, and set your budget.',
                icon: Plus,
              },
              {
                step: '2',
                title: 'Get Bids',
                desc: 'Verified fundis send you bids with their rates and timelines.',
                icon: TrendingUp,
              },
              {
                step: '3',
                title: 'Get It Done',
                desc: 'Choose your fundi, pay securely, and track progress in real-time.',
                icon: Star,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-lg text-center bg-gray-50"
                  style={{ borderRadius: BORDER_RADIUS.lg }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-6"
                    style={{ backgroundColor: COLORS['energy-orange'] }}
                  >
                    {item.step}
                  </div>
                  <Icon
                    size={32}
                    color={COLORS['trust-green']}
                    className="mx-auto mb-4"
                  />
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: COLORS['text-muted'] }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            style={{ color: COLORS['text-dark'] }}
          >
            Browse by Category
          </h2>

          <ModernCategoryGrid />
        </div>
      </section>

      {/* Live Jobs Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: COLORS['text-dark'] }}
              >
                Live Jobs Right Now
              </h2>
              <p
                className="text-lg"
                style={{ color: COLORS['text-muted'] }}
              >
                Fresh opportunities waiting for you
              </p>
            </div>
            <Link
              href="/browse"
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg hidden md:flex"
              style={{
                backgroundColor: COLORS['trust-green'],
                color: 'white',
              }}
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any, i) => (
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
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: COLORS['trust-green'] }}
            >
              View All Jobs <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Payments',
                desc: 'All payments are held securely in escrow until you approve the work.',
              },
              {
                icon: Star,
                title: 'Verified Fundis',
                desc: 'Every fundi is verified with ID checks and police clearance.',
              },
              {
                icon: MapPin,
                title: 'Insured Jobs',
                desc: 'Protect yourself with our optional insurance on every job.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="text-center">
                  <Icon
                    size={40}
                    color={COLORS['energy-orange']}
                    className="mx-auto mb-4"
                  />
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: COLORS['text-dark'] }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: COLORS['text-muted'] }}
                  >
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: COLORS['text-dark'] }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: COLORS['text-muted'] }}
          >
            Join thousands of Kenyans who trust FundiGuard for quality work done right.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/post-job"
              className="px-8 py-4 rounded-full font-bold text-white transition-all hover:shadow-lg"
              style={{
                backgroundColor: COLORS['energy-orange'],
              }}
            >
              Post a Job
            </Link>
            <Link
              href="/browse"
              className="px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg border-2"
              style={{
                borderColor: COLORS['trust-green'],
                color: COLORS['trust-green'],
              }}
            >
              Find a Fundi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
