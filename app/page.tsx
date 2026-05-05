'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  decodeAnswersFromUrl,
  encodeAnswersToUrl,
  isQuizComplete,
} from '@/lib/scoring';
import { QuizAnswers, Question, QuestionsData } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      const response = await fetch('/questions.json');
      const data: QuestionsData = await response.json();
      setQuestions(data.questions);

      const urlAnswers = decodeAnswersFromUrl(searchParams.toString());
      setAnswers(urlAnswers);

      if (Object.keys(urlAnswers).length > 0) {
        setCurrentQuestion(Math.min(Object.keys(urlAnswers).length, data.questions.length - 1));
        setShowIntro(false);
      }

      setLoading(false);
    }

    loadQuestions();
  }, [searchParams]);

  // Reset keyboard focus when moving to a new question
  useEffect(() => {
    setFocusedIndex(-1);
    optionRefs.current = [];
  }, [currentQuestion]);

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      const newAnswers = {
        ...answers,
        [`q${currentQuestion + 1}`]: answerIndex,
      };
      setAnswers(newAnswers);

      if (isQuizComplete(newAnswers, questions)) {
        const queryString = encodeAnswersToUrl(newAnswers, questions);
        router.push(`/result?${queryString}`);
      } else if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
        }, 300);
      }
    },
    [answers, currentQuestion, questions, router]
  );

  useEffect(() => {
    if (questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIntro) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowIntro(false);
        }
        return;
      }

      const currentQ = questions[currentQuestion];
      const numAnswers = currentQ.answers.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = focusedIndex < numAnswers - 1 ? focusedIndex + 1 : 0;
        optionRefs.current[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = focusedIndex > 0 ? focusedIndex - 1 : numAnswers - 1;
        optionRefs.current[prev]?.focus();
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        handleAnswer(focusedIndex);
      } else {
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= 6 && keyNum <= numAnswers) {
          handleAnswer(keyNum - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentQuestion, handleAnswer, showIntro, focusedIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Failed to load questions.</div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
            <Link href="/" aria-label="Andela home">
              <img
                src="/andela_logo.svg"
                alt="Andela"
                width="96"
                height="25"
                className="w-[80px] sm:w-[110px] h-auto"
              />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
          <div className="w-full max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-border bg-accent text-xs font-medium text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" aria-hidden="true"></span>
              {questions.length} questions · Less than 5 minutes
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal leading-tight text-foreground mb-5">
              Discover your<br />AI Archetype
            </h1>

            <p className="text-sm sm:text-base text-secondary leading-relaxed mb-10 max-w-lg">
              Are you a <strong className="text-foreground">Prototyper</strong>,{' '}
              <strong className="text-foreground">Builder</strong>, or{' '}
              <strong className="text-foreground">Scaler</strong>? Answer {questions.length} questions
              about your technical instincts to reveal how you think about AI engineering.
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowIntro(false)}
                className="px-8 py-3 rounded-lg font-semibold text-white bg-[#16A085] hover:bg-[#138e73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A085] focus-visible:ring-offset-2 transition-colors text-sm sm:text-base"
              >
                Start Assessment
              </button>
              <span className="text-xs text-secondary hidden sm:block" aria-hidden="true">
                Press <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">Enter</kbd> to begin
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[`q${currentQuestion + 1}`];
  const questionId = `question-${currentQuestion}`;
  const hintId = `key-hint-${currentQuestion}`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="px-2 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" aria-label="Andela home" className="flex-shrink-0">
              <img
                src="/andela_logo.svg"
                alt="Andela"
                width="96"
                height="25"
                className="w-[80px] sm:w-[110px] h-auto"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#16A085]" aria-hidden="true"></span>
                <span className="text-xs font-medium text-foreground" aria-hidden="true">
                  Q{currentQuestion + 1}/{questions.length}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-border overflow-hidden"
                role="progressbar"
                aria-valuenow={currentQuestion + 1}
                aria-valuemin={1}
                aria-valuemax={questions.length}
                aria-label={`Question ${currentQuestion + 1} of ${questions.length}`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-[#16A085]"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12">
        <div className="w-full max-w-2xl lg:max-w-4xl">
          <div className="mb-6 sm:mb-10">
            <h1
              id={questionId}
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal leading-tight text-foreground"
            >
              {question.question}
            </h1>
          </div>

          <div
            role="radiogroup"
            aria-labelledby={questionId}
            aria-describedby={hintId}
            className="space-y-3 sm:space-y-4 mb-8 sm:mb-12"
          >
            {question.answers.map((answer, index) => {
              const isSelected = currentAnswer === index;
              const isFocused = focusedIndex === index;

              return (
                <label
                  key={index}
                  className={[
                    'flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-[#16A085] bg-[#f0fdfb] dark:bg-[#0d2e28]'
                      : 'border-border hover:border-[#16A085]',
                    isFocused && !isSelected
                      ? 'ring-2 ring-[#16A085]/50 ring-offset-1'
                      : '',
                    isFocused && isSelected
                      ? 'ring-2 ring-[#16A085]/50 ring-offset-1'
                      : '',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={isSelected}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    onChange={() => handleAnswer(index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    className="mt-1 w-5 h-5 cursor-pointer flex-shrink-0 focus-visible:outline-none accent-[#16A085]"
                    aria-label={answer.text}
                  />
                  <span className="flex-1 text-sm sm:text-base leading-relaxed">{answer.text}</span>
                  <div className="flex items-center gap-1.5 ml-4 flex-shrink-0" aria-hidden="true">
                    <kbd className="bg-accent border border-border px-2 py-1 rounded text-xs font-semibold">{index + 1}</kbd>
                  </div>
                </label>
              );
            })}
          </div>

          <div
            id={hintId}
            className="flex items-center justify-center gap-4 pt-6 sm:pt-8 border-t border-border"
            aria-label="Keyboard shortcuts: press 1 through 6 to answer, up and down arrow keys to navigate choices, Enter to confirm"
          >
            <p className="text-xs text-secondary text-center" aria-hidden="true">
              Press{' '}
              <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">1</kbd>–
              <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">6</kbd>{' '}
              to answer &nbsp;·&nbsp;{' '}
              <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">↑</kbd>{' '}
              <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">↓</kbd>{' '}
              to navigate &nbsp;·&nbsp;{' '}
              <kbd className="bg-accent border border-border px-1.5 py-0.5 rounded text-xs">Enter</kbd>{' '}
              to confirm
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-lg text-foreground">Loading...</div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
