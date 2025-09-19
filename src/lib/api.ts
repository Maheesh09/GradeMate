// Real API client for GradeMate UI - connects to FastAPI backend

import { Job, Submission, Rubric, FieldMapping, JobProgress, AssistantSuggestion } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Adjust this to your backend URL

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private async uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // File upload and PDF extraction
  async uploadAnswerSheet(file: File): Promise<{
    filename: string;
    extracted_text: string;
    parsed_questions: Record<string, Record<string, string>>;
    status: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadRequest('/upload/answer-sheet', formData);
  }

  async uploadAnswerSheets(files: File[]): Promise<{
    results: Array<{
      filename: string;
      extracted_text?: string;
      parsed_questions?: Record<string, Record<string, string>>;
      status: string;
      error?: string;
    }>;
    total_files: number;
    successful: number;
    failed: number;
  }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.uploadRequest('/upload/answer-sheet-batch', formData);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/upload/health');
  }

  // Student management
  async createStudent(studentData: { student_id: string; name: string }) {
    return this.request('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async getStudents() {
    return this.request('/students/');
  }

  // Paper management
  async createPaper(paperData: {
    subject_name: string;
    paper_no: number;
    part?: string;
    is_results_released?: boolean;
    is_reasoning_visible?: boolean;
    layout_json?: any;
  }) {
    return this.request('/papers/', {
      method: 'POST',
      body: JSON.stringify(paperData),
    });
  }

  async getPapers() {
    return this.request('/papers/');
  }

  // Question management
  async createQuestion(questionData: {
    paper_id: number;
    qno: number;
    type: 'MCQ' | 'SHORT' | 'ESSAY';
    text: string;
    options?: any;
    answer_key?: string;
    max_marks?: number;
    rubric?: any;
  }) {
    return this.request('/questions/', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async getQuestions(paperId?: number) {
    const endpoint = paperId ? `/questions/?paper_id=${paperId}` : '/questions/';
    return this.request(endpoint);
  }

  // Scheme management
  async createScheme(schemeData: {
    paper_id: number;
    name: string;
    version: number;
    is_active?: boolean;
    notes?: string;
  }) {
    return this.request('/schemes/', {
      method: 'POST',
      body: JSON.stringify(schemeData),
    });
  }

  async getSchemes(paperId?: number) {
    const endpoint = paperId ? `/schemes/?paper_id=${paperId}` : '/schemes/';
    return this.request(endpoint);
  }

  // Submission management
  async createSubmission(submissionData: {
    paper_id: number;
    student_id: string;
    is_visible_to_student?: boolean;
  }) {
    return this.request('/submissions/', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmissions(paperId?: number, studentId?: string) {
    let endpoint = '/submissions/';
    const params = new URLSearchParams();
    if (paperId) params.append('paper_id', paperId.toString());
    if (studentId) params.append('student_id', studentId);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return this.request(endpoint);
  }

  // Answer management
  async createAnswer(answerData: {
    submission_id: number;
    question_id: number;
    scheme_question_id?: number;
    response_text?: string;
    chosen_option?: string;
    reasoning?: string;
    omr_json?: any;
    ocr_text?: string;
    ocr_conf?: number;
    flags?: any;
    image_crop_path?: string;
  }) {
    return this.request('/answers/', {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  async getAnswers(submissionId?: number, questionId?: number) {
    let endpoint = '/answers/';
    const params = new URLSearchParams();
    if (submissionId) params.append('submission_id', submissionId.toString());
    if (questionId) params.append('question_id', questionId.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return this.request(endpoint);
  }
}

// Export singleton instance
export const api = new ApiClient();
