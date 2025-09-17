import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Submission } from '@/types';

interface ImageViewerProps {
  submission: Submission;
  selectedPage: number;
  onPageChange: (page: number) => void;
}

const ImageViewer = ({ submission, selectedPage, onPageChange }: ImageViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentPage = submission.pages[selectedPage];
  
  if (!currentPage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Icon.Document className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No page selected</p>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="confidence-high">High OCR</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge className="confidence-medium">Medium OCR</Badge>;
    } else {
      return <Badge className="confidence-low">Low OCR</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Page:</span>
            <div className="flex space-x-1">
              {submission.pages.map((_, index) => (
                <Button
                  key={index}
                  variant={selectedPage === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(index)}
                  className="w-8 h-8 p-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getConfidenceBadge(currentPage.ocrConfidence)}
            <span className="text-sm text-muted-foreground">
              {Math.round(currentPage.ocrConfidence * 100)}% OCR confidence
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="btn-tertiary"
          >
            <Icon.Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="btn-tertiary"
          >
            <Icon.Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomReset}
            className="btn-tertiary"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        <div
          className={`h-full flex items-center justify-center ${zoom > 100 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.div
            className="relative"
            style={{
              transform: `scale(${zoom / 100}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            }}
            animate={{
              scale: zoom / 100,
              x: panPosition.x,
              y: panPosition.y,
            }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            <img
              src={currentPage.imageUrl}
              alt={`Page ${selectedPage + 1} of submission`}
              className="max-w-full max-h-full shadow-lg border border-gray-300"
              draggable={false}
              style={{ userSelect: 'none' }}
            />
            
            {/* OCR Text Overlay (toggle-able) */}
            {zoom >= 100 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* This would show OCR bounding boxes and detected text in a real implementation */}
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {submission.pages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, selectedPage - 1))}
              disabled={selectedPage === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 btn-tertiary"
            >
              <Icon.ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(submission.pages.length - 1, selectedPage + 1))}
              disabled={selectedPage === submission.pages.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 btn-tertiary"
            >
              <Icon.ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* OCR Text Panel */}
      <div className="border-t border-gray-200 bg-white">
        <Card className="m-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Extracted Text (OCR)</h4>
            <Badge variant="outline" className="text-xs">
              Page {selectedPage + 1}
            </Badge>
          </div>
          <div className="text-sm bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
            {currentPage.ocrText || 'No text detected'}
          </div>
          {currentPage.ocrConfidence < 0.8 && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center">
              <Icon.AlertTriangle className="h-3 w-3 mr-1" />
              Low OCR confidence - manual verification recommended
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImageViewer;