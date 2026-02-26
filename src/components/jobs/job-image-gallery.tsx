"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

export type JobImage = {
  id: string;
  job_id: string;
  storage_path: string;
  created_at: string;
};

interface JobImageGalleryProps {
  images: JobImage[];
  publicUrls?: Record<string, string>;
  isJobOwner?: boolean;
  onDeleteImage?: (imageId: string) => Promise<void>;
}

export function JobImageGallery({ 
  images, 
  publicUrls = {},
  isJobOwner = false,
  onDeleteImage 
}: JobImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No images uploaded.</p>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[currentIndex];
  const currentUrl = publicUrls[currentImage.id];

  console.log("[JobImageGallery Client] Rendered with images:", images);
  console.log("[JobImageGallery Client] Public URLs:", publicUrls);
  console.log("[JobImageGallery Client] Current image:", currentImage);
  console.log("[JobImageGallery Client] Current URL:", currentUrl);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleDelete = async () => {
    if (!isJobOwner || !onDeleteImage) return;
    setIsDeleting(true);
    try {
      await onDeleteImage(currentImage.id);
      // Image should be removed from parent, but navigate to next/prev if available
      if (images.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Images ({images.length})</CardTitle>
          <span className="text-xs text-muted-foreground">{currentIndex + 1} of {images.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentUrl ? (
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        ) : (
          <>
            {/* Main Image Viewer */}
            <div className={`relative w-full rounded-md overflow-hidden bg-gray-100 ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
              <div className={`relative aspect-square w-full transition-transform ${isZoomed ? "scale-150" : "scale-100"}`}>
                <Image
                  src={currentUrl}
                  alt={`Job image ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                  onClick={() => setIsZoomed(!isZoomed)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Overlay Controls */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="rounded-full w-9 h-9 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrev}
                disabled={images.length <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Thumbnail Strip */}
              <div className="flex-1 overflow-x-auto flex gap-2 px-2">
                {images.map((img, idx) => {
                  const url = publicUrls[img.id];
                  return (
                    <button
                      key={img.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsZoomed(false);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === currentIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      {url ? (
                        <Image
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={images.length <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Delete Button */}
            {isJobOwner && onDeleteImage && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? "Deleting..." : "Delete Image"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
