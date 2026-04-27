import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthController } from '../src/modules/auth/auth.controller';
import type { AuthService } from '../src/modules/auth/auth.service';

describe('AuthController', () => {
  it('delegates login to the auth service', async () => {
    const payload = { rut: '12345678-5', password: 'secret' };
    const expected = { accessToken: 'token', user: { idUsuario: 1 } };
    const service = {
      login: async (receivedPayload: typeof payload) => {
        assert.deepEqual(receivedPayload, payload);
        return expected;
      },
    };
    const controller = new AuthController(service as unknown as AuthService);

    assert.deepEqual(await controller.login(payload), expected);
  });

  it('uses the authenticated user id for me', async () => {
    const expected = { idUsuario: 7, rut: '11111111-1', nombre: 'Demo' };
    const service = {
      me: async (userId: number) => {
        assert.equal(userId, 7);
        return expected;
      },
    };
    const controller = new AuthController(service as unknown as AuthService);
    const request = {
      user: { sub: 7, rut: '11111111-1', roles: ['admin'] },
    } as Parameters<AuthController['me']>[0];

    assert.deepEqual(await controller.me(request), expected);
  });
});
