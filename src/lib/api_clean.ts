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
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private async uploadRequest<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // File upload endpoints
  async uploadMarkingSheet(file: File): Promise<{
    success: boolean;
    data: { id: number; filename: string };
    message: string;
  }> {
    return this.uploadRequest('/api/marking-schemes/upload', file);
  }

  async uploadAnswerSheet(file: File, useOcr: boolean = false): Promise<{
    success: boolean;
    data: { id: number; filename: string };
    message: string;
  }> {
    return this.uploadRequest('/api/answer-sheets/upload', file, { use_ocr: useOcr });
  }

  // Grading endpoints
  async gradeAnswers(markingSheetId: number, answerSheetIds: number[]): Promise<{
    success: boolean;
    data: { session_id: string };
    message: string;
  }> {
    return this.request('/api/grading/grade', {
      method: 'POST',
      body: JSON.stringify({
        marking_scheme_id: markingSheetId,
        answer_sheet_ids: answerSheetIds,
      }),
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
    question_scores?: any;
    feedback?: string[];
    recommendations?: string[];
    grading_status: string;
    created_at: string;
  }> {
    return this.request(`/api/grading/results/${resultId}`);
  }

  async downloadExcelResult(resultId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/grading/results/${resultId}/excel`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  }

  // Marking schemes
  async getMarkingSchemes(): Promise<Array<{
    id: number;
    filename: string;
    original_filename: string;
    question_count: number;
    total_marks: number;
    processing_status: string;
    extracted_data?: any;
    error_message?: string;
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
    created_at: string;
  }> {
    return this.request(`/api/answer-sheets/${sheetId}`);
  }

  // Statistics
  async getStatistics(): Promise<{
    total_marking_schemes: number;
    total_answer_sheets: number;
    total_grading_results: number;
    successful_gradings: number;
    failed_gradings: number;
  }> {
    return this.request('/api/statistics');
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
