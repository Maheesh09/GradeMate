import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import JobList from '@/components/jobs/JobList';
import { Job, JobProgress } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    loadJobs();
    
    // Subscribe to real-time progress updates
    const unsubscribe = mockApi.onJobProgress((progress: JobProgress) => {
      setJobs(prev => prev.map(job => 
        job.id === progress.jobId 
          ? { ...job, status: progress.status as any, progress: progress.progress }
          : job
      ));
    });

    return unsubscribe;
  }, []);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await mockApi.getJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: "Please refresh the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (jobId: string) => {
    try {
      const exportUrl = await mockApi.exportResults(jobId, 'csv');
      
      // Simulate file download
      toast({
        title: "Export started",
        description: "Your results will download shortly",
      });
      
      // In a real app, this would trigger an actual download
      console.log('Download URL:', exportUrl);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="confidence-high">Completed</Badge>;
      case 'processing':
        return <Badge className="confidence-medium">Processing</Badge>;
      case 'queued':
        return <Badge className="confidence-low">Queued</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-subtle w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
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
              <div className="bg-white rounded-full shadow-sm">
                <img src="/logo.png" alt="AutoGrader Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-2xl font-bold">AutoGrader</h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/upload" className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <Icon.Upload className="mr-2 h-4 w-4" />
                New Job
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Grading Jobs</h1>
            <p className="text-muted-foreground">
              Monitor your grading jobs and review results
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="px-3 py-1"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3 py-1"
              >
                Table
              </Button>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Icon.Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No grading jobs yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload exam papers to create your first grading job
            </p>
            <Link to="/upload">
              <Button className="btn-hero">
                <Icon.Upload className="mr-2 h-4 w-4" />
                Start Grading
              </Button>
            </Link>
          </motion.div>
        ) : viewMode === 'cards' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-primary">{job.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatTimeAgo(job.createdAt)}
                        </p>
                      </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {job.status === 'processing' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Processing...</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="w-full" />
                      {job.estimatedTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Est. {job.estimatedTime} remaining
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <div className="font-medium">{job.fileCount}</div>
                      <div className="text-muted-foreground">Files</div>
                    </div>
                    <div>
                      <div className="font-medium">{job.submissionCount}</div>
                      <div className="text-muted-foreground">Submissions</div>
                    </div>
                    <div>
                      <div className="font-medium text-warning">{job.flaggedCount}</div>
                      <div className="text-muted-foreground">Flagged</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/review/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full btn-secondary">
                        <Icon.Eye className="mr-2 h-4 w-4" />
                        View Results
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(job.id)}
                      disabled={job.status !== 'completed'}
                      className="btn-tertiary"
                    >
                      <Icon.Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <JobList 
              jobs={jobs}
              onView={(jobId) => window.location.href = `/review/${jobId}`}
              onExport={handleExport}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Jobs;