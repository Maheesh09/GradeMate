import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface ManualAnswerInputProps {
  answerSheetId: number;
  fileName: string;
  onAnswersSubmitted: (answers: Record<string, Record<string, string>>) => void;
  onClose: () => void;
}

const ManualAnswerInput = ({ 
  answerSheetId, 
  fileName, 
  onAnswersSubmitted, 
  onClose 
}: ManualAnswerInputProps) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const questionNum = Object.keys(answers).length + 1;
    setAnswers(prev => ({
      ...prev,
      [questionNum.toString()]: { "i": "" }
    }));
  };

  const addSubQuestion = (questionNum: string) => {
    const subQuestions = Object.keys(answers[questionNum] || {});
    const nextRoman = getNextRoman(subQuestions);
    setAnswers(prev => ({
      ...prev,
      [questionNum]: {
        ...prev[questionNum],
        [nextRoman]: ""
      }
    }));
  };

  const getNextRoman = (existing: string[]): string => {
    const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
    for (const roman of romans) {
      if (!existing.includes(roman)) {
        return roman;
      }
    }
    return 'xi'; // fallback
  };

  const updateAnswer = (questionNum: string, subQuestion: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: {
        ...prev[questionNum],
        [subQuestion]: value
      }
    }));
  };

  const removeSubQuestion = (questionNum: string, subQuestion: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionNum][subQuestion];
      if (Object.keys(newAnswers[questionNum]).length === 0) {
        delete newAnswers[questionNum];
      }
      return newAnswers;
    });
  };

  const removeQuestion = (questionNum: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionNum];
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      toast({
        title: "No answers provided",
        description: "Please add at least one question with answers",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the answer sheet in the database
      await api.updateAnswerSheetAnswers(answerSheetId, answers);
      
      // Pass the answers back to the parent
      onAnswersSubmitted(answers);
      
      toast({
        title: "Answers submitted",
        description: "Student answers have been manually entered and are ready for grading",
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit manual answers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Manual Answer Input</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter student answers for: {fileName}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <Icon.X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {Object.entries(answers).map(([questionNum, subAnswers]) => (
              <Card key={questionNum} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Question {questionNum}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(questionNum)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon.X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(subAnswers).map(([subQuestion, answer]) => (
                    <div key={subQuestion} className="flex items-center space-x-3">
                      <Label className="w-8 text-sm font-medium">
                        {subQuestion})
                      </Label>
                      <Textarea
                        value={answer}
                        onChange={(e) => updateAnswer(questionNum, subQuestion, e.target.value)}
                        placeholder="Enter student's answer..."
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSubQuestion(questionNum, subQuestion)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon.X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSubQuestion(questionNum)}
                    className="w-full"
                  >
                    <Icon.Plus className="h-4 w-4 mr-2" />
                    Add Sub-question
                  </Button>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={addQuestion}
              className="w-full"
            >
              <Icon.Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="bg-gradient-primary text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-pulse-subtle mr-2 h-4 w-4 rounded-full bg-current" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon.Check className="mr-2 h-4 w-4" />
                  Submit Answers
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ManualAnswerInput;
