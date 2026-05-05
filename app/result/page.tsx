'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
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

  const archetypeColors: Record<string, { text: string; bg: string }> = {
    Prototyper: { text: '#FF6B35', bg: '#FFF5F0' },
    Builder: { text: '#004E89', bg: '#E8F1F8' },
    Scaler: { text: '#2A9D8F', bg: '#E8F5F3' },
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your AI Archetype</h1>
            <p className="text-secondary">Based on your technical taste assessment</p>
          </div>

          <div
            className="rounded-lg p-8 mb-8 border-2"
            style={{
              borderColor: colors.text,
              backgroundColor: colors.bg,
            }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl">{archetypeEmojis[result.primary]}</div>
              <div>
                <h2
                  className="text-4xl font-bold mb-2"
                  style={{ color: colors.text }}
                >
                  {result.primary}
                </h2>
                {result.isSenior && (
                  <div className="inline-block px-3 py-1 bg-primary text-background rounded-full text-sm font-semibold">
                    Senior / Lead Level
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg leading-relaxed mb-4">
              <strong>Technical Taste Profile:</strong> You excel at{' '}
              {result.descriptions[result.primary]}.
            </p>

            <div className="mt-6 pt-6 border-t-2" style={{ borderColor: colors.text }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-secondary mb-1">Prototyper</div>
                  <div className="text-2xl font-bold">{result.counts.P}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary mb-1">Builder</div>
                  <div className="text-2xl font-bold">{result.counts.B}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary mb-1">Scaler</div>
                  <div className="text-2xl font-bold">{result.counts.S}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Share Your Result</h3>
              <div className="bg-white p-4 rounded-lg border border-border">
                <QRCode
                  value={window.location.href}
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
                <h3 className="text-sm font-semibold mb-2">Permalink</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-accent text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
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
