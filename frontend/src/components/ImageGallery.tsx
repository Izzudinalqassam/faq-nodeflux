import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Download, X } from 'lucide-react';

interface Image {
  id: number;
  url: string;
  original_filename: string;
  file_size: number;
}

interface ImageGalleryProps {
  images: Image[];
  title?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title = "Gallery" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const currentImage = images[currentImageIndex];
  const totalImages = images.length;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleDownload = (image: Image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.original_filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getThumbnailStyle = (url: string) => ({
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  });

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mobile-gallery">
        {images.map((image, index) => (
          <button
            key={image.id}
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 mobile-gallery-item mobile-touch-target mobile-touch-feedback"
            onClick={() => handleImageClick(index)}
          >
            <div
              style={getThumbnailStyle(image.url)}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white rounded-lg p-2">
                <ZoomIn className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
            </div>
            {totalImages > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {totalImages}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Navigation Dots */}
      {totalImages > 1 && (
        <div className="flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-2 md:p-4 mobile-lightbox mobile-scroll-container">
          <div className="relative max-w-6xl max-h-full w-full mobile-lightbox-content">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-full p-2 transition-colors mobile-btn-icon"
              title="Close gallery"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Navigation Buttons */}
            {totalImages > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-full p-2 transition-colors mobile-btn-icon"
                  title="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-full p-2 transition-colors mobile-btn-icon"
                  title="Next image"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-100 px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate mobile-body">
                    {title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 mobile-small">
                      {currentImageIndex + 1} of {totalImages}
                    </span>
                    <button
                      onClick={() => handleDownload(currentImage)}
                      className="text-gray-500 hover:text-gray-700 transition-colors mobile-btn-icon"
                      title="Download image"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center bg-gray-50 p-2 md:p-4" style={{ minHeight: '200px', maxHeight: '70vh' }}>
                <img
                  src={currentImage.url}
                  alt={currentImage.original_filename}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Footer */}
              <div className="bg-gray-100 px-3 md:px-4 py-2 md:py-3 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-gray-700 truncate mobile-body">
                    {currentImage.original_filename}
                  </p>
                  <span className="text-xs text-gray-500 mobile-small md:mt-0">
                    {formatFileSize(currentImage.file_size)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;