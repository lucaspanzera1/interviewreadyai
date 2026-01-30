import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resposta de erro padronizada
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de status HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Tipo do erro',
    example: 'BadRequest',
  })
  error: string;

  @ApiProperty({
    description: 'Timestamp do erro',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Caminho da requisição que gerou o erro',
    example: '/api/users/profile',
  })
  path: string;

  @ApiProperty({
    description: 'Código específico do erro',
    example: 'VALIDATION_FAILED',
    required: false,
  })
  errorCode?: string;

  @ApiProperty({
    description: 'Detalhes dos erros de validação',
    type: [String],
    required: false,
    example: ['name should not be empty', 'email must be a valid email'],
  })
  validationErrors?: string[];
}

/**
 * DTO para erro de autenticação (401)
 */
export class UnauthorizedErrorDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Authentication failed' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users/profile' })
  path: string;

  @ApiProperty({ example: 'INVALID_TOKEN' })
  errorCode?: string;
}

/**
 * DTO para erro de acesso negado (403)
 */
export class ForbiddenErrorDto {
  @ApiProperty({ example: 403 })
  statusCode: number;

  @ApiProperty({ example: 'Access denied' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/admin/users' })
  path: string;

  @ApiProperty({ example: 'INSUFFICIENT_PERMISSIONS' })
  errorCode?: string;
}

/**
 * DTO para erro de recurso não encontrado (404)
 */
export class NotFoundErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'User not found' })
  message: string;

  @ApiProperty({ example: 'NotFound' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users/123' })
  path: string;

  @ApiProperty({ example: 'USER_NOT_FOUND' })
  errorCode?: string;
}

/**
 * DTO para erro de validação (400)
 */
export class ValidationErrorDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'BadRequest' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users/profile' })
  path: string;

  @ApiProperty({ example: 'VALIDATION_FAILED' })
  errorCode?: string;

  @ApiProperty({
    type: [String],
    example: ['name should not be empty', 'email must be a valid email'],
  })
  validationErrors?: string[];
}