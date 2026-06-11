import type { NextFunction, Request, Response } from 'express';

/**
 * Kantaluokka kaikille odotetuille virheille. Servicet heittävät näitä;
 * alla oleva middleware muuntaa ne HTTP-vastauksiksi. Odottamattomat virheet
 * putoavat läpi 500-vastauksina ilman domain-virhekoodia.
 */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, details?: unknown) {
    super('NOT_FOUND', message, 404, details);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

/** Muodoltaan kelvollinen pyyntö, joka rikkoo agronomista tai suunnittelusääntöä. */
export class RuleViolationError extends DomainError {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, 422, details);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof DomainError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details ?? null },
    });
    return;
  }
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Odottamaton palvelinvirhe', details: null },
  });
}
