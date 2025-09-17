import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Dropzone from '@/components/upload/Dropzone';
import FieldMapper from '@/components/upload/FieldMapper';
import RubricEditor from '@/components/upload/RubricEditor';
import { UploadedFile, Rubric } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { sampleRubric } from '@/mocks/fixtures';
import { useToast } from '@/hooks/use-toast';

type UploadStep = 'files' | 'mapping' | 'rubric' | 'confirm';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<UploadStep>('files');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [rubric, setRubric] = useState<Rubric>(sampleRubric);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 'files', label: 'Upload Files', icon: Icon.Upload },
    { id: 'mapping', label: 'Field Mapping', icon: Icon.Settings },
    { id: 'rubric', label: 'Rubric Setup', icon: Icon.Document },
    { id: 'confirm', label: 'Confirm & Start', icon: Icon.Check },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleFilesUploaded = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      pageCount: Math.floor(Math.random() * 3) + 1, // Mock page count
      mappings: [],
      status: 'pending',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleAutoMap = async (fileId: string) => {
    try {
      const mappings = await mockApi.autoMapFields(fileId);
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, mappings, status: 'mapped' }
            : file
        )
      );
      toast({
        title: "Auto-mapping completed",
        description: `Found ${mappings.length} field mappings with AI`,
      });
    } catch (error) {
      toast({
        title: "Auto-mapping failed",
        description: "Please map fields manually",
        variant: "destructive",
      });
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

      navigate(`/jobs`);
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
    switch (currentStep) {
      case 'files':
        return uploadedFiles.length > 0;
      case 'mapping':
        return uploadedFiles.every(f => f.mappings.length > 0);
      case 'rubric':
        return rubric.questions.length > 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex].id as UploadStep);
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex].id as UploadStep);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Icon.Document className="h-8 w-8" />
              <h1 className="text-2xl font-bold">AutoGrader</h1>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-50 px-4 py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  ${index <= currentStepIndex 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-gray-300 text-gray-400'
                  }
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    h-1 w-16 mx-4 
                    ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'files' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Upload Exam Papers</h2>
              <Card className="p-6">
                <Dropzone 
                  onFiles={handleFilesUploaded}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={(fileId) => 
                    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
                  }
                />
              </Card>
            </div>
          )}

          {currentStep === 'mapping' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Map Student Fields</h2>
              <div className="space-y-6">
                {uploadedFiles.map(file => (
                  <Card key={file.id} className="p-6">
                    <FieldMapper 
                      file={file}
                      onAutoMap={() => handleAutoMap(file.id)}
                      onUpdateMappings={(mappings) => 
                        setUploadedFiles(prev => 
                          prev.map(f => 
                            f.id === file.id 
                              ? { ...f, mappings, status: 'mapped' }
                              : f
                          )
                        )
                      }
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'rubric' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Setup Grading Rubric</h2>
              <Card className="p-6">
                <RubricEditor 
                  rubric={rubric}
                  onChange={setRubric}
                />
              </Card>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Review & Start Grading</h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Files to Process</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Icon.Document className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{file.file.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {file.pageCount} pages, {file.mappings.length} fields mapped
                          </span>
                        </div>
                        <div className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${file.status === 'mapped' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                        `}>
                          {file.status === 'mapped' ? 'Ready' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Grading Rubric</h3>
                  <div className="space-y-2">
                    <div className="font-medium">{rubric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {rubric.questions.length} questions, {rubric.questions.reduce((sum, q) => sum + q.maxScore, 0)} total points
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="btn-tertiary"
          >
            <Icon.ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex space-x-3">
            <Link to="/">
              <Button variant="outline" className="btn-tertiary">
                Cancel
              </Button>
            </Link>
            
            {currentStep !== 'confirm' ? (
              <Button 
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Save & Continue
                <Icon.ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleStartGrading}
                disabled={!canProceed() || isProcessing}
                className="bg-gradient-primary text-white px-8 py-4 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;