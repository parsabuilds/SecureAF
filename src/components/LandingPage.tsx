import { useState, useEffect } from 'react';
import { Shield, Github, Lock, Zap, CheckCircle } from 'lucide-react';
import { ParticleAnimation } from './ParticleAnimation';
import { FloatingCodeBlocks } from './FloatingCodeBlocks';
import { RepositorySelector } from './RepositorySelector';
import { githubService } from '../services/githubService';

interface LandingPageProps {
  onAnalyze: (repoUrl: string) => void;
}

export function LandingPage({ onAnalyze }: LandingPageProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(githubService.isAuthenticated());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsAuthenticated(githubService.isAuthenticated());
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onAnalyze(repoUrl.trim());
    }
  };

  const handleGitHubConnect = () => {
    githubService.initiateOAuth();
  };

  const exampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/expressjs/express',
    'https://github.com/nodejs/node',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <ParticleAnimation />
      <FloatingCodeBlocks mousePosition={mousePosition} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-100/30 to-transparent rounded-full blur-3xl transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
          }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-100/20 to-transparent rounded-full blur-2xl transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-100/20 to-transparent rounded-full blur-2xl transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`
          }}
        />
      </div>

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VibeCheckMyCode.dev
              </span>
            </div>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Connected as {githubService.getUser()?.login}</span>
              <button
                onClick={() => {
                  githubService.logout();
                  setIsAuthenticated(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleGitHubConnect}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium hover:bg-gray-100 rounded-lg"
            >
              <Github className="w-5 h-5 inline mr-2" />
              Connect GitHub
            </button>
          )}
        </nav>

        <main className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium text-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              Because your code deserves better.
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Ship secure code
              <br />
              with confidence
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Professional security analysis for your GitHub repositories.
              Catch vulnerabilities before they reach production.
            </p>

            {isAuthenticated && (
              <div className="mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl max-w-3xl mx-auto">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Access to private repositories enabled</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative max-w-3xl mx-auto">
                <div
                  className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg transition-opacity duration-300 ${
                    isHovered ? 'opacity-30' : 'opacity-0'
                  }`}
                />
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Github className="w-6 h-6 text-gray-400 ml-6" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onFocus={() => setIsHovered(true)}
                    onBlur={() => setIsHovered(false)}
                    placeholder={isAuthenticated ? "Enter any GitHub repository URL" : "Enter public GitHub repository URL"}
                    className="flex-1 px-6 py-6 text-lg outline-none"
                  />
                  <button
                    type="submit"
                    className="m-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </form>

            {isAuthenticated && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300 max-w-xs"></div>
                <span className="text-gray-500 font-medium">OR</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300 max-w-xs"></div>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex justify-center mb-8">
                <RepositorySelector onSelect={(url) => setRepoUrl(url)} />
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-16">
                <span>Try an example:</span>
              {exampleRepos.map((url) => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  className="px-3 py-1 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  {url.split('/').slice(-1)[0]}
                </button>
              ))}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg mx-auto">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Critical Detection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Identify exposed secrets, SQL injection, and critical vulnerabilities instantly
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Smart Scoring
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Weighted analysis that prioritizes what matters most for your security
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg mx-auto">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  Actionable Fixes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Clear recommendations and step-by-step guidance to fix every issue
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>Built for developers who ship fast and stay secure</p>
        </footer>
      </div>
    </div>
  );
}
