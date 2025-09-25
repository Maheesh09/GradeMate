// Type definitions for GradeMate UI

export interface FieldMapping {
  id: string;
  label: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
  ocrText?: string;
}

export interface RubricQuestion {
  id: string;
  title: string;
  maxScore: number;
  weight: number;
  partialCreditRules?: Array<{
    match: string; // text or regex
    score: number;
  }>;
}

export interface Rubric {
  id: string;
  name: string;
  questions: RubricQuestion[];
}

export interface StudentAnswer {
  questionId: string;
  text: string;
  aiScore: number;
  aiConfidence: number;
  rationale: string;
  manualScore?: number;
  comment?: string;
  flagged?: boolean;
}

export interface StudentPage {
  id: string;
  imageUrl: string;
  ocrText: string;
  ocrConfidence: number;
  answers: StudentAnswer[];
}

export interface Submission {
  id: string;
  studentId: string;
  jobId: string;
  pages: StudentPage[];
  status: 'auto' | 'reviewed' | 'flagged';
  totalScore?: number;
  avgConfidence: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface Job {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileCount: number;
  submissionCount: number;
  flaggedCount: number;
  rubricId: string;
  createdAt: string;
  completedAt?: string;
  estimatedTime?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  thumbnailUrl?: string;
  pageCount: number;
  mappings: FieldMapping[];
  status: 'pending' | 'mapped' | 'error';
  type: 'exam_paper' | 'marking_scheme';
}

export interface JobProgress {
  jobId: string;
  status: string;
  progress: number;
  currentFile?: string;
  currentPage?: number;
  totalPages?: number;
  message?: string;
}

export interface AssistantContext {
  type: 'submission' | 'rubric' | 'general';
  submissionId?: string;
  questionId?: string;
  rubricId?: string;
}

export interface AssistantSuggestion {
  id: string;
  type: 'feedback' | 'rubric_edit' | 'explanation';
  title: string;
  content: string;
  context: AssistantContext;
}

// Student View Types
export interface GradingResult {
  id: number;
  student_id: string;
  marking_scheme_id: number | null;
  answer_sheet_id: number;
  total_score: number;
  total_max_score: number;
  percentage: number;
  feedback: string[] | null;
  recommendations: string[] | null;
  created_at: string;
  marking_scheme_name: string;
  answer_sheet_filename: string;
}

export interface GradingResultDetail extends GradingResult {
  detailed_results: Record<string, any> | null;
}