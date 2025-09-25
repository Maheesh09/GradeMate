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


      {/* Enhanced Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-12">
            {/* Enhanced Hero Section */}
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Icon.Upload className="h-10 w-10 text-white" />
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Upload & Grade
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Upload marking sheets and answer sheets to get started with our AI-powered grading system. 
                  Get instant, accurate results with detailed feedback.
                </motion.p>
              </div>

              {/* Feature Highlights */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div 
                  className="text-center space-y-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                    <Icon.Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI technology for accurate and consistent grading
                  </p>
                </motion.div>
                
                <motion.div 
                  className="text-center space-y-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl flex items-center justify-center">
                    <Icon.Clock className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get grading results in seconds, not hours
                  </p>
                </motion.div>
                
                <motion.div 
                  className="text-center space-y-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-success/10 to-accent/10 rounded-xl flex items-center justify-center">
                    <Icon.Shield className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is protected with enterprise-grade security
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Upload Form or Completion State */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-12 bg-gradient-to-br from-success/10 to-accent/10 border-success/20 shadow-lg">
                    <div className="text-center space-y-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center shadow-lg">
                          <Icon.Check className="h-12 w-12 text-white" />
                        </div>
                      </motion.div>
                      
                      <div className="space-y-3">
                        <motion.h3 
                          className="text-3xl font-bold bg-gradient-to-r from-success to-accent bg-clip-text text-transparent"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          Upload and Grading Completed!
                        </motion.h3>
                        <motion.p 
                          className="text-lg text-muted-foreground max-w-md mx-auto"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          Your files have been successfully processed and graded. Results are ready for review.
                        </motion.p>
                      </div>
                      
                      <motion.div 
                        className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button 
                          onClick={() => setIsCompleted(false)} 
                          variant="outline"
                          className="px-8 py-3 text-lg font-semibold rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                        >
                          <Icon.Upload className="mr-2 h-5 w-5" />
                          Upload More Files
                        </Button>
                        <Button 
                          onClick={() => navigate('/')}
                          className="btn-hero px-8 py-3 text-lg font-semibold rounded-xl"
                        >
                          <Icon.Home className="mr-2 h-5 w-5" />
                          Go to Dashboard
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <NewUploadForm onUploadComplete={handleUploadComplete} />
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Enhanced Action Bar - Only show if not completed */}
      {!isCompleted && (
        <motion.div 
          className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        >
          <div className="container mx-auto">
            <div className="flex justify-center">
              <Link to="/">
                <Button 
                  variant="outline" 
                  className="btn-tertiary px-6 py-3 text-base font-medium rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                >
                  <Icon.ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Upload;