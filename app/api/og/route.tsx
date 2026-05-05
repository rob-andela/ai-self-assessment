import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const archetypeEmojis: Record<string, string> = {
  Prototyper: '🧪',
  Builder: '🏗️',
  Scaler: '📈',
};

const archetypeTaglines: Record<string, string> = {
  Prototyper: 'You sense value before others can see it.',
  Builder: 'You make validated ideas real and production-ready.',
  Scaler: 'You prevent the expensive failures others never see coming.',
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const archetype = searchParams.get('archetype') || 'Prototyper';
  const isSenior = searchParams.get('senior') === 'true';
  const emoji = archetypeEmojis[archetype] ?? '🧪';
  const tagline = archetypeTaglines[archetype] ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          backgroundColor: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left teal accent stripe */}
        <div style={{ width: '14px', height: '100%', backgroundColor: '#16A085', flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '56px 72px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#16A085',
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#16A085',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              AI Archetype Assessment · Andela
            </span>
          </div>

          {/* Core result */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Emoji + senior badge row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '12px',
              }}
            >
              <span style={{ fontSize: '72px', lineHeight: '1' }}>{emoji}</span>
              {isSenior && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#16A085',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '700',
                    padding: '8px 24px',
                    borderRadius: '100px',
                  }}
                >
                  Senior / Lead Level
                </span>
              )}
            </div>

            {/* Archetype name */}
            <div
              style={{
                fontSize: '88px',
                fontWeight: '700',
                color: '#1a1a1a',
                lineHeight: '1',
                marginBottom: '22px',
              }}
            >
              {archetype}
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: '26px',
                color: '#555555',
                lineHeight: '1.4',
                maxWidth: '760px',
              }}
            >
              {tagline}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', color: '#999999' }}>
              ai-self-assessment.aipoc.site
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
