'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { COLORS, ANIMATIONS, SHADOWS } from '@/lib/design-tokens';

interface ModernImageUploaderProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export function ModernImageUploader({
  onFilesChange,
  maxFiles = 5,
  error,
}: ModernImageUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));

    const remainingSlots = maxFiles - uploadedFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newFiles = [...uploadedFiles, ...filesToAdd];
    setUploadedFiles(newFiles);
    onFilesChange?.(newFiles);

    // Create previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews((prev) => [
          ...prev,
          event.target?.result as string,
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange?.(newFiles);
  };

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
        Add Photos ({uploadedFiles.length}/{maxFiles})
      </label>

      {/* Upload Area */}
      {uploadedFiles.length < maxFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-6 rounded-lg border-2 border-dashed transition-all"
            style={{
              borderColor: error ? '#ef4444' : COLORS['trust-green'],
              backgroundColor: `${COLORS['trust-green']}10`,
              boxShadow: SHADOWS.sm,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload
                size={32}
                color={COLORS['trust-green']}
              />
              <p
                className="font-bold"
                style={{ color: COLORS['text-dark'] }}
              >
                Upload Photos
              </p>
              <p
                className="text-sm"
                style={{ color: COLORS['text-muted'] }}
              >
                Tap to select images from your device
              </p>
            </div>
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      )}

      {/* Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {previews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div
                  className="w-full aspect-square rounded-lg overflow-hidden"
                  style={{ boxShadow: SHADOWS.md }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Delete Button */}
                <motion.button
                  type="button"
                  onClick={() => removeFile(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </motion.button>

                {/* Badge */}
                <div
                  className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-white text-xs font-bold"
                  style={{
                    color: COLORS['text-dark'],
                    boxShadow: SHADOWS.sm,
                  }}
                >
                  {index + 1}/{maxFiles}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
