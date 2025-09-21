import { useState, useEffect } from 'react';

interface GradingResult {
  student_id?: number;
  total_score: number;
  question_scores: Record<string, number>;
  feedback: string[];
  status: string;
}

const SimpleResults = () => {
  const [results, setResults] = useState<GradingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching results...');
      
      const response = await fetch('http://127.0.0.1:8000/results/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      const convertedResults = data.results.map((result: any) => ({
        student_id: result.student_id,
        total_score: parseFloat(result.total_score),
        question_scores: result.question_scores,
        feedback: result.feedback,
        status: result.status
      }));
      
      setResults(convertedResults);
      setError(null);
    } catch (err) {
      console.error('Error fetching grading results:', err);
      setError(`Failed to load grading results: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading results...</h1>
        <p>Please wait while we fetch your grading results.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error Loading Results</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchResults} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Grading Results</h1>
      <p>Total Results: {results.length}</p>
      
      {results.length === 0 ? (
        <div>
          <h2>No Results Found</h2>
          <p>You haven't graded any papers yet.</p>
        </div>
      ) : (
        <div>
          {results.map((result, index) => (
            <div key={index} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
              <h3>Result {index + 1}</h3>
              <p><strong>Total Score:</strong> {result.total_score}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Questions:</strong> {Object.keys(result.question_scores).length}</p>
              
              <details>
                <summary>Question Scores</summary>
                <pre>{JSON.stringify(result.question_scores, null, 2)}</pre>
              </details>
              
              <details>
                <summary>Feedback</summary>
                <ul>
                  {result.feedback.map((fb, i) => (
                    <li key={i}>{fb}</li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={fetchResults} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Refresh Results
      </button>
    </div>
  );
};

export default SimpleResults;
