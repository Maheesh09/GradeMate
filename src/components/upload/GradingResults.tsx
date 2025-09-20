import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface GradingResult {
  student_id?: number;
  total_score: number;
  question_scores: Record<string, number>;
  feedback: string[];
  status: string;
}

interface GradingResultsProps {
  results: GradingResult[];
  onClose?: () => void;
}

const GradingResults = ({ results, onClose }: GradingResultsProps) => {
  const getScoreColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeVariant = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    if (percentage >= 40) return 'outline';
    return 'destructive';
  };

  const calculateTotalPossibleScore = (results: GradingResult[]) => {
    if (results.length === 0) return 10;
    
    // Calculate total possible score based on the number of questions
    // Assuming each question has a maximum of 3 marks (i, ii, iii parts)
    const maxQuestions = Math.max(...results.map(r => Object.keys(r.question_scores).length));
    return maxQuestions * 3; // 3 marks per question (i, ii, iii)
  };

  const totalPossibleScore = calculateTotalPossibleScore(results);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          <Icon.CheckCircle className="mr-2 h-6 w-6 text-green-600" />
          Grading Results
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon.X className="h-5 w-5" />
          </button>
        )}
      </div>

      {results.map((result, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">
                    {result.student_id ? `Student ${result.student_id}` : 'Student Answer'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {result.status}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {result.total_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    out of {totalPossibleScore} points
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Score</span>
                  <span>{((result.total_score / totalPossibleScore) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(result.total_score / totalPossibleScore) * 100} 
                  className="h-2"
                />
              </div>

              {/* Question Scores */}
              {Object.keys(result.question_scores).length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-muted-foreground">Question Breakdown</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(result.question_scores).map(([question, score]) => (
                      <div
                        key={question}
                        className={`p-3 rounded-lg border text-center ${getScoreColor(score, totalPossibleScore)}`}
                      >
                        <div className="text-sm font-medium">Q{question}</div>
                        <div className="text-lg font-bold">{score.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {result.feedback && result.feedback.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-muted-foreground">Detailed Feedback</h5>
                  <div className="space-y-2">
                    {result.feedback.map((feedback, feedbackIndex) => (
                      <div
                        key={feedbackIndex}
                        className="p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        {feedback}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-end">
                <Badge 
                  variant={getScoreBadgeVariant(result.total_score, totalPossibleScore)}
                  className="px-3 py-1"
                >
                  {result.status === 'completed' ? 'Graded' : result.status}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Summary */}
      {results.length > 1 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Grading Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{results.length}</div>
              <div className="text-sm text-blue-700">Students Graded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {(results.reduce((sum, r) => sum + r.total_score, 0) / results.length).toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {((results.reduce((sum, r) => sum + r.total_score, 0) / results.length / totalPossibleScore) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700">Average Percentage</div>
            </div>
          </div>
        </Card>
      )}

      {/* View All Results Button */}
      <div className="flex justify-center pt-4">
        <Link to="/results">
          <Button className="bg-gradient-primary text-white px-6 py-3">
            <Icon.Eye className="mr-2 h-4 w-4" />
            View All Results
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GradingResults;
