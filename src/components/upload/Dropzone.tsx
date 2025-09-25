import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from '@/types';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  maxFiles?: number;
  accept?: string[];
  title?: string;
  description?: string;
}

const Dropzone = ({ 
  onFiles, 
  uploadedFiles, 
  onRemoveFile, 
  maxFiles = 50,
  accept = ['.pdf', '.jpg', '.jpeg', '.png'],
  title = "Drag & drop files here or click to browse",
  description = "Upload exam papers"
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
    <div className="space-y-8">
      {/* Enhanced Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg scale-[1.02]' 
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/3 hover:to-accent/3 hover:shadow-md'
          }
          bg-gradient-to-br from-background to-muted/20
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
        
        <div className="relative space-y-6">
          {/* Enhanced Upload Icon */}
          <motion.div 
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
            animate={isDragOver ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.6, repeat: isDragOver ? Infinity : 0 }}
          >
            <Icon.Upload className="h-10 w-10 text-white" />
          </motion.div>
          
          <div className="space-y-3">
            <motion.h3 
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-muted-foreground text-lg max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          </div>

          {/* File type badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {accept.map((type, index) => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="px-3 py-1 text-xs font-medium"
              >
                {type}
              </Badge>
            ))}
          </motion.div>

          {/* Enhanced Upload Button */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="btn-hero cursor-pointer relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
              />
              <Icon.Upload className="mr-2 h-5 w-5 relative z-10" />
              <span className="relative z-10">Choose Files</span>
              <input
                type="file"
                multiple
                accept={accept.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </motion.div>

          {/* File limits info */}
          <motion.div 
            className="text-sm text-muted-foreground space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Icon.File className="h-4 w-4" />
                <span>Max {maxFiles} files</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon.HardDrive className="h-4 w-4" />
                <span>Max 20MB per file</span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Upload Progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div 
                className="max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon.Loader className="h-4 w-4 text-primary" />
                      </motion.div>
                      <span className="font-medium">Uploading files...</span>
                    </div>
                    <span className="text-muted-foreground">Processing</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced File List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <motion.h3 
                className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Uploaded Files ({uploadedFiles.length})
              </motion.h3>
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Icon.Check className="h-4 w-4 text-success" />
                <span>All files validated</span>
              </motion.div>
            </div>
            
            <div className="grid gap-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          whileHover={{ rotate: 5 }}
                        >
                          <Icon.Document className="h-6 w-6 text-primary" />
                        </motion.div>
                        
                        <div className="space-y-1">
                          <div className="font-semibold text-base group-hover:text-primary transition-colors">
                            {uploadedFile.file.name}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Icon.HardDrive className="h-3 w-3" />
                              <span>{formatFileSize(uploadedFile.file.size)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon.File className="h-3 w-3" />
                              <span>{uploadedFile.pageCount} pages</span>
                            </div>
                            {uploadedFile.type && (
                              <Badge 
                                variant={uploadedFile.type === 'marking_scheme' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {uploadedFile.type === 'marking_scheme' ? 'Marking Scheme' : 'Exam Paper'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={
                            uploadedFile.status === 'mapped' ? 'default' : 
                            uploadedFile.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                          className="px-3 py-1"
                        >
                          <div className="flex items-center gap-1">
                            {uploadedFile.status === 'mapped' && <Icon.Check className="h-3 w-3" />}
                            {uploadedFile.status === 'pending' && <Icon.Clock className="h-3 w-3" />}
                            {uploadedFile.status === 'error' && <Icon.X className="h-3 w-3" />}
                            <span className="text-xs font-medium">
                              {uploadedFile.status === 'mapped' ? 'Mapped' : 
                               uploadedFile.status === 'pending' ? 'Pending' : 'Error'}
                            </span>
                          </div>
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveFile(uploadedFile.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Icon.X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {uploadedFile.mappings.length > 0 && (
                      <motion.div 
                        className="mt-4 pt-4 border-t border-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon.Link className="h-4 w-4" />
                          <span>{uploadedFile.mappings.length} field mappings detected</span>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Validation Messages */}
            <motion.div 
              className="bg-gradient-to-r from-success/10 to-accent/10 rounded-xl p-4 border border-success/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon.Shield className="h-5 w-5 text-success" />
                <span className="font-semibold text-success">Validation Complete</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Icon.Check className="h-4 w-4 text-success" />
                  <span>File types validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon.Check className="h-4 w-4 text-success" />
                  <span>File sizes within limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon.Check className="h-4 w-4 text-success" />
                  <span>Ready for processing</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropzone;