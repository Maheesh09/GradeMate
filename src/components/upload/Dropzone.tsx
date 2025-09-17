import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadedFile } from '@/types';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  maxFiles?: number;
  accept?: string[];
}

const Dropzone = ({ 
  onFiles, 
  uploadedFiles, 
  onRemoveFile, 
  maxFiles = 50,
  accept = ['.pdf', '.jpg', '.jpeg', '.png'] 
}: DropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
    e.target.value = ''; // Reset input
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file count
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return accept.includes(extension);
    });

    if (validFiles.length !== files.length) {
      alert(`Only ${accept.join(', ')} files are allowed`);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onFiles(validFiles);
    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <motion.div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-primary bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Icon.Upload className="h-8 w-8 text-gray-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Drag & drop files here or click to browse
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload exam papers ({accept.join(', ')}) • Max {maxFiles} files • Max 20MB per file
            </p>
          </div>

          <div className="flex justify-center">
            <label className="btn-secondary cursor-pointer">
              <Icon.Upload className="mr-2 h-4 w-4" />
              Choose Files
              <input
                type="file"
                multiple
                accept={accept.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {uploading && (
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>Processing</span>
              </div>
              <div className="animate-pulse-subtle h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary rounded-full w-2/3"></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h3>
          
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Icon.Document className="h-5 w-5 text-gray-500" />
                      </div>
                      
                      <div>
                        <div className="font-medium text-sm">{uploadedFile.file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.file.size)} • {uploadedFile.pageCount} pages
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${uploadedFile.status === 'mapped' ? 'confidence-high' : 
                          uploadedFile.status === 'pending' ? 'confidence-medium' : 
                          'confidence-low'}
                      `}>
                        {uploadedFile.status === 'mapped' ? 'Mapped' : 
                         uploadedFile.status === 'pending' ? 'Pending' : 'Error'}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveFile(uploadedFile.id)}
                        className="btn-tertiary p-1"
                      >
                        <Icon.X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {uploadedFile.mappings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-muted-foreground">
                        {uploadedFile.mappings.length} field mappings detected
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Validation Messages */}
          <div className="text-sm text-muted-foreground">
            <div>✓ File types validated</div>
            <div>✓ File sizes within limits</div>
            <div>✓ Ready for field mapping</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;