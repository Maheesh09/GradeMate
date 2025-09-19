import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import ReviewCard from '@/components/review/ReviewCard';
import ImageViewer from '@/components/review/ImageViewer';
import { Job, Submission } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

const Review = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const loadJobData = async () => {
    if (!jobId) return;

    try {
      const [jobData, submissionsData] = await Promise.all([
        mockApi.getJob(jobId),
        mockApi.getSubmissions(jobId),
      ]);

      setJob(jobData);
      setSubmissions(submissionsData);
      
      if (submissionsData.length > 0) {
        setSelectedSubmission(submissionsData[0]);
      }
    } catch (error) {
      toast({
        title: "Failed to load job data",
        description: "Please refresh the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideScore = async (submissionId: string, questionId: string, score: number, comment?: string) => {
    try {
      await mockApi.updateSubmissionScore(submissionId, questionId, score, comment);
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? {
              ...sub,
              status: 'reviewed' as const,
              pages: sub.pages.map(page => ({
                ...page,
                answers: page.answers.map(answer => 
                  answer.questionId === questionId
                    ? { ...answer, manualScore: score, comment }
                    : answer
                ),
              })),
            }
          : sub
      ));

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? {
          ...prev,
          status: 'reviewed' as const,
          pages: prev.pages.map(page => ({
            ...page,
            answers: page.answers.map(answer => 
              answer.questionId === questionId
                ? { ...answer, manualScore: score, comment }
                : answer
            ),
          })),
        } : null);
      }

      toast({
        title: "Score updated",
        description: "Manual override applied successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update score",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleFlag = async (submissionId: string, questionId?: string) => {
    try {
      await mockApi.flagSubmission(submissionId, questionId);
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: 'flagged' as const }
          : sub
      ));

      toast({
        title: "Submission flagged",
        description: "Marked for additional review",
      });
    } catch (error) {
      toast({
        title: "Failed to flag submission",
        description: "Please try again",
        variant: "destructive",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-subtle w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review workspace...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon.AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Job not found</h3>
          <Link to="/">
            <Button className="btn-secondary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Icon.ChevronLeft className="h-5 w-5" />
              <div className="bg-white rounded-full shadow-sm">
                <img src="/logo.png" alt="GradeMate Logo" className="h-16 w-16" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{job.name}</h1>
                <p className="text-sm text-muted-foreground">Review Workspace</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground hidden md:block">
                {submissions.filter(s => s.status === 'reviewed').length} of {submissions.length} reviewed
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Submissions List */}
        <div className="w-80 border-r border-border bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Submissions ({submissions.length})</h3>
            <div className="space-y-2">
              {submissions.map(submission => (
                <motion.div
                  key={submission.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`
                      p-3 cursor-pointer transition-colors
                      ${selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : 'hover:bg-white'}
                    `}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setSelectedPage(0);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">ID: {submission.studentId}</div>
                      {getStatusBadge(submission.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score: {submission.totalScore || 'Pending'} • 
                      Confidence: {Math.round(submission.avgConfidence * 100)}%
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Image Viewer */}
        <div className="flex-1 bg-gray-100">
          {selectedSubmission && (
            <ImageViewer
              submission={selectedSubmission}
              selectedPage={selectedPage}
              onPageChange={setSelectedPage}
            />
          )}
        </div>

        {/* Grading Panel */}
        <div className="w-96 border-l border-border overflow-y-auto">
          {selectedSubmission && (
            <ReviewCard
              submission={selectedSubmission}
              onOverrideScore={handleOverrideScore}
              onFlag={handleFlag}
              onRerunAI={async (submissionId, questionId) => {
                try {
                  const result = await mockApi.rerunAI(submissionId, questionId);
                  toast({
                    title: "AI re-run completed",
                    description: `New score: ${result.score}, Confidence: ${Math.round(result.confidence * 100)}%`,
                  });
                  loadJobData(); // Refresh data
                  return result;
                } catch (error) {
                  toast({
                    title: "AI re-run failed",
                    description: "Please try again",
                    variant: "destructive",
                  });
                  throw error;
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;