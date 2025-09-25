import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import GradingResults from './GradingResults';
import ManualAnswerInput from './ManualAnswerInput';

interface UploadedFile {
  id: string;
  file: File;
  type: 'marking' | 'answersheet';
  status: 'pending' | 'uploading' | 'success' | 'error';
  pdfId?: number;
  extractedData?: any;
}

interface GradingResult {
  student_id?: number;
  total_score: number;
  question_scores: Record<string, number>;
  feedback: string[];
  status: string;
}

interface NewUploadFormProps {
  onUploadComplete?: (markingSheets: UploadedFile[], answerSheets: UploadedFile[]) => void;
}

const NewUploadForm = ({ onUploadComplete }: NewUploadFormProps) => {
  const { toast } = useToast();
  const [markingSheets, setMarkingSheets] = useState<UploadedFile[]>([]);
  const [answerSheets, setAnswerSheets] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useOcr, setUseOcr] = useState(false);
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [selectedAnswerSheet, setSelectedAnswerSheet] = useState<UploadedFile | null>(null);

  const handleMarkingSheetUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `marking-${Date.now()}-${index}`,
      file,
      type: 'marking',
      status: 'uploading',
    }));

    setMarkingSheets(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const file of files) {
      try {
        const result = await api.uploadMarkingSheet(file);
        
        setMarkingSheets(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { 
                  ...f, 
                  status: 'success' as const, 
                  pdfId: result.data.id,
                  extractedData: { message: result.message }
                }
              : f
          )
        );

        toast({
          title: "Marking sheet uploaded",
          description: `Successfully uploaded ${file.name}. Processing in background...`,
        });
      } catch (error) {
        console.error('Error uploading marking sheet:', error);
        setMarkingSheets(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { ...f, status: 'error' as const }
              : f
          )
        );

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleAnswerSheetUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `answersheet-${Date.now()}-${index}`,
      file,
      type: 'answersheet',
      status: 'uploading',
    }));

    setAnswerSheets(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const file of files) {
      try {
        const result = await api.uploadAnswerSheet(
          file,
          undefined,
          undefined,
          useOcr
        );
        
        setAnswerSheets(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { 
                  ...f, 
                  status: 'success' as const, 
                  pdfId: result.data.id,
                  extractedData: { message: result.message }
                }
              : f
          )
        );

        toast({
          title: "Answer sheet uploaded",
          description: `Successfully uploaded ${file.name}. Processing in background...`,
        });
      } catch (error: any) {
        console.error('Error uploading answer sheet:', error);
        setAnswerSheets(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { ...f, status: 'error' as const }
              : f
          )
        );

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (type: 'marking' | 'answersheet') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (type === 'marking') {
      handleMarkingSheetUpload(files);
    } else {
      handleAnswerSheetUpload(files);
    }
    // Don't reset input value to allow multiple selections
  };

  const removeFile = (type: 'marking' | 'answersheet', fileId: string) => {
    if (type === 'marking') {
      setMarkingSheets(prev => prev.filter(f => f.id !== fileId));
    } else {
      setAnswerSheets(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleManualInput = (file: UploadedFile) => {
    setSelectedAnswerSheet(file);
    setShowManualInput(true);
  };

  const handleManualAnswersSubmitted = (answers: Record<string, Record<string, string>>) => {
    if (selectedAnswerSheet) {
      // Update the answer sheet with manual answers
      setAnswerSheets(prev => 
        prev.map(f => 
          f.id === selectedAnswerSheet.id 
            ? { 
                ...f, 
                extractedData: {
                  ...f.extractedData,
                  parsed_questions: answers,
                  question_count: Object.keys(answers).length,
                  warning: undefined // Clear the warning since we now have real answers
                }
              }
            : f
        )
      );
      
      toast({
        title: "Answers updated",
        description: "Manual answers have been entered and are ready for grading",
      });
    }
    setShowManualInput(false);
    setSelectedAnswerSheet(null);
  };

  const handleGradeAnswers = async () => {
    if (markingSheets.length === 0 || answerSheets.length === 0) {
      toast({
        title: "Missing files",
        description: "Please upload both marking sheets and answer sheets",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Get the first successful marking sheet and answer sheets
      const markingSheet = markingSheets.find(f => f.status === 'success');
      if (!markingSheet || !markingSheet.pdfId) {
        throw new Error('No valid marking sheet found');
      }

      const successfulAnswerSheets = answerSheets.filter(f => f.status === 'success' && f.pdfId);
      if (successfulAnswerSheets.length === 0) {
        throw new Error('No valid answer sheets found');
      }

      const answerSheetIds = successfulAnswerSheets.map(sheet => sheet.pdfId!);

      // Start batch grading
      const result = await api.gradeAnswers(markingSheet.pdfId, answerSheetIds);
      
      toast({
        title: "Grading started",
        description: `Started grading ${result.data.answer_sheet_count} answer sheet(s). Results will be available shortly.`,
        duration: 5000,
      });

      if (onUploadComplete) {
        onUploadComplete(markingSheets, answerSheets);
      }
    } catch (error) {
      console.error('Error in grading process:', error);
      toast({
        title: "Grading process failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'uploading': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Show Results if available */}
      <AnimatePresence>
        {showResults && gradingResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GradingResults 
              results={gradingResults} 
              onClose={() => setShowResults(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Answer Input Modal */}
      <AnimatePresence>
        {showManualInput && selectedAnswerSheet && (
          <ManualAnswerInput
            answerSheetId={selectedAnswerSheet.pdfId || 0}
            fileName={selectedAnswerSheet.file.name}
            onAnswersSubmitted={handleManualAnswersSubmitted}
            onClose={() => {
              setShowManualInput(false);
              setSelectedAnswerSheet(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload Sections Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Marking Sheets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full flex flex-col"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon.Document className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Marking Sheets
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">Upload your marking scheme and answer keys</p>
          </div>
          
          <Card className="p-6 flex-1 flex flex-col border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Upload Area */}
              <div className="relative">
                <Label htmlFor="marking-upload" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Upload Marking Scheme
                </Label>
                <div className="mt-3 relative group">
                  <Input
                    id="marking-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect('marking')}
                    className="h-12 border-2 border-dashed border-blue-200 hover:border-blue-300 focus:border-blue-400 transition-colors duration-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:bg-blue-950/20"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Icon.Upload className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>

              {markingSheets.length > 0 && (
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uploaded Files</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {markingSheets.length}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMarkingSheets([])}
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Icon.Trash className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {markingSheets.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <Icon.Document className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {file.file.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.file.size)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                file.status === 'success' ? 'default' : 
                                file.status === 'uploading' ? 'secondary' : 
                                'destructive'
                              }
                              className={`text-xs font-medium ${
                                file.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                file.status === 'uploading' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {file.status === 'success' && <Icon.Check className="h-3 w-3 mr-1" />}
                              {file.status === 'uploading' && <Icon.Loader className="h-3 w-3 mr-1 animate-spin" />}
                              {file.status === 'error' && <Icon.X className="h-3 w-3 mr-1" />}
                              {file.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('marking', file.id)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                            >
                              <Icon.X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Answer Sheets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full flex flex-col"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon.Upload className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Answer Sheets
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">Upload student answer sheets for grading</p>
          </div>
          
          <Card className="p-6 flex-1 flex flex-col border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
            <div className="space-y-6 flex-1 flex flex-col">
              {/* OCR Toggle */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon.Scan className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <Label htmlFor="use-ocr" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Use OCR for handwritten text
                    </Label>
                  </div>
                  <Switch
                    id="use-ocr"
                    checked={useOcr}
                    onCheckedChange={setUseOcr}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="relative">
                <Label htmlFor="answersheet-upload" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Upload Answer Sheets
                </Label>
                <div className="mt-3 relative group">
                  <Input
                    id="answersheet-upload"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileSelect('answersheet')}
                    className="h-12 border-2 border-dashed border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors duration-200 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:bg-emerald-950/20"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Icon.Upload className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              </div>

              {answerSheets.length > 0 && (
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uploaded Files</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        {answerSheets.length}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnswerSheets([])}
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Icon.Trash className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {answerSheets.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-emerald-200 dark:hover:border-emerald-700">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <Icon.Document className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {file.file.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.file.size)}</div>
                              {file.extractedData?.warning && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Icon.AlertTriangle className="h-3 w-3 text-amber-500" />
                                  <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Manual input required</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                file.status === 'success' ? 'default' : 
                                file.status === 'uploading' ? 'secondary' : 
                                'destructive'
                              }
                              className={`text-xs font-medium ${
                                file.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                file.status === 'uploading' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {file.status === 'success' && <Icon.Check className="h-3 w-3 mr-1" />}
                              {file.status === 'uploading' && <Icon.Loader className="h-3 w-3 mr-1 animate-spin" />}
                              {file.status === 'error' && <Icon.X className="h-3 w-3 mr-1" />}
                              {file.status}
                            </Badge>
                            
                            {file.extractedData?.warning && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManualInput(file)}
                                className="text-xs h-7 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                              >
                                <Icon.Edit className="h-3 w-3 mr-1" />
                                Manual
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('answersheet', file.id)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                            >
                              <Icon.X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Grade Button Section */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Status Summary */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Marking: {markingSheets.length}</span>
            <span>Answers: {answerSheets.length}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {gradingResults.length > 0 && !showResults && (
              <Button
                onClick={() => setShowResults(true)}
                variant="outline"
              >
                <Icon.Eye className="mr-2 h-4 w-4" />
                View Results
              </Button>
            )}
            
            <Button
              onClick={handleGradeAnswers}
              disabled={
                markingSheets.length === 0 || 
                answerSheets.length === 0 || 
                isUploading ||
                answerSheets.some(f => f.status === 'success' && f.extractedData?.warning)
              }
              className="min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Icon.Loader className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Icon.Play className="mr-2 h-4 w-4" />
                  Grade Answers
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewUploadForm;
