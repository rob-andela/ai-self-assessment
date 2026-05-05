import { ArchetypeType, ArchetypeResult, QuizAnswers, Question } from './types';

export function calculateArchetype(answers: QuizAnswers, questions?: Question[]): ArchetypeResult {
  const counts = { P: 0, B: 0, S: 0 };

  // Convert indices to archetypes if questions are provided
  Object.entries(answers).forEach(([key, value]) => {
    let archetype: ArchetypeType;

    if (questions && typeof value === 'number') {
      // value is an index (0-5)
      const questionNum = parseInt(key.substring(1));
      const question = questions[questionNum - 1];
      archetype = question.answers[value].archetype as ArchetypeType;
    } else {
      // value is already an archetype letter (for backwards compatibility)
      archetype = value as ArchetypeType;
    }

    counts[archetype]++;
  });

  let primary: 'Prototyper' | 'Builder' | 'Scaler' = 'Prototyper';
  const maxCount = Math.max(counts.P, counts.B, counts.S);

  if (counts.B === maxCount && counts.B >= counts.P) {
    primary = 'Builder';
  } else if (counts.S === maxCount && counts.S >= counts.P && counts.S >= counts.B) {
    primary = 'Scaler';
  } else if (counts.P === maxCount) {
    primary = 'Prototyper';
  }

  // Check if senior/lead: consistently choosing complex tradeoff options (Q4, Q7, Q12)
  const complexQuestions = ['q4', 'q7', 'q12'];
  const complexAnswers = complexQuestions.map((q) => {
    const value = answers[q];
    if (questions && typeof value === 'number') {
      const questionNum = parseInt(q.substring(1));
      const question = questions[questionNum - 1];
      return question.answers[value].archetype as ArchetypeType;
    }
    return value as ArchetypeType;
  });
  const isScalerInComplex = complexAnswers.filter((a) => a === 'S').length >= 2;
  const isSenior = isScalerInComplex;

  const descriptions = {
    Prototyper:
      'rapid experimentation and sensing value. You excel at discovering what works quickly, prioritizing validation over perfection.',
    Builder:
      'architecting workflows and shipping production systems. You excel at building robust, scalable solutions that integrate seamlessly.',
    Scaler:
      'reliability, governance, and operational tradeoffs. You excel at maintaining sustainable systems with predictable costs and risk mitigation.',
  };

  return {
    primary,
    counts,
    isSenior,
    descriptions,
  };
}

export function encodeAnswersToUrl(answers: QuizAnswers, questions?: Question[]): string {
  const params = new URLSearchParams();
  for (let i = 1; i <= 12; i++) {
    const key = `q${i}`;
    if (answers[key] !== undefined) {
      const value = answers[key];
      // Store the archetype in URL for sharing (convert from index if needed)
      if (questions && typeof value === 'number') {
        const archetype = questions[i - 1].answers[value].archetype;
        params.set(key, archetype);
      } else {
        params.set(key, String(value));
      }
    }
  }
  return params.toString();
}

export function decodeAnswersFromUrl(queryString: string): QuizAnswers {
  const params = new URLSearchParams(queryString);
  const answers: QuizAnswers = {};

  for (let i = 1; i <= 12; i++) {
    const key = `q${i}`;
    const value = params.get(key);
    if (value && (value === 'P' || value === 'B' || value === 'S')) {
      answers[key] = value as ArchetypeType;
    }
  }

  return answers;
}

export function isQuizComplete(answers: QuizAnswers, questions?: Question[]): boolean {
  return Object.keys(answers).length === 12;
}
