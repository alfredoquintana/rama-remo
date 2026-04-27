import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UsersController } from '../src/modules/users/users.controller';
import type { UsersService } from '../src/modules/users/users.service';

describe('UsersController', () => {
  it('passes list query options to the users service', async () => {
    const query = { page: 2, pageSize: 10, search: 'admin' } as Parameters<
      UsersController['findAll']
    >[0];
    const expected = { items: [], page: 2, pageSize: 10, total: 0, totalPages: 1 };
    const service = {
      findAll: async (receivedQuery: typeof query) => {
        assert.deepEqual(receivedQuery, query);
        return expected;
      },
    };
    const controller = new UsersController(service as unknown as UsersService);

    assert.deepEqual(await controller.findAll(query), expected);
  });

  it('uses the route id when enabling access', async () => {
    const payload = { roleIds: [1, 2] } as Parameters<
      UsersController['enableAccess']
    >[1];
    const expected = { idUsuario: 5, provisionalPassword: 'temporary' };
    const service = {
      enableAccess: async (id: number, receivedPayload: typeof payload) => {
        assert.equal(id, 5);
        assert.deepEqual(receivedPayload, payload);
        return expected;
      },
    };
    const controller = new UsersController(service as unknown as UsersService);

    assert.deepEqual(await controller.enableAccess(5, payload), expected);
  });
});
