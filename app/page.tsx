'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
      } else if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
        }, 300);
      }
    },
    [answers, currentQuestion, questions.length, router]
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
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">Question {currentQuestion + 1} of {questions.length}</span>
                </div>
                <span className="text-xs text-secondary flex-shrink-0 ml-3">{currentQuestion + 1}/{questions.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin="1" aria-valuemax={questions.length} aria-label={`Progress: question ${currentQuestion + 1} of ${questions.length}`}>
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-[#16A085]" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight text-foreground">
              {question.question}
            </h1>
          </div>

          <div className="space-y-4 mb-12">
            {question.answers.map((answer, index) => {
              const archetypes = ['P', 'B', 'S'];
              const keys = ['A', 'B', 'C'];
              const isSelected = currentAnswer === archetypes[index];

              return (
                <label
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#16A085] bg-[#f0fdfb]'
                      : 'border-border hover:border-[#16A085]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={archetypes[index]}
                    checked={isSelected}
                    onChange={() => handleAnswer(archetypes[index] as ArchetypeType)}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                  <span className="flex-1 text-base leading-relaxed">{answer.text}</span>
                  <div className="hidden md:flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-xs text-secondary">Press</span>
                    <kbd className="bg-accent px-2 py-1 rounded text-xs font-semibold">{keys[index]}</kbd>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 pt-8 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1 px-6 py-3 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors font-medium"
            >
              Back
            </button>

            <div className="hidden md:block text-xs text-secondary">
              Use <kbd className="bg-accent px-2 py-1 rounded">A</kbd>
              <kbd className="bg-accent px-2 py-1 rounded ml-1">B</kbd>
              <kbd className="bg-accent px-2 py-1 rounded ml-1">C</kbd>
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1 || !currentAnswer}
              className="flex-1 px-6 py-3 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
