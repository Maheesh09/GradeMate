// Real API client for GradeMate UI - connects to FastAPI backend

import { Job, Submission, Rubric, FieldMapping, JobProgress, AssistantSuggestion } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
  async uploadMarkingSheet(file: File): Promise<{
    filename: string;
    extracted_text: string;
    parsed_questions: Record<string, Record<string, any>>;
    question_count: number;
    status: string;
    pdf_id?: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadRequest('/upload/marking-sheet', formData);
  }

  async uploadAnswerSheet(
    file: File, 
    studentId?: number, 
    subjectId?: number, 
    useOcr: boolean = false
  ): Promise<{
    filename: string;
    extracted_text: string;
    parsed_questions: Record<string, Record<string, string>>;
    question_count: number;
    status: string;
    pdf_id?: number;
    student_id?: number;
    subject_id?: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (studentId !== undefined) {
      formData.append('student_id', studentId.toString());
    }
    if (subjectId !== undefined) {
      formData.append('subject_id', subjectId.toString());
    }
    formData.append('use_ocr', useOcr.toString());

    return this.uploadRequest('/upload/answer-sheet', formData);
  }

  async gradeAnswers(markingSheetId: number, answerSheetId: number): Promise<{
    student_id?: number;
    total_score: number;
    question_scores: Record<string, number>;
    feedback: string[];
    status: string;
  }> {
    const formData = new FormData();
    formData.append('marking_sheet_id', markingSheetId.toString());
    formData.append('answer_sheet_id', answerSheetId.toString());

    return this.uploadRequest('/upload/grade-answers', formData);
  }

  // Data management endpoints
  async getMarkingSheets(skip: number = 0, limit: number = 100): Promise<{
    markings: Array<{
      pdf_id: number;
      pdf_name: string;
      uploaded_at: string;
      questions: Array<{
        question_id: number;
        main_no: number;
        page_no?: number;
        answers: Array<{
          answer_id: number;
          roman_text: string;
          part_no: number;
          answer_text: string;
          marks: number;
        }>;
      }>;
    }>;
    total: number;
  }> {
    return this.request(`/data/marking-sheets?skip=${skip}&limit=${limit}`);
  }

  async getAnswerSheets(skip: number = 0, limit: number = 100): Promise<{
    answersheets: Array<{
      pdf_id: number;
      pdf_name: string;
      student_id?: number;
      subject_id?: number;
      uploaded_at: string;
      questions: Array<{
        question_id: number;
        main_no: number;
        question_text?: string;
        answers: Array<{
          answer_id: number;
          roman_text: string;
          part_no: number;
          answer_text: string;
        }>;
      }>;
    }>;
    total: number;
  }> {
    return this.request(`/data/answer-sheets?skip=${skip}&limit=${limit}`);
  }

  async getMarkingSheet(pdfId: number): Promise<{
    pdf_id: number;
    pdf_name: string;
    uploaded_at: string;
    questions: Array<{
      question_id: number;
      main_no: number;
      page_no?: number;
      answers: Array<{
        answer_id: number;
        roman_text: string;
        part_no: number;
        answer_text: string;
        marks: number;
      }>;
    }>;
  }> {
    return this.request(`/data/marking-sheets/${pdfId}`);
  }

  async getAnswerSheet(pdfId: number): Promise<{
    pdf_id: number;
    pdf_name: string;
    student_id?: number;
    subject_id?: number;
    uploaded_at: string;
    questions: Array<{
      question_id: number;
      main_no: number;
      question_text?: string;
      answers: Array<{
        answer_id: number;
        roman_text: string;
        part_no: number;
        answer_text: string;
      }>;
    }>;
  }> {
    return this.request(`/data/answer-sheets/${pdfId}`);
  }

  async deleteMarkingSheet(pdfId: number): Promise<{ message: string }> {
    return this.request(`/data/marking-sheets/${pdfId}`, {
      method: 'DELETE',
    });
  }

  async deleteAnswerSheet(pdfId: number): Promise<{ message: string }> {
    return this.request(`/data/answer-sheets/${pdfId}`, {
      method: 'DELETE',
    });
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
