export type ApiErrorCodigo =
  | 'VALIDACION'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'JSON_INVALIDO'
  | 'ERROR_INTERNO'
  | 'RED'
  | 'DESCONOCIDO';

export interface ApiErrorDetalle {
  campo?: string;
  mensaje: string;
}

export interface ApiError {
  codigo: ApiErrorCodigo;
  mensaje: string;
  detalles: ApiErrorDetalle[];
  status: number;
}

export function isValidationError(error: ApiError): boolean {
  return error.codigo === 'VALIDACION';
}

export function isConflictError(error: ApiError): boolean {
  return error.codigo === 'CONFLICTO';
}

export function isNotFoundError(error: ApiError): boolean {
  return error.codigo === 'NO_ENCONTRADO';
}
