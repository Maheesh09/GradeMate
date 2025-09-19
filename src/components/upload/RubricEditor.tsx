import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Rubric, RubricQuestion } from '@/types';

interface RubricEditorProps {
  rubric: Rubric;
  onChange: (rubric: Rubric) => void;
}

const RubricEditor = ({ rubric, onChange }: RubricEditorProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<RubricQuestion | null>(null);

  const updateRubric = (updates: Partial<Rubric>) => {
    onChange({ ...rubric, ...updates });
  };

  const addQuestion = () => {
    const newQuestion: RubricQuestion = {
      id: `q${rubric.questions.length + 1}`,
      title: `Question ${rubric.questions.length + 1}`,
      maxScore: 5,
      weight: 1,
    };
    
    updateRubric({
      questions: [...rubric.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<RubricQuestion>) => {
    const updatedQuestions = rubric.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    updateRubric({ questions: updatedQuestions });
  };

  const removeQuestion = (questionId: string) => {
    const filteredQuestions = rubric.questions.filter(q => q.id !== questionId);
    updateRubric({ questions: filteredQuestions });
  };

  const addPartialCreditRule = (questionId: string) => {
    const question = rubric.questions.find(q => q.id === questionId);
    if (!question) return;

    const newRule = {
      match: 'keyword or pattern',
      score: Math.floor(question.maxScore / 2),
    };

    updateQuestion(questionId, {
      partialCreditRules: [...(question.partialCreditRules || []), newRule],
    });
  };

  const updatePartialCreditRule = (questionId: string, ruleIndex: number, updates: any) => {
    const question = rubric.questions.find(q => q.id === questionId);
    if (!question?.partialCreditRules) return;

    const updatedRules = question.partialCreditRules.map((rule, index) =>
      index === ruleIndex ? { ...rule, ...updates } : rule
    );

    updateQuestion(questionId, { partialCreditRules: updatedRules });
  };

  const removePartialCreditRule = (questionId: string, ruleIndex: number) => {
    const question = rubric.questions.find(q => q.id === questionId);
    if (!question?.partialCreditRules) return;

    const filteredRules = question.partialCreditRules.filter((_, index) => index !== ruleIndex);
    updateQuestion(questionId, { partialCreditRules: filteredRules });
  };

  const totalPoints = rubric.questions.reduce((sum, q) => sum + q.maxScore, 0);
  const weightedTotal = rubric.questions.reduce((sum, q) => sum + (q.maxScore * q.weight), 0);

  return (
    <div className="space-y-6">
      {/* Rubric Header */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="rubric-name" className="text-sm font-medium">
            Rubric Name
          </Label>
          <Input
            id="rubric-name"
            value={rubric.name}
            onChange={(e) => updateRubric({ name: e.target.value })}
            className="mt-1"
            placeholder="Enter rubric name..."
          />
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div>
            <span className="font-medium">{rubric.questions.length}</span> questions
          </div>
          <div>
            <span className="font-medium">{totalPoints}</span> total points
          </div>
          <div>
            <span className="font-medium">{weightedTotal.toFixed(1)}</span> weighted total
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Questions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addQuestion}
              className="btn-tertiary"
            >
              <Icon.Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {rubric.questions.length === 0 ? (
            <Card className="p-6 text-center">
              <Icon.Document className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium mb-2">No questions added</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add questions to define your grading rubric
              </p>
              <Button onClick={addQuestion} className="btn-secondary">
                Add First Question
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {rubric.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className={`
                    p-4 cursor-pointer transition-all
                    ${selectedQuestion?.id === question.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}
                  `}>
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1"
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{question.title}</h4>
                          <Badge variant="outline">{question.maxScore} pts</Badge>
                          {question.weight !== 1 && (
                            <Badge variant="outline">×{question.weight}</Badge>
                          )}
                        </div>
                        
                        {question.partialCreditRules && question.partialCreditRules.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {question.partialCreditRules.length} partial credit rules
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="btn-tertiary text-destructive hover:text-destructive ml-2"
                      >
                        <Icon.X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Question Editor */}
        <div className="space-y-4">
          <h3 className="font-semibold">
            {selectedQuestion ? 'Edit Question' : 'Select a question to edit'}
          </h3>

          {selectedQuestion ? (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question-title" className="text-sm font-medium">
                      Question Title
                    </Label>
                    <Input
                      id="question-title"
                      value={selectedQuestion.title}
                      onChange={(e) => updateQuestion(selectedQuestion.id, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-score" className="text-sm font-medium">
                        Max Score
                      </Label>
                      <Input
                        id="max-score"
                        type="number"
                        min="1"
                        value={selectedQuestion.maxScore}
                        onChange={(e) => updateQuestion(selectedQuestion.id, { 
                          maxScore: parseInt(e.target.value) || 1 
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-sm font-medium">
                        Weight
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={selectedQuestion.weight}
                        onChange={(e) => updateQuestion(selectedQuestion.id, { 
                          weight: parseFloat(e.target.value) || 1 
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Partial Credit Rules */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Partial Credit Rules</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPartialCreditRule(selectedQuestion.id)}
                    className="btn-tertiary"
                  >
                    <Icon.Plus className="mr-1 h-3 w-3" />
                    Add Rule
                  </Button>
                </div>

                {!selectedQuestion.partialCreditRules || selectedQuestion.partialCreditRules.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No partial credit rules defined
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuestion.partialCreditRules.map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="flex items-center space-x-2">
                        <Input
                          placeholder="Keyword or pattern"
                          value={rule.match}
                          onChange={(e) => updatePartialCreditRule(
                            selectedQuestion.id, 
                            ruleIndex, 
                            { match: e.target.value }
                          )}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Score"
                          value={rule.score}
                          onChange={(e) => updatePartialCreditRule(
                            selectedQuestion.id, 
                            ruleIndex, 
                            { score: parseInt(e.target.value) || 0 }
                          )}
                          className="w-20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePartialCreditRule(selectedQuestion.id, ruleIndex)}
                          className="btn-tertiary text-destructive hover:text-destructive"
                        >
                          <Icon.X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <div>💡 Tips for partial credit rules:</div>
                  <div>• Use keywords like "correct formula" or "partial solution"</div>
                  <div>• Set appropriate point values for different levels of completion</div>
                  <div>• Rules are matched against student answers during AI grading</div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Icon.Edit className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium mb-2">No question selected</h4>
              <p className="text-sm text-muted-foreground">
                Click on a question from the list to edit its details
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Rubric Preview */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-medium mb-3">Rubric Summary</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">{rubric.name}</div>
            <div className="space-y-1 text-muted-foreground">
              <div>{rubric.questions.length} questions</div>
              <div>{totalPoints} total points</div>
              <div>{weightedTotal.toFixed(1)} weighted total</div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Questions Overview</div>
            <div className="space-y-1 text-muted-foreground">
              {rubric.questions.map(q => (
                <div key={q.id}>
                  {q.title}: {q.maxScore} pts {q.weight !== 1 && `(×${q.weight})`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RubricEditor;