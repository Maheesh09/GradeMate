import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import GradingResults from './GradingResults';

interface UploadedFile {
  id: string;
  file: File;
  type: 'marking' | 'answersheet';
  status: 'pending' | 'uploading' | 'success' | 'error';
  pdfId?: number;
  studentId?: number;
  subjectId?: number;
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
  const [studentId, setStudentId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [useOcr, setUseOcr] = useState(false);
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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
                  pdfId: result.pdf_id,
                  extractedData: result
                }
              : f
          )
        );

        toast({
          title: "Marking sheet uploaded",
          description: `Successfully processed ${file.name} with ${result.question_count} questions`,
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
          studentId ? parseInt(studentId) : undefined,
          subjectId ? parseInt(subjectId) : undefined,
          useOcr
        );
        
        setAnswerSheets(prev => 
          prev.map(f => 
            f.file.name === file.name 
              ? { 
                  ...f, 
                  status: 'success' as const, 
                  pdfId: result.pdf_id,
                  studentId: result.student_id,
                  subjectId: result.subject_id,
                  extractedData: result
                }
              : f
          )
        );

        toast({
          title: "Answer sheet uploaded",
          description: `Successfully processed ${file.name} with ${result.question_count} questions`,
        });
      } catch (error) {
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
    if (type === 'marking') {
      handleMarkingSheetUpload(files);
    } else {
      handleAnswerSheetUpload(files);
    }
    e.target.value = ''; // Reset input
  };

  const removeFile = (type: 'marking' | 'answersheet', fileId: string) => {
    if (type === 'marking') {
      setMarkingSheets(prev => prev.filter(f => f.id !== fileId));
    } else {
      setAnswerSheets(prev => prev.filter(f => f.id !== fileId));
    }
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
      // Grade each answer sheet against the first marking sheet
      const markingSheet = markingSheets.find(f => f.status === 'success');
      if (!markingSheet || !markingSheet.pdfId) {
        throw new Error('No valid marking sheet found');
      }

      const results = [];
      for (const answerSheet of answerSheets.filter(f => f.status === 'success')) {
        if (!answerSheet.pdfId) continue;

        try {
          const result = await api.gradeAnswers(markingSheet.pdfId, answerSheet.pdfId);
          results.push(result);
          
          toast({
            title: "Grading completed",
            description: `Student ${result.student_id || 'Unknown'} scored ${result.total_score} points`,
          });
        } catch (error) {
          console.error('Error grading answers:', error);
          toast({
            title: "Grading failed",
            description: `Failed to grade ${answerSheet.file.name}`,
            variant: "destructive",
          });
        }
      }

      // Store grading results and show them
      setGradingResults(results);
      setShowResults(true);

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
      {showResults && gradingResults.length > 0 && (
        <div>
          <GradingResults 
            results={gradingResults} 
            onClose={() => setShowResults(false)}
          />
        </div>
      )}

      {/* Marking Sheets Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Icon.Document className="mr-2 h-5 w-5" />
          Marking Sheets
        </h3>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="marking-upload" className="text-sm font-medium">
                Upload marking scheme PDF
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload the marking scheme with questions, answers, and marks
              </p>
              <Input
                id="marking-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect('marking')}
                className="cursor-pointer"
              />
            </div>

            {markingSheets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Marking Sheets</h4>
                {markingSheets.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon.Document className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{file.file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile('marking', file.id)}
                        className="p-1"
                      >
                        <Icon.X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Answer Sheets Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Icon.Upload className="mr-2 h-5 w-5" />
          Answer Sheets
        </h3>
        <Card className="p-6">
          <div className="space-y-4">
            {/* Student and Subject ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-id">Student ID (Optional)</Label>
                <Input
                  id="student-id"
                  type="number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <Label htmlFor="subject-id">Subject ID (Optional)</Label>
                <Input
                  id="subject-id"
                  type="number"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  placeholder="Enter subject ID"
                />
              </div>
            </div>

            {/* OCR Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="use-ocr"
                checked={useOcr}
                onCheckedChange={setUseOcr}
              />
              <Label htmlFor="use-ocr">Use OCR for handwritten answers</Label>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="answersheet-upload" className="text-sm font-medium">
                Upload answer sheets
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Upload student answer sheets (PDF or images)
              </p>
              <Input
                id="answersheet-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileSelect('answersheet')}
                className="cursor-pointer"
              />
            </div>

            {answerSheets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Answer Sheets</h4>
                {answerSheets.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon.Document className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{file.file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                          {file.studentId && ` • Student: ${file.studentId}`}
                          {file.subjectId && ` • Subject: ${file.subjectId}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile('answersheet', file.id)}
                        className="p-1"
                      >
                        <Icon.X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Grade Button */}
      <div className="flex justify-center space-x-4">
        {gradingResults.length > 0 && !showResults && (
          <Button
            onClick={() => setShowResults(true)}
            variant="outline"
            className="px-6 py-3 text-lg font-semibold rounded-xl"
          >
            <Icon.Eye className="mr-2 h-4 w-4" />
            View Results
          </Button>
        )}
        
        <Button
          onClick={handleGradeAnswers}
          disabled={markingSheets.length === 0 || answerSheets.length === 0 || isUploading}
          className="bg-gradient-primary text-white px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {isUploading ? (
            <>
              <div className="animate-pulse-subtle mr-2 h-4 w-4 rounded-full bg-current" />
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
  );
};

export default NewUploadForm;
