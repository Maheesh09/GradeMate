// Mock data fixtures for GradeMate UI

import { Job, Submission, Rubric, FieldMapping } from '@/types';

// Sample students data
export const mockStudents = Array.from({ length: 10 }, (_, i) => ({
  id: `2025${String(i + 1).padStart(3, '0')}`,
  name: `Student ${i + 1}`,
}));

// Sample scanned page placeholders (grayscale)
export const samplePageImages = [
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 1</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 1: Answer Area</text></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 2</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 2: Answer Area</text></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 3</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 3: Answer Area</text></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 4</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 4: Answer Area</text></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 5</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 5: Answer Area</text></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="10%" text-anchor="middle" fill="%23000" font-size="24">Sample Exam Paper 6</text><rect x="50" y="100" width="500" height="50" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="125" font-size="14" fill="%23000">Student ID: ___________</text><rect x="50" y="200" width="500" height="400" fill="none" stroke="%23d4d4d4" stroke-width="2"/><text x="60" y="225" font-size="14" fill="%23000">Question 6: Answer Area</text></svg>',
];

// Sample rubric
export const sampleRubric: Rubric = {
  id: 'rubric-1',
  name: 'Math Exam - Chapter 5',
  questions: [
    {
      id: 'q1',
      title: 'Basic Algebra',
      maxScore: 2,
      weight: 1,
    },
    {
      id: 'q2',
      title: 'Quadratic Equations',
      maxScore: 4,
      weight: 1.2,
      partialCreditRules: [
        { match: 'correct formula', score: 2 },
        { match: 'partial solution', score: 1 },
      ],
    },
    {
      id: 'q3',
      title: 'Word Problems',
      maxScore: 6,
      weight: 1.5,
    },
    {
      id: 'q4',
      title: 'Graphing Functions',
      maxScore: 3,
      weight: 1,
      partialCreditRules: [
        { match: 'correct axes', score: 1 },
        { match: 'partial graph', score: 2 },
      ],
    },
    {
      id: 'q5',
      title: 'Complex Analysis',
      maxScore: 5,
      weight: 1.3,
    },
  ],
};

// Sample field mappings for auto-detection
export const sampleMappings: FieldMapping[] = [
  {
    id: 'student-id',
    label: 'Student ID',
    bbox: [50, 100, 200, 50],
    confidence: 0.95,
    ocrText: '2025001',
  },
  {
    id: 'question-1',
    label: 'Question 1 Answer',
    bbox: [50, 200, 500, 100],
    confidence: 0.88,
    ocrText: 'x = 5',
  },
  {
    id: 'question-2',
    label: 'Question 2 Answer',
    bbox: [50, 320, 500, 120],
    confidence: 0.72,
    ocrText: 'Using quadratic formula...',
  },
];

// Mock jobs with mixed confidence levels
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    name: 'Math Exam - Section A',
    status: 'completed',
    progress: 100,
    fileCount: 25,
    submissionCount: 25,
    flaggedCount: 3,
    rubricId: 'rubric-1',
    createdAt: '2025-01-15T09:30:00Z',
    completedAt: '2025-01-15T10:45:00Z',
  },
  {
    id: 'job-2',
    name: 'Physics Quiz - Chapter 2',
    status: 'processing',
    progress: 67,
    fileCount: 18,
    submissionCount: 12,
    flaggedCount: 1,
    rubricId: 'rubric-2',
    createdAt: '2025-01-15T11:00:00Z',
    estimatedTime: '8 minutes',
  },
  {
    id: 'job-3',
    name: 'Chemistry Lab Report',
    status: 'queued',
    progress: 0,
    fileCount: 30,
    submissionCount: 0,
    flaggedCount: 0,
    rubricId: 'rubric-3',
    createdAt: '2025-01-15T11:30:00Z',
    estimatedTime: '15 minutes',
  },
];

// Mock submissions with varied confidence levels
export const mockSubmissions: Submission[] = [
  {
    id: 'sub-1',
    studentId: '2025001',
    jobId: 'job-1',
    pages: [
      {
        id: 'page-1',
        imageUrl: samplePageImages[0],
        ocrText: 'Student ID: 2025001\nQuestion 1: x = 5\nQuestion 2: Using quadratic formula, x = 3 or x = -2',
        ocrConfidence: 0.92,
        answers: [
          {
            questionId: 'q1',
            text: 'x = 5',
            aiScore: 2,
            aiConfidence: 0.95,
            rationale: 'Correct solution with proper algebraic steps shown.',
          },
          {
            questionId: 'q2',
            text: 'Using quadratic formula, x = 3 or x = -2',
            aiScore: 4,
            aiConfidence: 0.88,
            rationale: 'Correct formula applied, both solutions identified.',
          },
        ],
      },
    ],
    status: 'auto',
    totalScore: 6,
    avgConfidence: 0.92,
    createdAt: '2025-01-15T09:35:00Z',
  },
  {
    id: 'sub-2',
    studentId: '2025002',
    jobId: 'job-1',
    pages: [
      {
        id: 'page-2',
        imageUrl: samplePageImages[1],
        ocrText: 'Student ID: 2025002\nQuestion 1: x = 4\nQuestion 2: x^2 + 5x + 6 = 0...',
        ocrConfidence: 0.75,
        answers: [
          {
            questionId: 'q1',
            text: 'x = 4',
            aiScore: 0,
            aiConfidence: 0.45,
            rationale: 'Incorrect solution. Expected x = 5.',
            flagged: true,
          },
          {
            questionId: 'q2',
            text: 'x^2 + 5x + 6 = 0, partial work shown',
            aiScore: 2,
            aiConfidence: 0.67,
            rationale: 'Shows understanding of quadratic formula but incomplete solution.',
          },
        ],
      },
    ],
    status: 'flagged',
    totalScore: 2,
    avgConfidence: 0.56,
    createdAt: '2025-01-15T09:37:00Z',
  },
  {
    id: 'sub-3',
    studentId: '2025003',
    jobId: 'job-1',
    pages: [
      {
        id: 'page-3',
        imageUrl: samplePageImages[2],
        ocrText: 'Student ID: 2025003\nQuestion 1: x = 5\nQuestion 2: Using formula...',
        ocrConfidence: 0.88,
        answers: [
          {
            questionId: 'q1',
            text: 'x = 5',
            aiScore: 2,
            aiConfidence: 0.91,
            rationale: 'Correct answer with clear work shown.',
          },
          {
            questionId: 'q2',
            text: 'Using formula, but work is unclear',
            aiScore: 1,
            aiConfidence: 0.52,
            rationale: 'Shows attempt but solution method is unclear.',
            flagged: true,
          },
        ],
      },
    ],
    status: 'flagged',
    totalScore: 3,
    avgConfidence: 0.72,
    createdAt: '2025-01-15T09:39:00Z',
  },
];

// Sample AI rationales for different confidence levels
export const sampleRationales = {
  high: [
    'Clear, correct solution with all steps shown properly.',
    'Demonstrates strong understanding of the concept.',
    'Answer matches expected solution exactly.',
  ],
  medium: [
    'Partial understanding shown, but some steps are missing.',
    'Correct approach but minor calculation error.',
    'Shows work but explanation could be clearer.',
  ],
  low: [
    'Unclear handwriting makes OCR difficult to interpret.',
    'Answer appears incorrect or incomplete.',
    'Method shown does not match expected approach.',
  ],
};