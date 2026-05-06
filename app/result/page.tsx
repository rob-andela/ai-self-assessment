import type { Metadata } from 'next';
import { decodeAnswersFromUrl, calculateArchetype } from '@/lib/scoring';
import ResultContent from './ResultContent';

const QUIZ_URL = 'https://assess.aipoc.site';

const archetypeTaglines: Record<string, string> = {
  Prototyper: 'I sense value before others can see it.',
  Builder: 'I make validated ideas real and production-ready.',
  Scaler: 'I prevent the expensive failures others never see coming.',
};

const archetypeImages: Record<string, string> = {
  Prototyper: `${QUIZ_URL}/integrator.png`,
  Builder:    `${QUIZ_URL}/builder.png`,
  Scaler:     `${QUIZ_URL}/scaler.png`,
};

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;

  const urlSearchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') urlSearchParams.set(key, value);
  });

  const answers = decodeAnswersFromUrl(urlSearchParams.toString());

  if (Object.keys(answers).length !== 12) {
    return {
      title: 'AI Archetype Assessment | Andela',
      description: 'Discover your AI engineering archetype — Prototyper, Builder, or Scaler. A 12-question assessment for engineers.',
      openGraph: {
        title: 'AI Archetype Assessment',
        description: 'Discover your AI engineering archetype in less than 5 minutes.',
        url: QUIZ_URL,
        type: 'website',
        siteName: 'AI Archetype Assessment by Andela',
        images: [{ url: `${QUIZ_URL}/builder.png`, alt: 'AI Archetype Assessment' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Archetype Assessment',
        description: 'Discover your AI engineering archetype in less than 5 minutes.',
        images: [`${QUIZ_URL}/builder.png`],
      },
    };
  }

  const result = calculateArchetype(answers);
  const archetype = result.primary;
  const level = result.isSenior ? 'Senior ' : '';
  const resultUrl = `${QUIZ_URL}/result?${urlSearchParams.toString()}`;
  const ogImageUrl = archetypeImages[archetype];
  const description = `${archetypeTaglines[archetype]} Discover your own AI engineering archetype in under 5 minutes.`;

  return {
    title: `I'm a ${level}${archetype} AI Engineer | AI Archetype Assessment`,
    description,
    openGraph: {
      title: `I'm a ${level}${archetype} AI Engineer`,
      description,
      url: resultUrl,
      type: 'website',
      siteName: 'AI Archetype Assessment by Andela',
      images: [{ url: ogImageUrl, alt: `AI Archetype: ${level}${archetype}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `I'm a ${level}${archetype} AI Engineer`,
      description,
      images: [ogImageUrl ?? ''],
    },
  };
}

export default function ResultPage() {
  return <ResultContent />;
}
