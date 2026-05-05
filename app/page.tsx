'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  decodeAnswersFromUrl,
  encodeAnswersToUrl,
  isQuizComplete,
} from '@/lib/scoring';
import { QuizAnswers, Question, QuestionsData, ArchetypeType } from '@/lib/types';

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      const response = await fetch('/questions.json');
      const data: QuestionsData = await response.json();
      setQuestions(data.questions);

      const urlAnswers = decodeAnswersFromUrl(searchParams.toString());
      setAnswers(urlAnswers);

      if (Object.keys(urlAnswers).length > 0) {
        setCurrentQuestion(Math.min(Object.keys(urlAnswers).length, data.questions.length - 1));
      }

      setLoading(false);
    }

    loadQuestions();
  }, [searchParams]);

  const handleAnswer = useCallback(
    (archetype: ArchetypeType) => {
      const newAnswers = {
        ...answers,
        [`q${currentQuestion + 1}`]: archetype,
      };
      setAnswers(newAnswers);

      if (isQuizComplete(newAnswers)) {
        const queryString = encodeAnswersToUrl(newAnswers);
        router.push(`/result?${queryString}`);
      }
    },
    [answers, currentQuestion, router]
  );

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'a') {
        handleAnswer('P');
      } else if (key === 'b') {
        handleAnswer('B');
      } else if (key === 'c') {
        handleAnswer('S');
      } else if (key === 'arrowright') {
        handleNext();
      } else if (key === 'arrowleft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, handleNext, handlePrevious]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Failed to load questions.</div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[`q${currentQuestion + 1}`];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">AI Archetype Assessment</h1>
              <div className="text-sm text-secondary">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>

            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            <div className="space-y-3">
              {question.answers.map((answer, index) => {
                const choices = ['A', 'B', 'C'];
                const archetypes = ['P', 'B', 'S'];
                const isSelected = currentAnswer === archetypes[index];

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(archetypes[index] as ArchetypeType)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 font-bold text-lg min-w-8">
                        {choices[index]}
                      </div>
                      <div className="flex-1">{answer.text}</div>
                      <div className="flex-shrink-0">
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-background" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-8 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-xs text-secondary">
                  {['A', 'B', 'C'][i]}
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1 || !currentAnswer}
              className="px-6 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              Next →
            </button>
          </div>

          <div className="text-xs text-secondary text-center mt-6">
            Use <kbd className="bg-accent px-2 py-1 rounded">A</kbd>
            <kbd className="bg-accent px-2 py-1 rounded ml-1">B</kbd>
            <kbd className="bg-accent px-2 py-1 rounded ml-1">C</kbd> to answer • Use arrow keys to
            navigate
          </div>
        </div>
      </div>
    </div>
  );
}
