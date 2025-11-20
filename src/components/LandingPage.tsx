import { useState } from 'react';
import { Shield, Github, Lock, Zap, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onAnalyze: (repoUrl: string) => void;
}

export function LandingPage({ onAnalyze }: LandingPageProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onAnalyze(repoUrl.trim());
    }
  };

  const exampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/vercel/next.js',
    'https://github.com/nodejs/node',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-100/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SecureCode
            </span>
          </div>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium opacity-50 cursor-not-allowed">
            <Github className="w-5 h-5 inline mr-2" />
            Connect GitHub (Coming Soon)
          </button>
        </nav>

        <main className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium text-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              Security Analysis for Everyone
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
                    placeholder="Enter GitHub repository URL"
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

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
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
