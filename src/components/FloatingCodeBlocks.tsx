import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface CodeBlock {
  id: number;
  code: string;
  vulnerability: string;
  fixed: boolean;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const vulnerabilities = [
  {
    code: 'const api_key = "sk_live_..."',
    vulnerability: 'Exposed API Key',
  },
  {
    code: 'query = `SELECT * FROM users WHERE id=${id}`',
    vulnerability: 'SQL Injection',
  },
  {
    code: 'eval(userInput)',
    vulnerability: 'Code Injection',
  },
  {
    code: 'password = process.env.DB_PASSWORD',
    vulnerability: 'Hardcoded Password',
  },
];

interface FloatingCodeBlocksProps {
  mousePosition: { x: number; y: number };
}

export function FloatingCodeBlocks({ mousePosition }: FloatingCodeBlocksProps) {
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);

  useEffect(() => {
    const leftPositions = [
      { x: 2, y: 20 },
      { x: 1, y: 60 },
    ];

    const rightPositions = [
      { x: 78, y: 25 },
      { x: 79, y: 65 },
    ];

    const allPositions = [...leftPositions, ...rightPositions];

    const initialBlocks = vulnerabilities.map((vuln, i) => ({
      id: i,
      ...vuln,
      fixed: false,
      x: allPositions[i].x,
      y: allPositions[i].y,
      delay: i * 2,
      duration: 20 + Math.random() * 10,
    }));
    setBlocks(initialBlocks);

    const fixInterval = setInterval(() => {
      setBlocks((prev) =>
        prev.map((block) => {
          if (!block.fixed && Math.random() > 0.7) {
            return { ...block, fixed: true };
          }
          if (block.fixed && Math.random() > 0.9) {
            return { ...block, fixed: false };
          }
          return block;
        })
      );
    }, 3000);

    return () => clearInterval(fixInterval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blocks.map((block, index) => {
        const isLeft = index < 2;
        const moveMultiplier = isLeft ? 15 : -15;

        return (
          <div
            key={block.id}
            className="absolute animate-float opacity-0"
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              animationDelay: `${block.delay}s`,
              animationDuration: `${block.duration}s`,
              transform: `translate(${mousePosition.x * moveMultiplier}px, ${mousePosition.y * moveMultiplier}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div
              className={`relative bg-white/40 backdrop-blur-sm rounded-lg shadow-xl border-2 transition-all duration-500 ${
                block.fixed
                  ? 'border-green-300 scale-105'
                  : 'border-red-300'
              }`}
            >
            <div className="absolute -top-3 -right-3 z-10">
              {block.fixed ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="p-4 min-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span
                  className={`text-xs font-bold ${
                    block.fixed ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {block.vulnerability}
                </span>
              </div>
              <pre className="text-xs font-mono text-gray-800 bg-gray-100 p-2 rounded overflow-hidden">
                <code className={block.fixed ? 'line-through opacity-50' : ''}>
                  {block.code}
                </code>
              </pre>
              {block.fixed && (
                <div className="mt-2 text-xs text-green-600 font-medium animate-fade-in">
                  Fixed
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
