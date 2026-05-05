export type ArchetypeType = 'P' | 'B' | 'S';

export interface Answer {
  text: string;
  archetype: ArchetypeType;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export interface QuestionsData {
  questions: Question[];
}

export interface QuizAnswers {
  [key: string]: ArchetypeType;
}

export interface ArchetypeResult {
  primary: 'Prototyper' | 'Builder' | 'Scaler';
  counts: {
    P: number;
    B: number;
    S: number;
  };
  isSenior: boolean;
  descriptions: {
    Prototyper: string;
    Builder: string;
    Scaler: string;
  };
}
