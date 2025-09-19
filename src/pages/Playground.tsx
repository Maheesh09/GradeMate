import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewCard from '@/components/review/ReviewCard';
import AIConfidenceBar from '@/components/ui/AIConfidenceBar';
import { mockSubmissions, sampleRubric } from '@/mocks/fixtures';
import { useToast } from '@/hooks/use-toast';

const Playground = () => {
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(mockSubmissions[0]);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [showFailedOCR, setShowFailedOCR] = useState(false);

  // Filter submissions based on demo controls
  const filteredSubmissions = mockSubmissions.filter(submission => {
    if (showLowConfidence && submission.avgConfidence > 0.7) return false;
    if (showFailedOCR && submission.pages.every(p => p.ocrConfidence > 0.8)) return false;
    return true;
  });

  const demoScenarios = [
    {
      title: "High Confidence Grading",
      description: "See how the system handles clear, well-written answers",
      confidence: 0.95,
      score: 10,
      rationale: "Clear solution with all steps shown correctly.",
    },
    {
      title: "Medium Confidence Review",
      description: "Partial credit scenarios requiring instructor judgment",
      confidence: 0.67,
      score: 6,
      rationale: "Shows understanding but missing some key steps.",
    },
    {
      title: "Low Confidence Flagging",
      description: "Unclear handwriting or incorrect answers flagged for review",
      confidence: 0.42,
      score: 2,
      rationale: "Handwriting unclear, answer appears incomplete.",
    },
  ];

  const componentExamples = [
    {
      name: "AI Confidence Bar",
      component: (
        <div className="space-y-4">
          <div>
            <div className="text-sm mb-2">High Confidence (95%)</div>
            <AIConfidenceBar value={0.95} />
          </div>
          <div>
            <div className="text-sm mb-2">Medium Confidence (67%)</div>
            <AIConfidenceBar value={0.67} />
          </div>
          <div>
            <div className="text-sm mb-2">Low Confidence (42%)</div>
            <AIConfidenceBar value={0.42} />
          </div>
        </div>
      ),
    },
    {
      name: "Status Badges",
      component: (
        <div className="flex flex-wrap gap-2">
          <Badge className="confidence-high">Auto-graded</Badge>
          <Badge className="confidence-medium">Needs Review</Badge>
          <Badge className="confidence-low">Flagged</Badge>
          <Badge variant="outline">Processing</Badge>
        </div>
      ),
    },
  ];

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
              <div>
                <h1 className="text-2xl font-bold">GradeMate Playground</h1>
                <p className="text-sm text-muted-foreground">Component demos and testing scenarios</p>
              </div>
            </Link>
            <Link to="/upload">
              <Button className="btn-hero">
                <Icon.Upload className="mr-2 h-4 w-4" />
                Try Live Upload
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="demo" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Demo Mode</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          </TabsList>

          {/* Demo Mode Tab */}
          <TabsContent value="demo" className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Interactive Demo</h2>
                  <p className="text-muted-foreground">
                    Explore pre-loaded grading jobs with realistic data
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={demoMode}
                    onCheckedChange={setDemoMode}
                  />
                  <label className="text-sm font-medium">Demo Mode</label>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Submission List */}
                <div>
                  <h3 className="font-semibold mb-4">Sample Submissions</h3>
                  <div className="space-y-3">
                    {filteredSubmissions.map(submission => (
                      <Card
                        key={submission.id}
                        className={`
                          p-4 cursor-pointer transition-all
                          ${selectedSubmission.id === submission.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}
                        `}
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Student {submission.studentId}</div>
                          <Badge 
                            className={
                              submission.status === 'flagged' ? 'confidence-low' :
                              submission.status === 'reviewed' ? 'confidence-high' :
                              'confidence-medium'
                            }
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {submission.totalScore} • 
                          Confidence: {Math.round(submission.avgConfidence * 100)}%
                        </div>
                        <AIConfidenceBar value={submission.avgConfidence} size="sm" />
                      </Card>
                    ))}
                  </div>

                  {/* Demo Controls */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Filter Examples</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={showLowConfidence}
                          onCheckedChange={setShowLowConfidence}
                        />
                        <label className="text-sm">Show only low confidence (&lt;70%)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={showFailedOCR}
                          onCheckedChange={setShowFailedOCR}
                        />
                        <label className="text-sm">Show failed OCR examples</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Interface Preview */}
                <div>
                  <h3 className="font-semibold mb-4">Review Interface</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <ReviewCard
                      submission={selectedSubmission}
                      onOverrideScore={(submissionId, questionId, score, comment) => {
                        toast({
                          title: "Demo Override",
                          description: `Score changed to ${score} for question ${questionId}`,
                        });
                      }}
                      onFlag={(submissionId) => {
                        toast({
                          title: "Demo Flag",
                          description: "Submission flagged for review",
                        });
                      }}
                      onRerunAI={(submissionId, questionId) => {
                        toast({
                          title: "Demo AI Re-run",
                          description: "AI processing simulation started",
                        });
                        return Promise.resolve({
                          score: Math.floor(Math.random() * 6),
                          confidence: Math.random(),
                          rationale: "Updated analysis after re-run",
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">UI Component Library</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {componentExamples.map((example, index) => (
                  <motion.div
                    key={example.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">{example.name}</h3>
                      {example.component}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Test Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Test Scenarios</h2>
              <div className="grid gap-6">
                {demoScenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{scenario.title}</h3>
                          <p className="text-muted-foreground">{scenario.description}</p>
                        </div>
                        <Badge 
                          className={
                            scenario.confidence > 0.8 ? 'confidence-high' :
                            scenario.confidence > 0.6 ? 'confidence-medium' :
                            'confidence-low'
                          }
                        >
                          {Math.round(scenario.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-1">AI Confidence Level</div>
                          <AIConfidenceBar value={scenario.confidence} />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">AI Score: {scenario.score}/10</div>
                          <div className="text-sm text-muted-foreground">{scenario.rationale}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/upload">
              <Button className="btn-secondary">
                <Icon.Upload className="mr-2 h-4 w-4" />
                Try Upload Wizard
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="btn-tertiary">
                <Icon.Eye className="mr-2 h-4 w-4" />
                View Jobs
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="btn-tertiary">
                <Icon.Download className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Playground;