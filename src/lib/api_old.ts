// Real API client for GradeMate UI - connects to FastAPI backend

import { Job, Submission, Rubric, FieldMapping, JobProgress, AssistantSuggestion, GradingResult, GradingResultDetail } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://your-railway-url.railway.app' : 'http://127.0.0.1:8000');

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
    success: boolean;
    message: string;
    data: {
      id: number;
      filename: string;
      status: string;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadRequest('/api/marking-schemes/upload', formData);
  }

  async uploadAnswerSheet(
    file: File, 
    studentId?: number, 
    subjectId?: number, 
    useOcr: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      filename: string;
      status: string;
    };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('use_ocr', useOcr.toString());

    return this.uploadRequest('/api/answer-sheets/upload', formData);
  }

  async gradeAnswers(markingSchemeId: number, answerSheetIds: number[]): Promise<{
    success: boolean;
    message: string;
    data: {
      marking_scheme_id: number;
      answer_sheet_count: number;
      status: string;
    };
  }> {
    return this.request('/api/grading/grade', {
      method: 'POST',
      body: JSON.stringify({
        marking_scheme_id: markingSchemeId,
        answer_sheet_ids: answerSheetIds
      })
    });
  }

  // Grading results endpoints
  async getGradingResults(): Promise<Array<{
    id: number;
    student_id?: string;
    total_score: number;
    total_max_marks: number;
    percentage: number;
    grading_status: string;
    created_at: string;
  }>> {
    return this.request('/api/grading/results');
  }

  async getGradingResult(resultId: number): Promise<{
    id: number;
    student_id?: string;
    total_score: number;
    total_max_marks: number;
    percentage: number;
    grading_status: string;
    question_scores?: Record<string, number>;
    feedback?: string[];
    recommendations?: string[];
    excel_file_path?: string;
    feedback_file_path?: string;
    recommendations_file_path?: string;
    created_at: string;
  }> {
    return this.request(`/api/grading/results/${resultId}`);
  }

  async downloadExcelResult(resultId: number): Promise<Blob> {
    const url = `${API_BASE_URL}/api/grading/results/${resultId}/excel`;
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }

  async getGradingResultsByStudent(studentId: number): Promise<{
    results: Array<{
      result_id: number;
      marking_sheet_id: number;
      answer_sheet_id: number;
      student_id?: number;
      total_score: number;
      question_scores: Record<string, number>;
      feedback: string[];
      status: string;
      created_at: string;
    }>;
    total: number;
  }> {
    return this.request(`/results/student/${studentId}`);
  }

  async deleteGradingResult(resultId: number): Promise<{ message: string }> {
    return this.request(`/results/${resultId}`, { method: 'DELETE' });
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
  async healthCheck(): Promise<{ success: boolean; message: string; data: any }> {
    return this.request('/health');
  }

  // Marking schemes
  async getMarkingSchemes(): Promise<Array<{
    id: number;
    filename: string;
    original_filename: string;
    question_count: number;
    total_marks: number;
    processing_status: string;
    created_at: string;
  }>> {
    return this.request('/api/marking-schemes');
  }

  async getMarkingScheme(schemeId: number): Promise<{
    id: number;
    filename: string;
    original_filename: string;
    question_count: number;
    total_marks: number;
    processing_status: string;
    extracted_data?: any;
    error_message?: string;
    created_at: string;
  }> {
    return this.request(`/api/marking-schemes/${schemeId}`);
  }

  // Answer sheets
  async getAnswerSheets(): Promise<Array<{
    id: number;
    filename: string;
    original_filename: string;
    file_format: string;
    student_id?: string;
    subject_id?: string;
    processing_status: string;
    ocr_used: boolean;
    created_at: string;
  }>> {
    return this.request('/api/answer-sheets');
  }

  async getAnswerSheet(sheetId: number): Promise<{
    id: number;
    filename: string;
    original_filename: string;
    file_format: string;
    student_id?: string;
    subject_id?: string;
    processing_status: string;
    ocr_used: boolean;
    extracted_answers?: string;
    parsed_answers?: any;
    error_message?: string;
    marking_scheme_id?: number;
    created_at: string;
  }> {
    return this.request(`/api/answer-sheets/${sheetId}`);
  }

  // Statistics
  async getStatistics(): Promise<{
    total_marking_schemes: number;
    total_answer_sheets: number;
    total_grading_results: number;
    average_score?: number;
    highest_score?: number;
    lowest_score?: number;
  }> {
    return this.request('/api/statistics');
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

  // Update answer sheet with manual answers
  async updateAnswerSheetAnswers(pdfId: number, answers: Record<string, Record<string, string>>): Promise<{
    message: string;
    pdf_id: number;
  }> {
    return this.request(`/upload/answer-sheet/${pdfId}/answers`, {
      method: 'PUT',
      body: JSON.stringify(answers),
    });
  }

  // Student View Methods
  async getStudentResults(studentId: string): Promise<GradingResult[]> {
    const response = await this.request<GradingResult[]>(`/api/student/${studentId}/results`);
    return response;
  }

  async getStudentResultDetail(studentId: string, resultId: number): Promise<GradingResultDetail> {
    const response = await this.request<GradingResultDetail>(`/api/student/${studentId}/results/${resultId}`);
    return response;
  }
}

// Export singleton instance
export const api = new ApiClient();
