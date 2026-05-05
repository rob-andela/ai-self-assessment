'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { decodeAnswersFromUrl, calculateArchetype } from '@/lib/scoring';
import { ArchetypeResult } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

const qrImageCache = new Map<string, string>();

const archetypeEmojis: Record<string, string> = {
  Prototyper: '🧪',
  Builder: '🏗️',
  Scaler: '📈',
};

const archetypeDetails: Record<string, {
  tagline: string;
  strengths: string[];
  approach: string;
  thrive: string;
  watchOut: string;
  teamDynamic: string;
}> = {
  Prototyper: {
    tagline: 'You sense value before others can see it.',
    strengths: [
      'Moving fast from idea to working demo',
      'Validating assumptions cheaply before committing resources',
      'Keeping teams focused on what actually matters to users',
      'Adapting quickly when initial assumptions prove wrong',
    ],
    approach: 'Build first, validate fast. You compress weeks of debate into days of evidence — using quick prototypes to discover what actually works before anyone has agreed on a spec.',
    thrive: 'Early-stage products, innovation sprints, zero-to-one phases, proof-of-concept work, hackathons',
    watchOut: 'Technical debt accumulates fast under your hands. Hardening systems and adding operational rigor can feel like unnecessary friction — but builders and scalers need it to carry your work forward.',
    teamDynamic: 'You energize builders with clear direction and give scalers real problems worth solving. In a team, you are the engine of discovery.',
  },
  Builder: {
    tagline: 'You make validated ideas real and production-ready.',
    strengths: [
      'Designing systems that survive contact with real users',
      'Clean API design and strong architectural instincts',
      'Balancing engineering speed with long-term maintainability',
      'Creating codebases that other engineers can actually work in',
    ],
    approach: 'Design first, build to last. You see how the pieces should fit before writing a line of code, and your systems are built to evolve gracefully as requirements change.',
    thrive: 'Prototype-to-production transitions, platform engineering, API design, growing engineering organizations',
    watchOut: 'Over-engineering is your blind spot. Early-stage work often needs a "good enough" solution — investing too early in abstraction and extensibility can slow discovery.',
    teamDynamic: 'You give prototypers a production path and give scalers systems they can actually operate. You are the bridge between vision and reliability.',
  },
  Scaler: {
    tagline: 'You prevent the expensive failures others never see coming.',
    strengths: [
      'Spotting cost, risk, and governance problems before they become crises',
      'Building observable, reliable, and sustainable AI systems',
      'Navigating compliance, security, and enterprise constraints',
      'Long-term thinking about total cost of ownership and vendor risk',
    ],
    approach: 'Measure twice, cut once. You ensure AI systems are sustainable, secure, and observable — turning promising prototypes into enterprise-grade solutions that actually stay running.',
    thrive: 'Enterprise AI teams, regulated industries, MLOps, production systems under stress, organizations that have been burned before',
    watchOut: "Process can become a shield. When risk-aversion becomes the default, you can block the experimentation that creates the value you're trying to protect.",
    teamDynamic: "You give builders a path to production confidence and give prototypers guardrails that don't slow them down. You are the force that makes AI trustworthy at scale.",
  },
};

function ResultPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrRef = useRef<any>(null);
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    const answers = decodeAnswersFromUrl(searchParams.toString());
    if (Object.keys(answers).length !== 12) {
      router.push('/');
      return;
    }
    setResult(calculateArchetype(answers));
    setLoading(false);
  }, [searchParams, router]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleDownloadQR = () => {
    const triggerDownload = (dataUrl: string) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `archetype-${result?.primary.toLowerCase()}-result.png`;
      link.click();
    };

    const cacheKey = window.location.href;
    const cached = qrImageCache.get(cacheKey);
    if (cached) { triggerDownload(cached); return; }

    if (qrRef.current) {
      const svg = qrRef.current as unknown as SVGElement;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        qrImageCache.set(cacheKey, dataUrl);
        triggerDownload(dataUrl);
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-lg">Loading result...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
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

  const details = archetypeDetails[result.primary];

  const linkedInHref = (() => {
    if (typeof window === 'undefined') return '#';
    const resultUrl = window.location.href;
    const archetype = result.primary;
    const emoji = archetypeEmojis[archetype];
    const total = result.counts.P + result.counts.B + result.counts.S;
    const text = `I just discovered my AI Engineering Archetype: ${archetype} ${emoji}\n\n${details.tagline}\n\nCurious what yours is? Take the free ${total}-question assessment (less than 5 minutes).`;
    return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(resultUrl)}&title=${encodeURIComponent(`My AI Archetype: ${archetype}`)}&summary=${encodeURIComponent(text)}`;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="px-2 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" aria-label="Andela home" className="flex-shrink-0">
              <img src="/andela_logo.svg" alt="Andela" width="96" height="25" className="w-[80px] sm:w-[110px] h-auto" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#16A085]" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground" aria-hidden="true">Complete</span>
              </div>
              <div
                className="h-1.5 rounded-full bg-border overflow-hidden"
                role="progressbar"
                aria-valuenow={100}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Assessment complete"
              >
                <div className="h-full rounded-full bg-[#16A085]" style={{ width: '100%' }} />
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight text-foreground mb-2 sm:mb-4">
              Your AI Archetype
            </h1>
            <p className="text-xs sm:text-sm text-secondary">Based on your technical taste assessment</p>
          </div>

          {/* Main result card — single teal palette */}
          <div className="rounded-lg p-4 sm:p-8 mb-8 sm:mb-12 border-2 border-[#16A085] bg-[#E8F5F3] dark:bg-[#0d2e28]">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-4xl sm:text-6xl flex-shrink-0" aria-hidden="true">
                {archetypeEmojis[result.primary]}
              </div>
              <div>
                <h2 className="text-3xl sm:text-5xl font-serif font-normal mb-2 sm:mb-3 text-[#16A085]">
                  {result.primary}
                </h2>
                {result.isSenior && (
                  <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#16A085]">
                    Senior / Lead Level
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium leading-relaxed mb-5 sm:mb-7 text-[#16A085]">
              {details.tagline}
            </p>

            <p className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 text-foreground">
              {details.approach}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8">
              <div className="rounded-lg p-4 bg-[#D1EFED] dark:bg-[#112e2a]">
                <div className="text-xs font-semibold uppercase tracking-wide mb-3 text-[#16A085]">
                  Strengths
                </div>
                <ul className="space-y-2">
                  {details.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                      <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#16A085]" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-lg p-4 bg-[#D1EFED] dark:bg-[#112e2a]">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#16A085]">
                    Where you thrive
                  </div>
                  <p className="text-sm leading-snug">{details.thrive}</p>
                </div>
                <div className="rounded-lg p-4 bg-[#D1EFED] dark:bg-[#112e2a]">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#16A085]">
                    Watch out for
                  </div>
                  <p className="text-sm leading-snug">{details.watchOut}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-6 sm:mb-8 bg-[#D1EFED] dark:bg-[#112e2a]">
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#16A085]">
                With your team
              </div>
              <p className="text-sm leading-snug">{details.teamDynamic}</p>
            </div>

            <div className="pt-6 sm:pt-8 border-t-2 border-[#16A085]">
              <div className="text-xs font-semibold uppercase tracking-wide mb-4 text-[#16A085]">
                Your answer breakdown
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {(['Prototyper', 'Builder', 'Scaler'] as const).map((label) => (
                  <div key={label}>
                    <div className="text-xs sm:text-sm text-secondary mb-1 sm:mb-2 font-medium">{label}</div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {result.counts[label === 'Prototyper' ? 'P' : label === 'Builder' ? 'B' : 'S']}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sharing section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="flex flex-col items-center">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Share Your Result</h3>
              <div className="bg-white p-2 sm:p-4 rounded-lg border border-border">
                <QRCodeSVG
                  ref={qrRef}
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  size={192}
                  level="H"
                  marginSize={4}
                />
              </div>
              <p className="text-xs text-secondary mt-2 sm:mt-4 text-center">Scan to share your result</p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Permalink</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    aria-label="Result permalink"
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-border rounded-lg bg-accent text-xs sm:text-sm font-mono min-w-0"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="sm:flex-shrink-0 px-4 py-1.5 sm:py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm"
                  >
                    {copyStatus === 'copied' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-secondary mt-1.5 sm:mt-2">This link encodes your answers</p>
              </div>

              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm"
              >
                Download QR Code
              </button>

              <a
                href={linkedInHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors bg-[#0A66C2] hover:bg-[#0958a8]"
                aria-label={`Share your ${result.primary} archetype on LinkedIn`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-border">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm sm:text-base"
            >
              Restart
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm sm:text-base"
            >
              Print
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-lg">Loading result...</div>
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  );
}
