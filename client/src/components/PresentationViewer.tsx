import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

/**
 * PresentationViewer Component
 * 
 * Displays and controls presentation files (PDF/PPT/PPTX).
 * Features:
 * - PDF rendering using PDF.js
 * - PowerPoint viewing via Google Docs Viewer
 * - Slide navigation controls
 * - Loading and error states
 * 
 * @param file - The presentation file to display
 * @param currentSlide - Current slide number
 * @param onSlideChange - Callback when slide changes
 */
interface PresentationViewerProps {
  file: File;
  currentSlide: number;
  onSlideChange: (slideNumber: number) => void;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ file, currentSlide, onSlideChange }) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [totalSlides, setTotalSlides] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize viewer based on file type
  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setIsLoading(true);
    setError(null);

    // Handle PDF files
    if (file.type === 'application/pdf') {
      import('pdfjs-dist').then((pdfjs) => {
        // Configure PDF.js worker
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        // Load and parse PDF
        pdfjs.getDocument(url).promise.then((pdf) => {
          setTotalSlides(pdf.numPages);
          setIsLoading(false);
        }).catch((err) => {
          setError('Error loading PDF');
          setIsLoading(false);
        });
      });
    }
    // Handle PowerPoint files
    else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
      // Use Google Docs Viewer for PowerPoint files
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      setFileUrl(googleDocsUrl);
      setIsLoading(false);
    }

    // Cleanup URL on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-white rounded-lg overflow-hidden relative">
      {/* Presentation Display */}
      <iframe
        src={fileUrl}
        className="w-full h-full border-0"
        title="Presentation Viewer"
        allowFullScreen
      />
      
      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 text-white px-6 py-2 rounded-full">
        <button 
          onClick={() => onSlideChange(Math.max(1, currentSlide - 1))}
          className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          disabled={currentSlide === 1}
        >
          Previous
        </button>
        <span>Slide {currentSlide} of {totalSlides}</span>
        <button 
          onClick={() => onSlideChange(Math.min(totalSlides, currentSlide + 1))}
          className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          disabled={currentSlide === totalSlides}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PresentationViewer;