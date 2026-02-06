export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'company_specific';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string; // Dicas para responder a pergunta
  keywords?: string[]; // Palavras-chave que devem ser mencionadas
}

export interface GeneratedInterview {
  interviewId?: string;
  jobTitle: string;
  companyName: string;
  questions: InterviewQuestion[];
  estimatedDuration: number; // em minutos
  preparationTips: string[];
  jobRequirements: string[];
  companyInfo?: string;
}

export interface InterviewAttemptDto {
  userAnswers: string[];
  actualDuration: number; // tempo que o usuário levou
  difficultyRating: number; // de 1 a 5
  feedback?: string; // feedback opcional do usuário
}