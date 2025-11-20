import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analysisService } from './services/analysisService';
import type { AnalysisResult } from './types';

type AppState = 'landing' | 'analyzing' | 'results' | 'error';

function App() {
  const [state, setState] = useState<AppState>('landing');
  const [repoUrl, setRepoUrl] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setRepoUrl(url);
    setState('analyzing');
    setError(null);

    try {
      const analysisResult = await analysisService.analyzeRepository(url);
      setResult(analysisResult);
      setTimeout(() => {
        setState('results');
      }, 9000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setState('error');
      setTimeout(() => {
        setState('landing');
      }, 3000);
    }
  };

  const handleBack = () => {
    setState('landing');
    setRepoUrl('');
    setResult(null);
    setError(null);
  };

  if (state === 'landing') {
    return <LandingPage onAnalyze={handleAnalyze} />;
  }

  if (state === 'analyzing') {
    return <AnalysisProgress repoUrl={repoUrl} />;
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting back...</p>
        </div>
      </div>
    );
  }

  if (state === 'results' && result) {
    return <ResultsDashboard result={result} onBack={handleBack} />;
  }

  return null;
}

export default App;
