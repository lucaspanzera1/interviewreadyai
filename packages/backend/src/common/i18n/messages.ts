/**
 * Backend translation messages.
 * Keys are organized by domain (user, quiz, interview, flashcard, token, plan, auth).
 */

const ptBR = {
  // ── User ──
  'user.notFound': 'Usuário não encontrado',
  'user.notFoundWithId': 'Usuário com ID {{id}} não encontrado',
  'user.fetchOrCreateError': 'Erro ao buscar ou criar usuário',
  'user.profileUpdated': 'Perfil atualizado com sucesso!',
  'user.profilePublicSet': 'Perfil público configurado com sucesso!',
  'user.profilePrivateSet': 'Perfil privado configurado com sucesso!',
  'user.updated': 'Usuário atualizado com sucesso!',
  'user.onboardingCompleted': 'Onboarding completado com sucesso!',
  'user.tokensAdded': '{{amount}} tokens adicionados com sucesso',
  'user.tokenAdded': '{{amount}} token adicionado com sucesso',
  'user.statusDescription': 'Módulo de gerenciamento de usuários',

  // ── Social ──
  'social.notFoundOrPrivate': 'Usuário não encontrado ou perfil privado',
  'social.cannotFollowSelf': 'Você não pode seguir a si mesmo',
  'social.alreadyFollowing': 'Você já está seguindo este usuário',
  'social.notFollowing': 'Você não está seguindo este usuário',
  'social.followed': 'Usuário seguido com sucesso',
  'social.unfollowed': 'Parou de seguir o usuário',

  // ── Quiz ──
  'quiz.dailyLimitReached': 'Você atingiu o limite diário de 3 quizzes gratuitos. Aguarde até amanhã ou compre tokens para continuar jogando.',
  'quiz.notAvailable': 'Este quiz não está disponível no momento.',
  'quiz.notEnoughTokens': 'Você não tem tokens suficientes para jogar este quiz. Compre tokens para continuar.',
  'quiz.generatedSuccess': 'Quiz gerado com sucesso! 1 token foi deduzido.',
  'quiz.errorGenerating': 'Erro ao gerar quiz. Tente novamente.',
  'quiz.jobTitleNotFound': 'Título da Vaga Não Encontrado',
  'quiz.companyNotFound': 'Empresa Não Encontrada',
  'quiz.locationNotFound': 'Localização Não Encontrada',
  'quiz.descriptionNotAvailable': 'Descrição não disponível',
  'quiz.categoryJobPosting': 'Vaga de Emprego',

  // ── Interview ──
  'interview.notSpecified': 'Não especificado',
  'interview.notSpecifiedFem': 'Não especificada',
  'interview.notAvailable': 'Não disponível',
  'interview.videosUploaded': '{{count}} vídeo(s) enviado(s) com sucesso. Análise será processada em breve.',
  'interview.analysisComingSoon': 'Análise detalhada será disponibilizada em breve',
  'interview.simulationParticipation': 'Participação na simulação',
  'interview.recordingCompleted': 'Completou a gravação',

  // ── Flashcard ──
  'flashcard.notAvailable': 'Este flashcard não está disponível no momento.',
  'flashcard.notEnoughTokens': 'Você não tem tokens suficientes para estudar este flashcard. Compre tokens para continuar.',
  'flashcard.notFound': 'Flashcard não encontrado',

  // ── Token / Packages ──
  'token.packageNotFound': 'Pacote não encontrado ou inativo',
  'token.userNotFound': 'Usuário não encontrado',
  'token.alreadyHasPlan': 'Você já possui o plano {{role}}. Válido até {{expiresAt}}.',
  'token.packageRedeemed': 'Pacote resgatado com sucesso! Você recebeu {{amount}} tokens.',
  'token.roleUpdated': 'Cargo atualizado para {{role}}.',
  'token.validUntil': 'Válido até {{date}}.',

  // ── Plans / Payment ──
  'plan.notFoundOrUnavailable': 'Plano não encontrado ou não disponível para compra',
  'plan.paymentConfigUnavailable': 'Configuração de pagamento não disponível',
  'plan.paymentError': 'Erro ao processar pagamento. Tente novamente.',
  'plan.cpfPhoneRequired': 'CPF e telefone são obrigatórios para realizar pagamentos',
  'plan.customerNotRegistered': 'Cliente não cadastrado na AbacatePay. Atualize seu perfil primeiro.',
  'plan.webhookAuthFailed': 'Autenticação do webhook falhou',

  // ── Auth ──
  'auth.logoutSuccess': 'Logout realizado com sucesso',

  // ── Email Subjects ──
  'email.welcomeSubject': 'Bem-vindo ao TreinaVagaAI! 🚀',
  'email.tokenAddedSubject': 'Tokens Adicionados à sua Conta - TreinaVagaAI 🎉',
  'email.planRedeemedSubject': 'Plano Resgatado com Sucesso - TreinaVagaAI 🎉',
} as const;

