import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Search, Eye, Download, Calendar, FileText, Award, 
  MessageSquare, Lightbulb, TrendingUp, Users, BookOpen, 
  Star, CheckCircle, AlertCircle, Clock, Target, Zap,
  ArrowRight, ChevronDown, ChevronUp, ExternalLink, Copy
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface GradingResult {
  id: number;
  student_id: string;
  marking_scheme_id: number;
  answer_sheet_id: number;
  total_score: number;
  total_max_score: number;
  percentage: number;
  feedback: string;
  recommendations: string;
  created_at: string;
  marking_scheme_name: string;
  answer_sheet_filename: string;
}

interface GradingResultDetail extends GradingResult {
  detailed_results: any;
}

const StudentView: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState<GradingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<GradingResultDetail | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { toast } = useToast();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('studentSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (id: string) => {
    if (!searchHistory.includes(id)) {
      const newHistory = [id, ...searchHistory.slice(0, 4)]; // Keep last 5 searches
      setSearchHistory(newHistory);
      localStorage.setItem('studentSearchHistory', JSON.stringify(newHistory));
    }
  };

  const handleSearch = async () => {
    if (!studentId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedResult(null);
    setShowDetails(false);
    setIsFirstVisit(false);

    try {
      const studentResults = await api.getStudentResults(studentId.trim());
      setResults(studentResults);
      
      if (studentResults.length === 0) {
        setError("No results found for this student ID. Please check your student ID and try again.");
      } else {
        saveToHistory(studentId.trim());
        toast({
          title: "Success",
          description: `Found ${studentResults.length} result(s) for student ${studentId}`,
        });
      }
    } catch (err: any) {
      console.error('Error fetching student results:', err);
      setError(err.message || "Failed to fetch student results. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch student results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (resultId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedCards(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Student ID copied to clipboard",
    });
  };

  const handleViewDetails = async (result: GradingResult) => {
    setLoading(true);
    try {
      const detail = await api.getStudentResultDetail(studentId, result.id);
      setSelectedResult(detail);
      setShowDetails(true);
    } catch (err: any) {
      console.error('Error fetching result details:', err);
      toast({
        title: "Error",
        description: "Failed to fetch result details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 70) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (percentage >= 50) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return "Outstanding";
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Very Good";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Satisfactory";
    return "Needs Improvement";
  };

  const getGradeIcon = (percentage: number) => {
    if (percentage >= 80) return <Star className="h-4 w-4" />;
    if (percentage >= 60) return <CheckCircle className="h-4 w-4" />;
    if (percentage >= 40) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Theme Toggle */}
      <header className="relative z-20 border-b border-white/20 dark:border-gray-700/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 dark:bg-white dark:rounded-full">
                <img src="/logo.png" alt="GradeMate Logo" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GradeMate
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Student Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 dark:bg-white dark:rounded-full p-4">
            <img src="/logo.png" alt="GradeMate Logo" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Student Results Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Access your exam results, detailed feedback, and personalized recommendations in one place
          </p>
          
          {/* Quick Stats */}
          {results.length > 0 && (
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{results.length} Result{results.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {results.length > 0 ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1) : 0}% Average
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Welcome Screen for First-Time Users */}
        {isFirstVisit && results.length === 0 && !loading && !error && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome to GradeMate Student Portal</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                    Get instant access to your exam results, detailed feedback, and personalized recommendations. 
                    Simply enter your student ID below to get started.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                        <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Quick Search</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Enter your student ID to find your results instantly</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                        <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Detailed Feedback</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Get comprehensive feedback on your performance</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
                        <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Smart Recommendations</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Receive personalized improvement suggestions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Search Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800 dark:text-gray-200">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Search className="h-6 w-6 text-white" />
                </div>
                Search Your Results
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Enter your student ID to access your exam results and feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="studentId" className="text-base font-medium text-gray-700 dark:text-gray-300">Student ID</Label>
                <div className="relative">
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="e.g., 3992101102"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-center text-lg h-12 border-2 focus:border-blue-500 transition-colors"
                  />
                  {studentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(studentId)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Searches</Label>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((id) => (
                      <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStudentId(id);
                          handleSearch();
                        }}
                        className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        {id}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSearch} 
                disabled={loading || !studentId.trim()}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Enhanced Results List */}
        {results.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Your Results
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {results.length} exam result{results.length !== 1 ? 's' : ''} found for student {studentId}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((result, index) => (
                <Card 
                  key={result.id} 
                  className="group hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {result.marking_scheme_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="truncate">{result.answer_sheet_filename}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`${getGradeColor(result.percentage)} text-sm font-medium px-3 py-1`}>
                        {result.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Enhanced Score Display */}
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {result.total_score}/{result.total_max_score}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Score</div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <Progress 
                          value={result.percentage} 
                          className="h-3 bg-gray-200"
                        />
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>0%</span>
                          <span className="font-medium">{result.percentage.toFixed(1)}%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <Badge variant="outline" className={`${getGradeColor(result.percentage)} text-sm font-medium px-4 py-2`}>
                        {getGradeIcon(result.percentage)}
                        <span className="ml-2">{getGradeText(result.percentage)}</span>
                      </Badge>
                    </div>

                    <Separator className="bg-gray-200 dark:bg-gray-600" />

                    {/* Enhanced Info Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">Exam Date</div>
                          <div>{new Date(result.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">Graded</div>
                          <div>{new Date(result.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleViewDetails(result)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Detailed Results
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCardExpansion(result.id)}
                        className="w-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        {expandedCards.has(result.id) ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Quick Preview
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Expanded Content */}
                    {expandedCards.has(result.id) && (
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700 dark:text-gray-300">Student ID</div>
                            <div className="text-gray-600 dark:text-gray-400 font-mono">{result.student_id}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700 dark:text-gray-300">Result ID</div>
                            <div className="text-gray-600 dark:text-gray-400 font-mono">#{result.id}</div>
                          </div>
                        </div>
                        
                        {result.feedback && result.feedback.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Quick Feedback
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                              {Array.isArray(result.feedback) 
                                ? result.feedback.slice(0, 2).join(' • ')
                                : result.feedback}
                              {Array.isArray(result.feedback) && result.feedback.length > 2 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Detailed Result View */}
        {showDetails && selectedResult && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Detailed Results
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {selectedResult.marking_scheme_name} • {selectedResult.answer_sheet_filename}
              </p>
            </div>

            {/* Enhanced Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-blue-200 dark:border-blue-700">
                <CardContent className="pt-6">
                  <div className="p-3 bg-blue-500 rounded-full w-fit mx-auto mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedResult.total_score}/{selectedResult.total_max_score}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Total Score</p>
                </CardContent>
              </Card>
              
              <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-200 dark:border-green-700">
                <CardContent className="pt-6">
                  <div className="p-3 bg-green-500 rounded-full w-fit mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {selectedResult.percentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Percentage</p>
                </CardContent>
              </Card>
              
              <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-200 dark:border-purple-700">
                <CardContent className="pt-6">
                  <div className="p-3 bg-purple-500 rounded-full w-fit mx-auto mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getGradeText(selectedResult.percentage)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Grade</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 border-orange-200 dark:border-orange-700">
                <CardContent className="pt-6">
                  <div className="p-3 bg-orange-500 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {new Date(selectedResult.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Exam Date</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Interface */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="feedback" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Question Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="feedback" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Detailed Feedback</h3>
                        <p className="text-gray-600 dark:text-gray-300">Comprehensive feedback on your exam performance</p>
                      </div>
                    </div>
                    
                    {selectedResult.feedback && selectedResult.feedback.length > 0 ? (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="space-y-4">
                          {Array.isArray(selectedResult.feedback) ? (
                            selectedResult.feedback.map((feedback, index) => (
                              <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="p-1 bg-blue-500 rounded-full mt-1">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {selectedResult.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No feedback available for this exam</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Improvement Recommendations</h3>
                        <p className="text-gray-600 dark:text-gray-300">Personalized suggestions to enhance your performance</p>
                      </div>
                    </div>
                    
                    {selectedResult.recommendations && selectedResult.recommendations.length > 0 ? (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                        <div className="space-y-4">
                          {Array.isArray(selectedResult.recommendations) ? (
                            selectedResult.recommendations.map((recommendation, index) => (
                              <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="p-1 bg-yellow-500 rounded-full mt-1">
                                  <Zap className="w-2 h-2 text-white" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{recommendation}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {selectedResult.recommendations}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No recommendations available for this exam</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">Question-wise Breakdown</h3>
                        <p className="text-gray-600">Detailed scoring for each question and sub-part</p>
                      </div>
                    </div>
                    
                    {selectedResult.detailed_results ? (
                      <div className="space-y-6">
                        {Object.entries(selectedResult.detailed_results).map(([question, details]: [string, any]) => (
                          <Card key={question} className="border border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-2 bg-green-500 rounded-lg">
                                  <span className="text-white font-bold">{question}</span>
                                </div>
                                Question {question}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {Object.entries(details).map(([part, partDetails]: [string, any]) => (
                                  <div key={part} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1 bg-gray-500 rounded">
                                        <span className="text-white text-xs font-medium">{part}</span>
                                      </div>
                                      <span className="text-gray-700 font-medium">{part}</span>
                                    </div>
                                    <Badge variant="outline" className="text-sm font-medium">
                                      {partDetails.score || 0}/{partDetails.max_score || 1}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No detailed results available for this exam</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Close Button */}
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowDetails(false)}
                className="px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to Results
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center items-center gap-4">
              <div className="p-2 dark:bg-white dark:rounded-full">
                <img src="/logo.png" alt="GradeMate Logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GradeMate
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Quick Access</h4>
                <p>Enter your student ID to view results</p>
                <p>Get instant feedback and recommendations</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Support</h4>
                <p>Need help? Contact your instructor</p>
                <p>Check your student ID format</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Features</h4>
                <p>Detailed question-wise breakdown</p>
                <p>Personalized improvement suggestions</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2024 GradeMate Student Portal. Secure and reliable exam result access.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentView;
