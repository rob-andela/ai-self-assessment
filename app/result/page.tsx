'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { decodeAnswersFromUrl, calculateArchetype } from '@/lib/scoring';
import { ArchetypeResult } from '@/lib/types';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const answers = decodeAnswersFromUrl(searchParams.toString());

    if (Object.keys(answers).length !== 12) {
      router.push('/');
      return;
    }

    const archetypeResult = calculateArchetype(answers);
    setResult(archetypeResult);
    setLoading(false);
  }, [searchParams, router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'archetype-result.png';
      link.click();
    }
  };

  const archetypeColors: Record<string, { text: string; bg: string; accentBg: string }> = {
    Prototyper: { text: '#FF6B35', bg: '#FFF5F0', accentBg: '#FFE8DD' },
    Builder: { text: '#004E89', bg: '#E8F1F8', accentBg: '#D1E3F0' },
    Scaler: { text: '#16A085', bg: '#E8F5F3', accentBg: '#D1EFED' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading result...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Assessment</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Restart Assessment
          </button>
        </div>
      </div>
    );
  }

  const colors = archetypeColors[result.primary];
  const archetypeEmojis: Record<string, string> = {
    Prototyper: '🧪',
    Builder: '🏗️',
    Scaler: '📈',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-6 sm:gap-10">
            <Link href="/" aria-label="Andela home" className="flex-shrink-0">
              <img
                src="/andela_logo.svg"
                alt="Andela"
                width="96"
                height="25"
                className="sm:w-[110px] h-auto"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#16A085]"></span>
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">Assessment Complete</span>
                </div>
                <span className="text-xs text-secondary flex-shrink-0 ml-3">12/12</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow="12" aria-valuemin="1" aria-valuemax="12" aria-label="Progress: assessment complete">
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-[#16A085]" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-normal leading-tight text-foreground mb-4">
              Your AI Archetype
            </h1>
            <p className="text-secondary">Based on your technical taste assessment</p>
          </div>

          <div
            className="rounded-lg p-8 mb-12 border-2"
            style={{
              borderColor: colors.text,
              backgroundColor: colors.bg,
            }}
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="text-6xl">{archetypeEmojis[result.primary]}</div>
              <div>
                <h2 className="text-5xl font-serif font-normal mb-3" style={{ color: colors.text }}>
                  {result.primary}
                </h2>
                {result.isSenior && (
                  <div
                    className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: colors.text }}
                  >
                    Senior / Lead Level
                  </div>
                )}
              </div>
            </div>

            <p className="text-base leading-relaxed mb-6">
              <strong>Technical Taste Profile:</strong> You excel at{' '}
              {result.descriptions[result.primary]}.
            </p>

            <div className="mt-8 pt-8 border-t-2" style={{ borderColor: colors.text }}>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-secondary mb-2 font-medium">Prototyper</div>
                  <div className="text-3xl font-bold">{result.counts.P}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary mb-2 font-medium">Builder</div>
                  <div className="text-3xl font-bold">{result.counts.B}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary mb-2 font-medium">Scaler</div>
                  <div className="text-3xl font-bold">{result.counts.S}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Share Your Result</h3>
              <div className="bg-white p-4 rounded-lg border border-border">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-xs text-secondary mt-4 text-center">
                Scan to share your archetype result
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Permalink</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-accent text-sm font-mono min-w-0"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="sm:flex-shrink-0 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-secondary mt-2">
                  This link uniquely encodes your answers and can be shared without a database.
                </p>
              </div>

              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
              >
                Download QR Code
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-border">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Restart Assessment
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Print Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
