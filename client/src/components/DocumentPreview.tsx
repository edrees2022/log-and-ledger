/**
 * Document Preview Component
 * Preview PDFs, images, and documents in a modal
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Image,
  File,
  X,
} from 'lucide-react';

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
  type?: 'pdf' | 'image' | 'auto';
  onDownload?: () => void;
  onPrint?: () => void;
}

export function DocumentPreview({
  open,
  onOpenChange,
  url,
  title = 'Document',
  type = 'auto',
  onDownload,
  onPrint,
}: DocumentPreviewProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  // Determine file type
  const fileType = type === 'auto'
    ? url.match(/\.(pdf)$/i) ? 'pdf'
    : url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? 'image'
    : 'other'
    : type;

  useEffect(() => {
    setLoading(true);
    setError(false);
    setZoom(100);
    setRotation(0);
  }, [url]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      link.click();
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (fileType === 'image') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>${title}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              <img src="${url}" style="max-width:100%;max-height:100vh;" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fileType === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
              {fileType === 'image' && <Image className="h-5 w-5 text-blue-500" />}
              {fileType === 'other' && <File className="h-5 w-5 text-gray-500" />}
              <DialogTitle className="truncate">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 25}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            {fileType === 'image' && (
              <Button variant="ghost" size="icon" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Skeleton className="w-[80%] h-[80%]" />
            </div>
          )}

          {error && (
            <div className="text-center text-muted-foreground">
              <File className="h-16 w-16 mx-auto mb-4" />
              <p>{t('preview.loadError', 'Failed to load document')}</p>
              <Button variant="outline" className="mt-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('preview.downloadInstead', 'Download instead')}
              </Button>
            </div>
          )}

          {fileType === 'pdf' && (
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-full border-0"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}

          {fileType === 'image' && (
            <img
              src={url}
              alt={title}
              className={cn(
                "max-w-full max-h-full object-contain transition-transform",
                loading && "invisible"
              )}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}

          {fileType === 'other' && (
            <div className="text-center text-muted-foreground">
              <File className="h-16 w-16 mx-auto mb-4" />
              <p>{t('preview.unsupportedFormat', 'Preview not available for this file type')}</p>
              <Button variant="outline" className="mt-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('preview.download', 'Download')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Image Gallery Component
 */
interface GalleryImage {
  url: string;
  title?: string;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageGallery({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageGalleryProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 bg-black/95">
        <div className="relative min-h-[70vh] flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 z-10 text-white hover:bg-white/20"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 z-10 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={currentImage.url}
            alt={currentImage.title || `Image ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] object-contain"
          />

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm">{currentImage.title}</span>
              <span className="text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto bg-black/80">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors",
                  index === currentIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={image.thumbnail || image.url}
                  alt={image.title || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
