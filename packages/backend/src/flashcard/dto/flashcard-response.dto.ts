import { FlashcardLevel, FlashcardItem } from '../schemas/flashcard.schema';

export class GeneratedFlashcard {
  titulo: string;
  categoria: string;
  descricao: string;
  tags: string[];
  quantidade_cards: number;
  nivel: FlashcardLevel;
  cards: FlashcardItem[];
  flashcardId?: string; // ID do flashcard salvo no banco
  
  // Dados da vaga (se baseado em job)
  vaga_titulo?: string;
  vaga_empresa?: string;
  vaga_localizacao?: string;
  vaga_url?: string;
}