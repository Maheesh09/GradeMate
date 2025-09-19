import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import ResultsTable from '@/components/reports/ResultsTable';
import { Job, Submission } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || '');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadSubmissions(selectedJobId);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const jobsData = await mockApi.getJobs();
      const completedJobs = jobsData.filter(job => job.status === 'completed');
      setJobs(completedJobs);
      
      if (!selectedJobId && completedJobs.length > 0) {
        setSelectedJobId(completedJobs[0].id);
      }
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

  const loadSubmissions = async (jobId: string) => {
    try {
      const submissionsData = await mockApi.getSubmissions(jobId);
      setSubmissions(submissionsData);
    } catch (error) {
      toast({
        title: "Failed to load submissions",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!selectedJobId) return;

    try {
      const exportUrl = await mockApi.exportResults(selectedJobId, format);
      
      toast({
        title: "Export started",
        description: `${format.toUpperCase()} file will download shortly`,
      });
      
      // In a real app, this would trigger actual download
      console.log('Export URL:', exportUrl);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Filter submissions based on current filters
  const filteredSubmissions = submissions.filter(submission => {
    const score = submission.totalScore || 0;
    const confidence = submission.avgConfidence * 100;
    
    const scoreInRange = score >= scoreRange[0] && score <= scoreRange[1];
    const confidenceAboveThreshold = confidence >= confidenceThreshold[0];
    const flaggedFilter = !flaggedOnly || submission.status === 'flagged';
    
    return scoreInRange && confidenceAboveThreshold && flaggedFilter;
  });

  // Calculate statistics
  const stats = {
    totalSubmissions: submissions.length,
    averageScore: submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / submissions.length 
      : 0,
    averageConfidence: submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.avgConfidence, 0) / submissions.length * 100
      : 0,
    flaggedCount: submissions.filter(s => s.status === 'flagged').length,
    reviewedCount: submissions.filter(s => s.status === 'reviewed').length,
  };

  // Score distribution for histogram
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
    const rangeStart = i * 10;
    const rangeEnd = (i + 1) * 10;
    const count = submissions.filter(s => {
      const score = s.totalScore || 0;
      return score >= rangeStart && score < rangeEnd;
    }).length;
    return { range: `${rangeStart}-${rangeEnd}`, count };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-subtle w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
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
            <Link to="/jobs" className="flex items-center space-x-2">
              <Icon.ChevronLeft className="h-5 w-5" />
              <div className="bg-white rounded-full shadow-sm">
                <img src="/logo.png" alt="GradeMate Logo" className="h-16 w-16" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Reports & Export</h1>
                <p className="text-sm text-muted-foreground">Analyze grading results and export data</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Icon.Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No completed jobs</h3>
            <p className="text-muted-foreground mb-6">
              Complete some grading jobs to view reports
            </p>
            <Link to="/upload">
              <Button className="btn-hero">
                <Icon.Upload className="mr-2 h-4 w-4" />
                Start Grading
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Job Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select Job</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {jobs.map(job => (
                  <Card
                    key={job.id}
                    className={`
                      p-4 cursor-pointer transition-all
                      ${selectedJobId === job.id ? 'ring-2 ring-primary bg-gray-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="font-medium mb-1">{job.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {job.submissionCount} submissions • {job.flaggedCount} flagged
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {selectedJobId && (
              <>
                {/* Statistics Overview */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                    <div className="text-sm text-muted-foreground">Total Submissions</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{stats.averageConfidence.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{stats.flaggedCount}</div>
                    <div className="text-sm text-muted-foreground">Flagged for Review</div>
                  </Card>
                </div>

                {/* Score Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                  <div className="flex items-end space-x-2 h-32">
                    {scoreDistribution.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-gray-700 w-full rounded-t"
                          style={{ 
                            height: `${Math.max(item.count / Math.max(...scoreDistribution.map(d => d.count)) * 100, 5)}%` 
                          }}
                          title={`${item.range}: ${item.count} submissions`}
                        />
                        <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-left">
                          {item.range}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Filters */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Score Range: {scoreRange[0]} - {scoreRange[1]}
                      </label>
                      <Slider
                        value={scoreRange}
                        onValueChange={setScoreRange}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Min Confidence: {confidenceThreshold[0]}%
                      </label>
                      <Slider
                        value={confidenceThreshold}
                        onValueChange={setConfidenceThreshold}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={flaggedOnly}
                        onCheckedChange={setFlaggedOnly}
                      />
                      <label className="text-sm font-medium">Flagged only</label>
                    </div>
                  </div>
                </Card>

                {/* Results Table */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Results ({filteredSubmissions.length} of {submissions.length})
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleExport('csv')}
                        className="btn-secondary"
                      >
                        <Icon.Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExport('excel')}
                        className="btn-secondary"
                      >
                        <Icon.Download className="mr-2 h-4 w-4" />
                        Export Excel
                      </Button>
                    </div>
                  </div>
                  
                  <ResultsTable submissions={filteredSubmissions} />
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;