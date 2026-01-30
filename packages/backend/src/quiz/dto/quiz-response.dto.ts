export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface GeneratedQuiz {
  questions: QuizQuestion[];
}