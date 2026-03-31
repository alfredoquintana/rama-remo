import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  authSecret: process.env.APP_SECRET ?? 'rama-remo-dev-secret',
  adminRut: process.env.ADMIN_RUT ?? '11111111-1',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  defaultUserPassword: process.env.DEFAULT_USER_PASSWORD ?? 'remo1234',
}));
