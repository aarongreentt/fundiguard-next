'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, MapPin, Camera, DollarSign, ArrowRight } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS, BORDER_RADIUS } from '@/lib/design-tokens';
import { ModernFormInput } from '@/components/forms/modern-form-input';
import { ModernFormTextarea } from '@/components/forms/modern-form-textarea';
import { ModernCategorySelector } from '@/components/forms/modern-category-selector';
import { ModernImageUploader } from '@/components/forms/modern-image-uploader';

const STEPS = [
  { id: 1, name: 'Job Details', icon: FileText },
  { id: 2, name: 'Location & Budget', icon: MapPin },
  { id: 3, name: 'Photos', icon: Camera },
  { id: 4, name: 'Review', icon: CheckCircle2 },
];

export default function PostJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: '',
    budget_max: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.category) newErrors.category = 'Please select a category';
      if (!formData.description.trim())
        newErrors.description = 'Job description is required';
    }

    if (step === 2) {
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.budget_min) newErrors.budget_min = 'Minimum budget is required';
      if (!formData.budget_max) newErrors.budget_max = 'Maximum budget is required';
      if (
        parseInt(formData.budget_min) >= parseInt(formData.budget_max)
      ) {
        newErrors.budget_max = 'Maximum budget must be greater than minimum';
      }
    }

    if (step === 3) {
      if (uploadedFiles.length === 0)
        newErrors.images = 'Please add at least one photo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      // TODO: Submit to server action
      console.log('Submitting job:', { formData, uploadedFiles });
      // router.push('/dashboard');
    }
  };

  const isStep1 = currentStep === 1;
  const isStep2 = currentStep === 2;
  const isStep3 = currentStep === 3;
  const isStep4 = currentStep === 4;

  return (
    <div style={{ backgroundColor: COLORS['bg-light'] }}>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white py-8 px-4 md:px-8"
        style={{ boxShadow: SHADOWS.sm }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h1
            variants={ANIMATIONS.slideUpIn}
            initial="initial"
            animate="animate"
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: COLORS['text-dark'] }}
          >
            Create a New Job
          </motion.h1>
          <p
            className="text-lg"
            style={{ color: COLORS['text-muted'] }}
          >
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </motion.section>

      {/* Progress Steps */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-4 md:px-8 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start md:items-center gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ scale: isActive ? 1.1 : 1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: isCompleted
                          ? COLORS['trust-green']
                          : isActive
                            ? COLORS['energy-orange']
                            : COLORS['bg-light'],
                        color: isCompleted || isActive ? 'white' : COLORS['text-muted'],
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Icon size={24} />
                      )}
                    </motion.div>

                    <p
                      className="text-xs md:text-sm font-bold text-center"
                      style={{
                        color: isActive ? COLORS['text-dark'] : COLORS['text-muted'],
                      }}
                    >
                      {step.name}
                    </p>
                  </motion.div>

                  {index < STEPS.length - 1 && (
                    <motion.div
                      className="hidden md:block h-1 rounded-full mt-2"
                      style={{
                        backgroundColor: isCompleted
                          ? COLORS['trust-green']
                          : '#e5e7eb',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Form Content */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 md:px-8 py-8 max-w-4xl mx-auto"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 md:p-8"
          style={{ boxShadow: SHADOWS.md }}
        >
          {/* Step 1: Job Details */}
          {isStep1 && (
            <motion.div
              variants={ANIMATIONS.containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={ANIMATIONS.itemVariants}>
                <ModernFormInput
                  label="Job Title"
                  placeholder="e.g., Fix leaking kitchen tap"
                  value={formData.title}
                  onChange={(e) =>
                    handleInputChange('title', e.target.value)
                  }
                  error={errors.title}
                  icon={<FileText size={20} color={COLORS['text-muted']} />}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants}>
                <ModernCategorySelector
                  value={formData.category}
                  onChange={(value) =>
                    handleInputChange('category', value)
                  }
                  error={errors.category}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants}>
                <ModernFormTextarea
                  label="Job Description"
                  placeholder="Describe what needs to be done, any specific requirements, and what result you're expecting..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  error={errors.description}
                  charLimit={500}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Location & Budget */}
          {isStep2 && (
            <motion.div
              variants={ANIMATIONS.containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={ANIMATIONS.itemVariants}>
                <ModernFormInput
                  label="Location"
                  placeholder="Enter your location (e.g., Karen, Nairobi)"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  error={errors.location}
                  icon={<MapPin size={20} color={COLORS['text-muted']} />}
                />
              </motion.div>

              <motion.div variants={ANIMATIONS.itemVariants}>
                <p
                  className="block text-sm font-bold mb-4"
                  style={{ color: COLORS['text-dark'] }}
                >
                  Budget Range
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <ModernFormInput
                    label="Minimum Budget (KES)"
                    placeholder="e.g., 1,000"
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) =>
                      handleInputChange('budget_min', e.target.value)
                    }
                    error={errors.budget_min}
                    icon={
                      <DollarSign size={20} color={COLORS['text-muted']} />
                    }
                  />

                  <ModernFormInput
                    label="Maximum Budget (KES)"
                    placeholder="e.g., 5,000"
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) =>
                      handleInputChange('budget_max', e.target.value)
                    }
                    error={errors.budget_max}
                    icon={
                      <DollarSign size={20} color={COLORS['text-muted']} />
                    }
                  />
                </div>
              </motion.div>

              <motion.div
                variants={ANIMATIONS.itemVariants}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${COLORS['trust-green']}10`,
                  borderLeft: `4px solid ${COLORS['trust-green']}`,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: COLORS['text-dark'] }}
                >
                  💡 <strong>Tip:</strong> Include a realistic budget range to
                  get quality bids from verified fundis.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {isStep3 && (
            <motion.div
              variants={ANIMATIONS.containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <ModernImageUploader
                onFilesChange={setUploadedFiles}
                maxFiles={5}
                error={errors.images}
              />

              <motion.div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${COLORS['info']}10`,
                  borderLeft: `4px solid ${COLORS['info']}`,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: COLORS['text-dark'] }}
                >
                  📸 <strong>Good photos matter:</strong> Clear, well-lit photos
                  help fundis understand the job better and provide accurate quotes.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {isStep4 && (
            <motion.div
              variants={ANIMATIONS.containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS['text-muted'] }}
                >
                  JOB TITLE
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {formData.title}
                </p>
              </div>

              <div className="border-t-2 pt-4" style={{ borderColor: '#e5e7eb' }}>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS['text-muted'] }}
                >
                  DESCRIPTION
                </p>
                <p
                  className="text-base"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {formData.description}
                </p>
              </div>

              <div className="border-t-2 pt-4" style={{ borderColor: '#e5e7eb' }}>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS['text-muted'] }}
                >
                  CATEGORY
                </p>
                <p
                  className="text-base"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {formData.category}
                </p>
              </div>

              <div className="border-t-2 pt-4" style={{ borderColor: '#e5e7eb' }}>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS['text-muted'] }}
                >
                  LOCATION & BUDGET
                </p>
                <p
                  className="text-base mb-1"
                  style={{ color: COLORS['text-dark'] }}
                >
                  <strong>Location:</strong> {formData.location}
                </p>
                <p
                  className="text-base"
                  style={{ color: COLORS['text-dark'] }}
                >
                  <strong>Budget:</strong> KES {parseInt(formData.budget_min).toLocaleString()} - KES{' '}
                  {parseInt(formData.budget_max).toLocaleString()}
                </p>
              </div>

              <div className="border-t-2 pt-4" style={{ borderColor: '#e5e7eb' }}>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS['text-muted'] }}
                >
                  PHOTOS
                </p>
                <p
                  className="text-base"
                  style={{ color: COLORS['text-dark'] }}
                >
                  {uploadedFiles.length} photo{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>

              <motion.div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${COLORS['success']}10`,
                  borderLeft: `4px solid ${COLORS['success']}`,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: COLORS['text-dark'] }}
                >
                  ✅ <strong>Ready to post!</strong> Once you submit, verified
                  fundis will be notified and start bidding on your job.
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex gap-4 justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: COLORS['bg-light'],
              color: COLORS['text-dark'],
              border: `2px solid ${COLORS['border-light']}`,
            }}
          >
            ← Back
          </motion.button>

          {currentStep < STEPS.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-8 py-3 rounded-full font-bold text-white transition-all flex items-center gap-2"
              style={{
                backgroundColor: COLORS['trust-green'],
              }}
            >
              Next <ArrowRight size={18} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-full font-bold text-white transition-all flex items-center gap-2"
              style={{
                backgroundColor: COLORS['energy-orange'],
              }}
            >
              Post Job <CheckCircle2 size={18} />
            </motion.button>
          )}
        </motion.div>
      </motion.section>
    </div>
  );
}