const en: Record<keyof typeof ptBR, string> = {
  // ── User ──
  'user.notFound': 'User not found',
  'user.notFoundWithId': 'User with ID {{id}} not found',
  'user.fetchOrCreateError': 'Error fetching or creating user',
  'user.profileUpdated': 'Profile updated successfully!',
  'user.profilePublicSet': 'Public profile configured successfully!',
  'user.profilePrivateSet': 'Private profile configured successfully!',
  'user.updated': 'User updated successfully!',
  'user.onboardingCompleted': 'Onboarding completed successfully!',
  'user.tokensAdded': '{{amount}} tokens added successfully',
  'user.tokenAdded': '{{amount}} token added successfully',
  'user.statusDescription': 'User management module',

  // ── Social ──
  'social.notFoundOrPrivate': 'User not found or profile is private',
  'social.cannotFollowSelf': 'You cannot follow yourself',
  'social.alreadyFollowing': 'You are already following this user',
  'social.notFollowing': 'You are not following this user',
  'social.followed': 'User followed successfully',
  'social.unfollowed': 'Unfollowed user',

  // ── Quiz ──
  'quiz.dailyLimitReached': 'You have reached the daily limit of 3 free quizzes. Wait until tomorrow or purchase tokens to continue.',
  'quiz.notAvailable': 'This quiz is not available at the moment.',
  'quiz.notEnoughTokens': 'You don\'t have enough tokens to play this quiz. Purchase tokens to continue.',
  'quiz.generatedSuccess': 'Quiz generated successfully! 1 token was deducted.',
  'quiz.errorGenerating': 'Error generating quiz. Please try again.',
  'quiz.jobTitleNotFound': 'Job Title Not Found',
  'quiz.companyNotFound': 'Company Not Found',
  'quiz.locationNotFound': 'Location Not Found',
  'quiz.descriptionNotAvailable': 'Description not available',
  'quiz.categoryJobPosting': 'Job Posting',

  // ── Interview ──
  'interview.notSpecified': 'Not specified',
  'interview.notSpecifiedFem': 'Not specified',
  'interview.notAvailable': 'Not available',
  'interview.videosUploaded': '{{count}} video(s) uploaded successfully. Analysis will be processed shortly.',
  'interview.analysisComingSoon': 'Detailed analysis will be available soon',
  'interview.simulationParticipation': 'Simulation participation',
  'interview.recordingCompleted': 'Recording completed',

  // ── Flashcard ──
  'flashcard.notAvailable': 'This flashcard is not available at the moment.',
  'flashcard.notEnoughTokens': 'You don\'t have enough tokens to study this flashcard. Purchase tokens to continue.',
  'flashcard.notFound': 'Flashcard not found',

  // ── Token / Packages ──
  'token.packageNotFound': 'Package not found or inactive',
  'token.userNotFound': 'User not found',
  'token.alreadyHasPlan': 'You already have the {{role}} plan. Valid until {{expiresAt}}.',
  'token.packageRedeemed': 'Package redeemed successfully! You received {{amount}} tokens.',
  'token.roleUpdated': 'Role updated to {{role}}.',
  'token.validUntil': 'Valid until {{date}}.',

  // ── Plans / Payment ──
  'plan.notFoundOrUnavailable': 'Plan not found or not available for purchase',
  'plan.paymentConfigUnavailable': 'Payment configuration not available',
  'plan.paymentError': 'Error processing payment. Please try again.',
  'plan.cpfPhoneRequired': 'Tax ID and phone number are required for payments',
  'plan.customerNotRegistered': 'Customer not registered with payment provider. Update your profile first.',
  'plan.webhookAuthFailed': 'Webhook authentication failed',

  // ── Auth ──
  'auth.logoutSuccess': 'Logout successful',

  // ── Email Subjects ──
  'email.welcomeSubject': 'Welcome to TreinaVagaAI! 🚀',
  'email.tokenAddedSubject': 'Tokens Added to Your Account - TreinaVagaAI 🎉',
  'email.planRedeemedSubject': 'Plan Redeemed Successfully - TreinaVagaAI 🎉',
};

export type TranslationMessages = { [K in keyof typeof ptBR]: string };
export type TranslationKey = keyof typeof ptBR;

export const messages: Record<string, Record<string, string>> = {
  'pt-BR': ptBR,
  en,
};
