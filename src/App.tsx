import { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analysisService } from './services/analysisService';
import { githubService } from './services/githubService';
import type { AnalysisResult } from './types';

type AppState = 'landing' | 'analyzing' | 'results' | 'error';

function App() {
  const [state, setState] = useState<AppState>('landing');
  const [repoUrl, setRepoUrl] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const path = window.location.pathname;

    if (path === '/github/callback' && code && state) {
      handleGitHubCallback(code, state);
    }
  }, []);

  const handleGitHubCallback = async (code: string, state: string) => {
    try {
      await githubService.handleCallback(code, state);

      const token = githubService.getAccessToken();
      analysisService.setGitHubToken(token);

      setAuthKey(prev => prev + 1);

      window.history.replaceState({}, document.title, '/');
      setState('landing');
    } catch (err) {
      console.error('GitHub OAuth error:', err);
      setError(err instanceof Error ? err.message : 'GitHub authentication failed');
      setState('error');
      setTimeout(() => {
        setState('landing');
        window.history.replaceState({}, document.title, '/');
      }, 3000);
    }
  };

  const handleAnalyze = useCallback(async (url: string) => {
    setRepoUrl(url);
    setState('analyzing');
    setError(null);

    const token = githubService.getAccessToken();
    analysisService.setGitHubToken(token);

    try {
      const analysisResult = await analysisService.analyzeRepository(url);
      setResult(analysisResult);
      setTimeout(() => {
        setState('results');
      }, 9000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setState('error');

      if (!errorMessage.startsWith('PRIVATE_REPO:')) {
        setTimeout(() => {
          setState('landing');
        }, 3000);
      }
    }
  }, []);

  const handleBack = () => {
    setState('landing');
    setRepoUrl('');
    setResult(null);
    setError(null);
  };

  if (state === 'landing') {
    return <LandingPage key={authKey} onAnalyze={handleAnalyze} />;
  }

  if (state === 'analyzing') {
    return <AnalysisProgress repoUrl={repoUrl} />;
  }

  if (state === 'error') {
    const isPrivateRepoError = error?.startsWith('PRIVATE_REPO:');
    const displayError = isPrivateRepoError ? error.replace('PRIVATE_REPO:', '') : error;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPrivateRepoError ? 'Private Repository' : 'Analysis Failed'}
          </h2>
          <p className="text-gray-600 mb-6">{displayError}</p>

          {isPrivateRepoError ? (
            <div className="space-y-3">
              <button
                onClick={() => githubService.initiateOAuth()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Connect GitHub Account
              </button>
              <button
                onClick={handleBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-xl transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Redirecting back...</p>
          )}
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
