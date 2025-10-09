import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Users, BookOpen, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle, BarChart3, FileSpreadsheet } from 'lucide-react';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatDate } from '@/lib/dateUtils';

interface DashboardStats {
  total_students: number;
  total_exams: number;
  total_marking_schemes: number;
  average_class_score?: number;
  highest_class_score?: number;
  lowest_class_score?: number;
  students_above_80: number;
  students_above_60: number;
  students_below_40: number;
}

interface StudentSummary {
  student_id: string;
  total_exams: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  latest_exam_date?: string;
  latest_exam_name?: string;
}

interface StudentResult {
  id: number;
  student_id: string;
  marking_scheme_name: string;
  total_score: number;
  total_max_score: number;
  percentage: number;
  created_at: string;
  feedback?: string[];
  recommendations?: string[];
}

const TeacherView: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [studentsSummary, setStudentsSummary] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, students] = await Promise.all([
        api.getTeacherDashboardStats(),
        api.getAllStudentsSummary()
      ]);
      
      setDashboardStats(stats);
      setStudentsSummary(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentResults = async (studentId: string) => {
    try {
      setSelectedStudent(studentId);
      const results = await api.getTeacherStudentResults(studentId);
      setStudentResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student results');
    }
  };

  const handleExportAllResults = async () => {
    try {
      setExporting(true);
      const blob = await api.exportAllStudentResults();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all_student_results.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export results');
    } finally {
      setExporting(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-gray-600 dark:text-gray-400">Teacher Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="bg-white/50 dark:bg-gray-800/50"
              >
                Student Portal
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-8">
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard Stats */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.total_students}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.total_exams}</div>
                <p className="text-xs text-muted-foreground">Completed assessments</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.average_class_score ? `${dashboardStats.average_class_score.toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Class performance</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {dashboardStats.students_above_80}
                </div>
                <p className="text-xs text-muted-foreground">Students above 80%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Overview */}
        {dashboardStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>High Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {dashboardStats.students_above_80}
                </div>
                <p className="text-sm text-muted-foreground">Students scoring 80%+</p>
                <Progress 
                  value={(dashboardStats.students_above_80 / dashboardStats.total_students) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <span>Average Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {dashboardStats.students_above_60 - dashboardStats.students_above_80}
                </div>
                <p className="text-sm text-muted-foreground">Students scoring 60-79%</p>
                <Progress 
                  value={((dashboardStats.students_above_60 - dashboardStats.students_above_80) / dashboardStats.total_students) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Needs Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {dashboardStats.students_below_40}
                </div>
                <p className="text-sm text-muted-foreground">Students below 40%</p>
                <Progress 
                  value={(dashboardStats.students_below_40 / dashboardStats.total_students) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/50 dark:bg-gray-800/50">
              <TabsTrigger value="students">Student Overview</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>
            
            <Button
              onClick={handleExportAllResults}
              disabled={exporting}
              className="bg-primary hover:bg-primary/90"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Export All Results
            </Button>
          </div>

          <TabsContent value="students" className="space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle>Student Performance Overview</CardTitle>
                <CardDescription>
                  Click on a student to view their detailed results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentsSummary.map((student) => (
                    <Card 
                      key={student.student_id}
                      className="cursor-pointer hover:shadow-lg transition-shadow bg-white/50 dark:bg-gray-800/50"
                      onClick={() => loadStudentResults(student.student_id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{student.student_id}</CardTitle>
                          <Badge className={getPerformanceBadge(student.average_score)}>
                            {student.average_score.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Exams:</span>
                          <span>{student.total_exams}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Highest:</span>
                          <span className={getPerformanceColor(student.highest_score)}>
                            {student.highest_score.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Lowest:</span>
                          <span className={getPerformanceColor(student.lowest_score)}>
                            {student.lowest_score.toFixed(1)}%
                          </span>
                        </div>
                        {student.latest_exam_name && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              Latest: {student.latest_exam_name}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Results Detail */}
            {selectedStudent && studentResults.length > 0 && (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle>Results for {selectedStudent}</CardTitle>
                  <CardDescription>
                    Detailed performance breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.marking_scheme_name}
                          </TableCell>
                          <TableCell>
                            {result.total_score} / {result.total_max_score}
                          </TableCell>
                          <TableCell>
                            <span className={getPerformanceColor(result.percentage)}>
                              {result.percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDate(result.created_at, { timeZone: 'Asia/Colombo' })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPerformanceBadge(result.percentage)}>
                              {result.percentage >= 80 ? 'Excellent' : 
                               result.percentage >= 60 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle>Export Student Data</CardTitle>
                <CardDescription>
                  Download comprehensive reports of all student performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Complete Results Export</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all student results in Excel format with detailed feedback and recommendations
                    </p>
                  </div>
                  <Button
                    onClick={handleExportAllResults}
                    disabled={exporting}
                    className="ml-auto"
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherView;
