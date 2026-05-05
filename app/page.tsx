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
    if (questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const keyNum = parseInt(key);
      const currentQ = questions[currentQuestion];

      if (keyNum >= 1 && keyNum <= 6 && keyNum <= currentQ.answers.length) {
        handleAnswer(keyNum - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentQuestion, handleAnswer]);

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
        <div className="px-2 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-10">
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
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#16A085]"></span>
                  <span className="text-xs font-medium text-foreground truncate">Q{currentQuestion + 1}/{questions.length}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Progress: question ${currentQuestion + 1} of ${questions.length}`}>
                <div className="h-full rounded-full transition-all duration-500 ease-out bg-[#16A085]" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12">
        <div className="w-full max-w-2xl lg:max-w-4xl">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif font-normal leading-tight text-foreground">
              {question.question}
            </h1>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            {question.answers.map((answer, index) => {
              const isSelected = currentAnswer === index;
              const shortcutKey = index + 1;

              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#16A085] bg-[#f0fdfb]'
                      : 'border-border hover:border-[#16A085]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={isSelected}
                    onChange={() => handleAnswer(index)}
                    className="mt-1 w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                  <span className="flex-1 text-sm sm:text-base leading-relaxed">{answer.text}</span>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-xs text-secondary">Press</span>
                    <kbd className="bg-accent px-2 py-1 rounded text-xs font-semibold">{shortcutKey}</kbd>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 pt-6 sm:pt-8 border-t border-border">
            <div className="text-xs text-secondary text-center">
              Press <kbd className="bg-accent px-1.5 py-0.5 rounded text-xs">1</kbd>–<kbd className="bg-accent px-1.5 py-0.5 rounded text-xs">6</kbd> or click
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
