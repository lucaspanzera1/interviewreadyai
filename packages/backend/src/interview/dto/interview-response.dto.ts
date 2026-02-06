export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'company_specific';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string; // Dicas para responder a pergunta
  keywords?: string[]; // Palavras-chave que devem ser mencionadas
  maxDuration?: number; // tempo máximo sugerido em segundos
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

// Remove duplicate types - using schema classes instead

export interface InterviewAttemptDto {
  userAnswers?: string[]; // Opcional agora, já que temos vídeo
  actualDuration: number; // tempo que o usuário levou
  difficultyRating: number; // de 1 a 5
  feedback?: string; // feedback opcional do usuário
  // Novos campos para vídeo
  hasVideo?: boolean;
  videoPath?: string; // caminho do arquivo de vídeo
}

export interface VideoInterviewAttemptDto {
  actualDuration: number;
  difficultyRating: number;
  feedback?: string;
  videoFile: Express.Multer.File; // arquivo de vídeo enviado
}