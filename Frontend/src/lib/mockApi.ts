// Mock API client for GradeMate UI - simulates all backend interactions

import { Job, Submission, Rubric, FieldMapping, JobProgress, AssistantSuggestion } from '@/types';
import { mockJobs, mockSubmissions, sampleRubric, sampleMappings, sampleRationales } from '@/mocks/fixtures';

// Simulated delays for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiClient {
  private jobs: Job[] = [...mockJobs];
  private submissions: Submission[] = [...mockSubmissions];
  private progressListeners: Array<(progress: JobProgress) => void> = [];

  // File upload and mapping
  async uploadFiles(files: File[]): Promise<{ success: boolean; fileIds: string[] }> {
    await delay(1500);
    const fileIds = files.map((_, i) => `file-${Date.now()}-${i}`);
    return { success: true, fileIds };
  }

  async autoMapFields(fileId: string): Promise<FieldMapping[]> {
    await delay(2000); // Simulate AI processing time
    
    // Return sample mappings with slight variations
    return sampleMappings.map(mapping => ({
      ...mapping,
      id: `${mapping.id}-${fileId}`,
      confidence: Math.max(0.4, mapping.confidence + (Math.random() - 0.5) * 0.3),
    }));
  }

  // Job management
  async createJob(name: string, fileIds: string[], rubricId: string, mappings: FieldMapping[]): Promise<Job> {
    await delay(500);
    
    const newJob: Job = {
      id: `job-${Date.now()}`,
      name,
      status: 'queued',
      progress: 0,
      fileCount: fileIds.length,
      submissionCount: 0,
      flaggedCount: 0,
      rubricId,
      createdAt: new Date().toISOString(),
    };

    this.jobs.unshift(newJob);
    
    // Start simulated processing
    setTimeout(() => this.simulateJobProgress(newJob.id), 1000);
    
    return newJob;
  }

  async getJobs(): Promise<Job[]> {
    await delay(300);
    return this.jobs;
  }

  async getJob(jobId: string): Promise<Job | null> {
    await delay(200);
    return this.jobs.find(job => job.id === jobId) || null;
  }

  // Submission management
  async getSubmissions(jobId: string): Promise<Submission[]> {
    await delay(400);
    return this.submissions.filter(sub => sub.jobId === jobId);
  }

  async getSubmission(submissionId: string): Promise<Submission | null> {
    await delay(200);
    return this.submissions.find(sub => sub.id === submissionId) || null;
  }

  async updateSubmissionScore(submissionId: string, questionId: string, score: number, comment?: string): Promise<void> {
    await delay(300);
    
    const submission = this.submissions.find(sub => sub.id === submissionId);
    if (submission) {
      submission.pages.forEach(page => {
        const answer = page.answers.find(a => a.questionId === questionId);
        if (answer) {
          answer.manualScore = score;
          answer.comment = comment;
          submission.status = 'reviewed';
        }
      });
    }
  }

  async flagSubmission(submissionId: string, questionId?: string): Promise<void> {
    await delay(200);
    
    const submission = this.submissions.find(sub => sub.id === submissionId);
    if (submission) {
      if (questionId) {
        submission.pages.forEach(page => {
          const answer = page.answers.find(a => a.questionId === questionId);
          if (answer) {
            answer.flagged = true;
          }
        });
      }
      submission.status = 'flagged';
    }
  }

  async rerunAI(submissionId: string, questionId: string): Promise<{ score: number; confidence: number; rationale: string }> {
    await delay(3000); // Simulate AI processing
    
    const confidence = Math.random();
    const score = Math.floor(Math.random() * 6); // 0-5 score range
    
    let rationale: string;
    if (confidence > 0.8) {
      rationale = sampleRationales.high[Math.floor(Math.random() * sampleRationales.high.length)];
    } else if (confidence > 0.6) {
      rationale = sampleRationales.medium[Math.floor(Math.random() * sampleRationales.medium.length)];
    } else {
      rationale = sampleRationales.low[Math.floor(Math.random() * sampleRationales.low.length)];
    }

    // Update the submission
    const submission = this.submissions.find(sub => sub.id === submissionId);
    if (submission) {
      submission.pages.forEach(page => {
        const answer = page.answers.find(a => a.questionId === questionId);
        if (answer) {
          answer.aiScore = score;
          answer.aiConfidence = confidence;
          answer.rationale = rationale;
        }
      });
    }

    return { score, confidence, rationale };
  }

  // Rubric management
  async getRubric(rubricId: string): Promise<Rubric | null> {
    await delay(200);
    // For demo, always return sample rubric
    return sampleRubric;
  }

  async createRubric(rubric: Omit<Rubric, 'id'>): Promise<Rubric> {
    await delay(400);
    return {
      ...rubric,
      id: `rubric-${Date.now()}`,
    };
  }

  // Export functionality
  async exportResults(jobId: string, format: 'csv' | 'excel'): Promise<string> {
    await delay(2000);
    
    // Simulate file download URL
    const filename = `results-${jobId}.${format}`;
    return `data:text/csv;charset=utf-8,Student ID,Score,Confidence\n2025001,6,0.92\n2025002,2,0.56`;
  }

  // AI Assistant
  async getAISuggestions(context: any): Promise<AssistantSuggestion[]> {
    await delay(1500);
    
    return [
      {
        id: 'suggestion-1',
        type: 'feedback',
        title: 'Suggested Feedback',
        content: 'Consider partial credit for showing correct formula setup.',
        context,
      },
      {
        id: 'suggestion-2',
        type: 'explanation',
        title: 'AI Reasoning',
        content: 'Low confidence due to unclear handwriting in step 2.',
        context,
      },
    ];
  }

  // Progress simulation
  private simulateJobProgress(jobId: string): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    let progress = 0;
    job.status = 'processing';

    const progressInterval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increments
      
      if (progress >= 100) {
        progress = 100;
        job.status = 'completed';
        job.progress = progress;
        job.completedAt = new Date().toISOString();
        
        // Add some sample submissions
        const sampleSubmissionCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < sampleSubmissionCount; i++) {
          const submission = { ...mockSubmissions[i % mockSubmissions.length] };
          submission.id = `sub-${jobId}-${i}`;
          submission.jobId = jobId;
          submission.studentId = `2025${String(i + 10).padStart(3, '0')}`;
          this.submissions.push(submission);
        }
        
        job.submissionCount = sampleSubmissionCount;
        job.flaggedCount = Math.floor(sampleSubmissionCount * 0.2); // 20% flagged
        
        clearInterval(progressInterval);
      } else {
        job.progress = Math.min(progress, 100);
      }

      // Notify progress listeners
      this.progressListeners.forEach(listener => {
        listener({
          jobId,
          status: job.status,
          progress: job.progress,
          message: job.status === 'processing' ? 'Processing submissions...' : undefined,
        });
      });
    }, 1000);
  }

  // Real-time progress updates
  onJobProgress(callback: (progress: JobProgress) => void): () => void {
    this.progressListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.progressListeners.indexOf(callback);
      if (index > -1) {
        this.progressListeners.splice(index, 1);
      }
    };
  }

  // Demo mode utilities
  enableDemoMode(): void {
    // Pre-populate with additional mock data for demo
    this.jobs = [...mockJobs];
    this.submissions = [...mockSubmissions];
  }

  simulateError(endpoint: string): void {
    // For testing error states
    console.warn(`Simulating error for ${endpoint}`);
  }
}

// Export singleton instance
export const mockApi = new MockApiClient();