import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AIConfidenceBar from '@/components/ui/AIConfidenceBar';
import { Submission } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ReviewCardProps {
  submission: Submission;
  onOverrideScore: (submissionId: string, questionId: string, score: number, comment?: string) => void;
  onFlag: (submissionId: string, questionId?: string) => void;
  onRerunAI: (submissionId: string, questionId: string) => Promise<{ score: number; confidence: number; rationale: string }>;
}

const ReviewCard = ({ submission, onOverrideScore, onFlag, onRerunAI }: ReviewCardProps) => {
  const { toast } = useToast();
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [editingScores, setEditingScores] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [rerunningAI, setRerunningAI] = useState<Set<string>>(new Set());

  const toggleAnswerExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedAnswers(newExpanded);
  };

  const handleScoreEdit = (questionId: string, value: string) => {
    setEditingScores(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCommentEdit = (questionId: string, value: string) => {
    setComments(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveOverride = (questionId: string, maxScore: number) => {
    const scoreValue = editingScores[questionId];
    const comment = comments[questionId];
    
    if (!scoreValue) return;
    
    const score = parseInt(scoreValue);
    if (isNaN(score) || score < 0 || score > maxScore) {
      toast({
        title: "Invalid score",
        description: `Score must be between 0 and ${maxScore}`,
        variant: "destructive",
      });
      return;
    }

    onOverrideScore(submission.id, questionId, score, comment);
    
    // Clear editing state
    setEditingScores(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
    setComments(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };

  const handleRerunAI = async (questionId: string) => {
    setRerunningAI(prev => new Set([...prev, questionId]));
    
    try {
      await onRerunAI(submission.id, questionId);
    } catch (error) {
      toast({
        title: "AI re-run failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setRerunningAI(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'reviewed':
        return <Badge className="confidence-high">Reviewed</Badge>;
      case 'flagged':
        return <Badge className="confidence-low">Flagged</Badge>;
      case 'auto':
        return <Badge className="confidence-medium">Auto-graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Submission Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Student {submission.studentId}</h3>
          {getStatusBadge(submission.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Total Score</div>
            <div className="text-xl font-bold">{submission.totalScore || 'Pending'}</div>
          </div>
          <div>
            <div className="font-medium">Avg Confidence</div>
            <div className="text-xl font-bold">{Math.round(submission.avgConfidence * 100)}%</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFlag(submission.id)}
            className="btn-tertiary"
          >
            <Icon.Flag className="mr-1 h-3 w-3" />
            Flag for Review
          </Button>
        </div>
      </div>

      {/* Answer Reviews */}
      <div className="space-y-4">
        <h4 className="font-medium">Question Responses</h4>
        
        {submission.pages.map(page => 
          page.answers.map((answer, answerIndex) => {
            const isExpanded = expandedAnswers.has(answer.questionId);
            const isEditing = editingScores.hasOwnProperty(answer.questionId);
            const isRerunning = rerunningAI.has(answer.questionId);
            const currentScore = answer.manualScore ?? answer.aiScore;
            
            return (
              <motion.div
                key={`${page.id}-${answer.questionId}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: answerIndex * 0.05 }}
              >
                <Card className="p-4">
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium">Question {answer.questionId.toUpperCase()}</h5>
                        {answer.flagged && (
                          <Badge className="confidence-low">Flagged</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAnswerExpansion(answer.questionId)}
                        className="btn-tertiary"
                      >
                        <Icon.ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>

                    {/* Score and Confidence */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Score</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">
                            {currentScore}
                            <span className="text-sm font-normal text-muted-foreground">/5</span>
                          </span>
                          {answer.manualScore !== undefined && (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">AI Confidence</div>
                        <AIConfidenceBar value={answer.aiConfidence} size="sm" />
                      </div>
                    </div>

                    {/* Student Answer Preview */}
                    <div>
                      <div className="text-sm font-medium mb-1">Student Answer</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        {answer.text.length > 100 && !isExpanded 
                          ? `${answer.text.substring(0, 100)}...`
                          : answer.text
                        }
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-3 border-t border-gray-200"
                      >
                        {/* AI Rationale */}
                        <div>
                          <div className="text-sm font-medium mb-1">AI Rationale</div>
                          <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            {answer.rationale}
                          </div>
                        </div>

                        {/* Manual Override Section */}
                        {isEditing ? (
                          <div className="space-y-3 p-3 bg-blue-50 rounded">
                            <div className="text-sm font-medium">Manual Override</div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="Score"
                                value={editingScores[answer.questionId] || ''}
                                onChange={(e) => handleScoreEdit(answer.questionId, e.target.value)}
                                className="text-sm"
                              />
                              <div className="text-xs text-muted-foreground flex items-center">
                                Max: 5 points
                              </div>
                            </div>
                            <Textarea
                              placeholder="Add comment (optional)"
                              value={comments[answer.questionId] || ''}
                              onChange={(e) => handleCommentEdit(answer.questionId, e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveOverride(answer.questionId, 5)}
                                className="btn-secondary"
                              >
                                <Icon.Check className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingScores(prev => {
                                    const newState = { ...prev };
                                    delete newState[answer.questionId];
                                    return newState;
                                  });
                                  setComments(prev => {
                                    const newState = { ...prev };
                                    delete newState[answer.questionId];
                                    return newState;
                                  });
                                }}
                                className="btn-tertiary"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingScores(prev => ({ ...prev, [answer.questionId]: currentScore.toString() }));
                                setComments(prev => ({ ...prev, [answer.questionId]: answer.comment || '' }));
                              }}
                              className="btn-tertiary"
                            >
                              <Icon.Edit className="mr-1 h-3 w-3" />
                              Override Score
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRerunAI(answer.questionId)}
                              disabled={isRerunning}
                              className="btn-tertiary"
                            >
                              {isRerunning ? (
                                <>
                                  <div className="animate-pulse-subtle mr-1 h-3 w-3 rounded-full bg-current" />
                                  Re-running...
                                </>
                              ) : (
                                <>
                                  <Icon.Play className="mr-1 h-3 w-3" />
                                  Re-run AI
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onFlag(submission.id, answer.questionId)}
                              className="btn-tertiary"
                            >
                              <Icon.Flag className="mr-1 h-3 w-3" />
                              Flag
                            </Button>
                          </div>
                        )}

                        {/* Manual Comment Display */}
                        {answer.comment && !isEditing && (
                          <div>
                            <div className="text-sm font-medium mb-1">Instructor Comment</div>
                            <div className="text-sm bg-blue-50 p-2 rounded">
                              {answer.comment}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <Card className="p-4 bg-gray-50">
        <h5 className="font-medium mb-2">Keyboard Shortcuts</h5>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><kbd className="px-1 bg-white rounded">N</kbd> Next submission</div>
          <div><kbd className="px-1 bg-white rounded">P</kbd> Previous submission</div>
          <div><kbd className="px-1 bg-white rounded">F</kbd> Flag submission</div>
          <div><kbd className="px-1 bg-white rounded">R</kbd> Re-run AI</div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewCard;