import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AIConfidenceBar from '@/components/ui/AIConfidenceBar';
import { Submission } from '@/types';

interface ResultsTableProps {
  submissions: Submission[];
}

const ResultsTable = ({ submissions }: ResultsTableProps) => {
  const [sortField, setSortField] = useState<keyof Submission>('studentId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: keyof Submission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle special cases
    if (sortField === 'totalScore') {
      aValue = a.totalScore || 0;
      bValue = b.totalScore || 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'reviewed':
        return <Badge className="confidence-high">Reviewed</Badge>;
      case 'flagged':
        return <Badge className="confidence-low">Flagged</Badge>;
      case 'auto':
        return <Badge className="confidence-medium">Auto-graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const SortableHeader = ({ field, children }: { field: keyof Submission; children: React.ReactNode }) => (
    <th 
      className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <Icon.ChevronUp className={`h-3 w-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-8 py-3 px-4"></th>
            <SortableHeader field="studentId">Student ID</SortableHeader>
            <SortableHeader field="totalScore">Total Score</SortableHeader>
            <SortableHeader field="avgConfidence">Avg Confidence</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {sortedSubmissions.map((submission, index) => {
            const isExpanded = expandedRows.has(submission.id);
            
            return (
              <React.Fragment key={submission.id}>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(submission.id)}
                      className="p-0 h-auto"
                    >
                      <Icon.ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="font-medium">{submission.studentId}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="font-medium">
                      {submission.totalScore || 'Pending'}
                      <span className="text-sm text-muted-foreground ml-1">/20</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="w-32">
                      <AIConfidenceBar value={submission.avgConfidence} size="sm" />
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {getStatusBadge(submission.status)}
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </motion.tr>

                {/* Expanded Row */}
                {isExpanded && (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gray-50"
                  >
                    <td colSpan={6} className="py-4 px-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Question Breakdown</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {submission.pages.flatMap(page => page.answers).map((answer, answerIndex) => (
                            <div key={`${answer.questionId}-${answerIndex}`} className="bg-white p-3 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">
                                  Question {answer.questionId.toUpperCase()}
                                </div>
                                {answer.flagged && (
                                  <Badge className="confidence-low text-xs">Flagged</Badge>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Score:</span>
                                  <span className="font-medium">
                                    {answer.manualScore ?? answer.aiScore}/5
                                    {answer.manualScore !== undefined && (
                                      <span className="text-xs text-muted-foreground ml-1">(Manual)</span>
                                    )}
                                  </span>
                                </div>
                                
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">AI Confidence</div>
                                  <AIConfidenceBar value={answer.aiConfidence} size="sm" />
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  Answer: {answer.text.substring(0, 50)}
                                  {answer.text.length > 50 && '...'}
                                </div>
                                
                                {answer.comment && (
                                  <div className="text-xs bg-blue-50 p-2 rounded">
                                    <div className="font-medium">Comment:</div>
                                    <div>{answer.comment}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {submission.pages.some(p => p.ocrConfidence < 0.8) && (
                          <div className="text-sm text-muted-foreground bg-yellow-50 p-2 rounded flex items-center">
                            <Icon.AlertTriangle className="h-4 w-4 mr-2" />
                            This submission has low OCR confidence on some pages
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      
      {submissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No submissions match the current filters
        </div>
      )}
    </div>
  );
};

export default ResultsTable;