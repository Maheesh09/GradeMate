import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Dropzone from '@/components/upload/Dropzone';
import { UploadedFile } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { sampleRubric } from '@/mocks/fixtures';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesUploaded = (files: File[], type: 'exam_paper' | 'marking_scheme') => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      pageCount: Math.floor(Math.random() * 3) + 1, // Mock page count
      mappings: [],
      status: 'pending',
      type,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };


  const handleStartGrading = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fileIds = uploadedFiles.map(f => f.id);
      const allMappings = uploadedFiles.flatMap(f => f.mappings);
      
      const job = await mockApi.createJob(
        `Grading Job - ${new Date().toLocaleDateString()}`,
        fileIds,
        rubric.id,
        allMappings
      );

      toast({
        title: "Grading started",
        description: `Job ${job.id} created successfully`,
      });

      navigate(`/review/${job.id}`);
    } catch (error) {
      toast({
        title: "Failed to start grading",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    const hasMarkingScheme = uploadedFiles.some(f => f.type === 'marking_scheme');
    const hasExamPapers = uploadedFiles.some(f => f.type === 'exam_paper');
    return hasMarkingScheme && hasExamPapers;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white rounded-full shadow-sm">
                <img src="/logo.png" alt="GradeMate Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-2xl font-bold">GradeMate</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:block">Upload Files</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Upload Files</h2>
                <p className="text-muted-foreground mb-8">
                  Upload both the marking scheme and exam papers to get started with AI grading.
                </p>
              </div>

              {/* Upload Sections - Side by Side on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Marking Scheme Upload */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Icon.Document className="mr-2 h-5 w-5" />
                    Marking Scheme
                  </h3>
                  <Card className="p-6">
                    <Dropzone 
                      onFiles={(files) => handleFilesUploaded(files, 'marking_scheme')}
                      uploadedFiles={uploadedFiles.filter(f => f.type === 'marking_scheme')}
                      onRemoveFile={(fileId) => 
                        setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
                      }
                      maxFiles={1}
                      accept={['.pdf', '.jpg', '.jpeg', '.png']}
                      title="Upload marking scheme or answer key"
                      description="Upload marking scheme"
                    />
                  </Card>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload the answer key or marking scheme for this exam. This helps the AI understand the correct answers and scoring criteria.
                  </p>
                </div>

                {/* Exam Papers Upload */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Icon.Upload className="mr-2 h-5 w-5" />
                    Exam Papers
                  </h3>
                  <Card className="p-6">
                    <Dropzone 
                      onFiles={(files) => handleFilesUploaded(files, 'exam_paper')}
                      uploadedFiles={uploadedFiles.filter(f => f.type === 'exam_paper')}
                      onRemoveFile={(fileId) => 
                        setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
                      }
                      maxFiles={50}
                      accept={['.pdf', '.jpg', '.jpeg', '.png']}
                      title="Upload student exam papers"
                      description="Upload exam papers"
                    />
                  </Card>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload scanned exam papers from students. You can upload multiple files at once.
                  </p>
                </div>
              </div>

              {/* Upload Summary */}
              {uploadedFiles.length > 0 && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold mb-3 text-blue-900">Upload Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Marking Scheme:</span>
                      <span className="font-medium text-blue-900">
                        {uploadedFiles.filter(f => f.type === 'marking_scheme').length} file(s)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Exam Papers:</span>
                      <span className="font-medium text-blue-900">
                        {uploadedFiles.filter(f => f.type === 'exam_paper').length} file(s)
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Requirements Check */}
              {uploadedFiles.length > 0 && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-3">Requirements Check</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {uploadedFiles.some(f => f.type === 'marking_scheme') ? (
                        <Icon.Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icon.X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={uploadedFiles.some(f => f.type === 'marking_scheme') ? 'text-green-700' : 'text-red-700'}>
                        Marking scheme uploaded
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFiles.some(f => f.type === 'exam_paper') ? (
                        <Icon.Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icon.X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={uploadedFiles.some(f => f.type === 'exam_paper') ? 'text-green-700' : 'text-red-700'}>
                        Exam papers uploaded
                      </span>
                    </div>
                  </div>
                  {!canProceed() && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Please upload both a marking scheme and exam papers to continue.
                    </p>
                  )}
                </Card>
              )}
            </div>
        </motion.div>
      </main>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-border p-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto btn-tertiary">
                Cancel
              </Button>
            </Link>
            
            <Button 
              onClick={handleStartGrading}
              disabled={!canProceed() || isProcessing}
              className="w-full sm:w-auto bg-gradient-primary text-white px-6 py-3 sm:px-8 sm:py-4 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="animate-pulse-subtle mr-2 h-4 w-4 rounded-full bg-current" />
                  Starting...
                </>
              ) : (
                <>
                  <Icon.Play className="mr-2 h-4 w-4" />
                  Start Grading
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;