import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Dropzone from '@/components/upload/Dropzone';
import { UploadedFile } from '@/types';
import { api } from '@/lib/api';
import { sampleRubric } from '@/mocks/fixtures';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);

  const handleFilesUploaded = async (files: File[], type: 'exam_paper' | 'marking_scheme') => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      pageCount: Math.floor(Math.random() * 3) + 1, // Mock page count
      mappings: [],
      status: 'pending',
      type,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // If it's a marking scheme (answer sheet), extract data immediately
    if (type === 'marking_scheme') {
      try {
        setIsProcessing(true);
        
        // Process each file
        for (const file of files) {
          try {
            const result = await api.uploadAnswerSheet(file);
            setExtractedData(prev => [...prev, result]);
            
            // Update file status to processed
            setUploadedFiles(prev => 
              prev.map(f => 
                f.file.name === file.name 
                  ? { ...f, status: 'mapped' as const }
                  : f
              )
            );
            
            toast({
              title: "Answer sheet processed",
              description: `Extracted ${Object.keys(result.parsed_questions).length} questions from ${file.name}`,
            });
          } catch (error) {
            console.error('Error processing file:', error);
            toast({
              title: "Processing failed",
              description: `Failed to process ${file.name}`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload files",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
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
      // Here you would typically create a job with the extracted data
      // For now, we'll simulate the job creation
      const jobId = `job-${Date.now()}`;
      
      toast({
        title: "Grading started",
        description: `Job ${jobId} created successfully`,
      });

      // Navigate to review page with extracted data
      navigate(`/review/${jobId}`, { 
        state: { 
          extractedData,
          uploadedFiles: uploadedFiles.filter(f => f.type === 'marking_scheme')
        }
      });
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
                    Marking Scheme (Answer Sheet)
                  </h3>
                  <Card className="p-6">
                    <Dropzone 
                      onFiles={(files) => handleFilesUploaded(files, 'marking_scheme')}
                      uploadedFiles={uploadedFiles.filter(f => f.type === 'marking_scheme')}
                      onRemoveFile={(fileId) => 
                        setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
                      }
                      maxFiles={1}
                      accept={['.pdf']}
                      title="Upload answer sheet PDF"
                      description="Upload marking scheme"
                    />
                  </Card>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload the answer key or marking scheme for this exam. The system will automatically extract questions and answers.
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

              {/* Extracted Data Display */}
              {extractedData.length > 0 && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <h4 className="font-semibold mb-3 text-green-900">Extracted Answer Sheet Data</h4>
                  <div className="space-y-4">
                    {extractedData.map((data, index) => (
                      <div key={index} className="bg-white p-4 rounded border">
                        <h5 className="font-medium text-green-800 mb-2">{data.filename}</h5>
                        <div className="text-sm text-green-700">
                          <p><strong>Questions extracted:</strong> {Object.keys(data.parsed_questions).length}</p>
                          <div className="mt-2">
                            <strong>Question structure:</strong>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(data.parsed_questions, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

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