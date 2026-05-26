import rateLimit from 'express-rate-limit';
import { env } from '../../infrastructure/config/env';

const rateLimitMessage = (max: number, windowMs: number) => ({
  error: `Demasiadas solicitudes. Máximo ${max} por ${windowMs / 1000} segundos. Intenta más tarde.`,
});

// En DEMO_MODE los límites son bajos para poder demostrar el 429 en clase.
// Producción usa los valores de las variables de entorno (o los defaults).
const globalMax = env.DEMO_MODE ? 10 : env.RATE_LIMIT_GLOBAL_MAX;
const authMax   = env.DEMO_MODE ? 5  : env.RATE_LIMIT_AUTH_MAX;
const windowMs  = env.DEMO_MODE ? 10_000 : env.RATE_LIMIT_WINDOW_MS;

// Límite general para toda la API
export const globalLimiter = rateLimit({
  windowMs,
  max: globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(globalMax, windowMs),
});

// Límite estricto para auth — previene fuerza bruta en login/register
export const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(authMax, windowMs),
});
