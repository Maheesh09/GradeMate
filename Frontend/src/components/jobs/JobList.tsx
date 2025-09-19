import { motion } from 'framer-motion';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Job } from '@/types';

interface JobListProps {
  jobs: Job[];
  onView: (jobId: string) => void;
  onExport: (jobId: string) => void;
}

const JobList = ({ jobs, onView, onExport }: JobListProps) => {
  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="confidence-high">Completed</Badge>;
      case 'processing':
        return <Badge className="confidence-medium">Processing</Badge>;
      case 'queued':
        return <Badge className="confidence-low">Queued</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Job</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Files</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Submissions</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Flagged</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <motion.tr
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-4 px-4">
                <div>
                  <div className="font-medium">{job.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {job.id}</div>
                </div>
              </td>
              
              <td className="py-4 px-4">
                {getStatusBadge(job.status)}
              </td>
              
              <td className="py-4 px-4">
                <div className="w-24">
                  {job.status === 'processing' ? (
                    <div>
                      <Progress value={job.progress} className="mb-1" />
                      <div className="text-xs text-muted-foreground">
                        {job.progress}%
                        {job.estimatedTime && ` • ${job.estimatedTime} left`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {job.status === 'completed' ? '100%' : '-'}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div className="text-sm">{job.fileCount}</div>
              </td>
              
              <td className="py-4 px-4">
                <div className="text-sm">{job.submissionCount}</div>
              </td>
              
              <td className="py-4 px-4">
                <div className={`text-sm ${job.flaggedCount > 0 ? 'text-warning font-medium' : ''}`}>
                  {job.flaggedCount}
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(job.createdAt)}
                </div>
              </td>
              
              <td className="py-4 px-4">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(job.id)}
                    className="btn-tertiary"
                  >
                    <Icon.Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport(job.id)}
                    disabled={job.status !== 'completed'}
                    className="btn-tertiary"
                  >
                    <Icon.Download className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {jobs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No jobs found
        </div>
      )}
    </div>
  );
};

export default JobList;