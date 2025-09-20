import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NewUploadForm from '@/components/upload/NewUploadForm';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleUploadComplete = (markingSheets: any[], answerSheets: any[]) => {
    setIsCompleted(true);
    toast({
      title: "Upload and grading completed",
      description: `Processed ${markingSheets.length} marking sheets and ${answerSheets.length} answer sheets`,
    });
  };

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
              <span className="text-sm text-muted-foreground hidden md:block">Upload Files</span>
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
            <div>
              <h2 className="text-3xl font-bold mb-6">Upload Files</h2>
              <p className="text-muted-foreground mb-8">
                Upload marking sheets and answer sheets to get started with AI-powered grading.
              </p>
            </div>

            {isCompleted ? (
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  <Icon.Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Upload and Grading Completed!</h3>
                  <p className="text-green-700 mb-4">
                    Your files have been successfully processed and graded.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => setIsCompleted(false)} variant="outline">
                      Upload More Files
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <NewUploadForm onUploadComplete={handleUploadComplete} />
            )}
          </div>
        </motion.div>
      </main>

      {/* Action Bar - Only show if not completed */}
      {!isCompleted && (
        <div className="sticky bottom-0 bg-white border-t border-border p-4">
          <div className="container mx-auto">
            <div className="flex justify-center">
              <Link to="/">
                <Button variant="outline" className="btn-tertiary">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;