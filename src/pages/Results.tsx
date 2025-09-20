import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';
import GradingResults from '@/components/upload/GradingResults';

interface GradingResult {
  student_id?: number;
  total_score: number;
  question_scores: Record<string, number>;
  feedback: string[];
  status: string;
}

const Results = () => {
  const [results, setResults] = useState<GradingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.getGradingResults();
      
      // Convert backend format to frontend format
      const convertedResults = response.results.map(result => ({
        student_id: result.student_id,
        total_score: parseFloat(result.total_score), // Convert string to number
        question_scores: result.question_scores,
        feedback: result.feedback,
        status: result.status
      }));
      
      setResults(convertedResults);
      setError(null);
    } catch (err) {
      console.error('Error fetching grading results:', err);
      setError('Failed to load grading results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Add refresh functionality
  const handleRefresh = () => {
    fetchResults();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Icon.X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
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
                <img src="/logo.png" alt="GradeMate Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-2xl font-bold">GradeMate</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:block">Grading Results</span>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="hidden md:flex"
              >
                <Icon.RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Grading Results</h2>
              <p className="text-muted-foreground mb-8">
                View detailed grading results and feedback for all students.
              </p>
            </div>

            {results.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon.Document className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't graded any papers yet. Upload some files to get started.
                </p>
                <Link to="/upload">
                  <Button className="bg-gradient-primary text-white">
                    <Icon.Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </Link>
              </Card>
            ) : (
              <GradingResults results={results} />
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="px-6 py-3"
              >
                <Icon.RefreshCw className="mr-2 h-4 w-4" />
                Refresh Results
              </Button>
              <Link to="/upload">
                <Button variant="outline" className="px-6 py-3">
                  <Icon.Upload className="mr-2 h-4 w-4" />
                  Upload More Files
                </Button>
              </Link>
              <Button className="bg-gradient-primary text-white px-6 py-3">
                <Icon.Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Results;
