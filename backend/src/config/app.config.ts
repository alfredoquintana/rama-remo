import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  authSecret: process.env.APP_SECRET,
  adminRut: process.env.ADMIN_RUT,
  adminPassword: process.env.ADMIN_PASSWORD,
  defaultUserPassword: process.env.DEFAULT_USER_PASSWORD,
  loginRateLimitWindowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 600_000),
  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX ?? 5),
  sensitiveRateLimitWindowMs: Number(
    process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS ?? 60_000,
  ),
  sensitiveRateLimitMax: Number(process.env.SENSITIVE_RATE_LIMIT_MAX ?? 20),
}));
