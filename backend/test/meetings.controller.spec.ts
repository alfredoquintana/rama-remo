import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EstadoReunion, ModalidadReunion } from '../src/database/entities';
import { MeetingsController } from '../src/modules/meetings/meetings.controller';
import type { MeetingsService } from '../src/modules/meetings/meetings.service';

describe('MeetingsController', () => {
  it('passes the authenticated user id when creating a meeting', async () => {
    const payload = {
      fecha: '2026-04-22',
      horaInicio: '10:00',
      horaFin: '11:00',
      lugar: 'Sede',
      estado: EstadoReunion.PROGRAMADA,
      modalidad: ModalidadReunion.PRESENCIAL,
    } as Parameters<MeetingsController['create']>[1];
    const expected = { idReunion: 9, ...payload };
    const service = {
      create: async (receivedPayload: typeof payload, actorUserId: number) => {
        assert.deepEqual(receivedPayload, payload);
        assert.equal(actorUserId, 3);
        return expected;
      },
    };
    const controller = new MeetingsController(service as unknown as MeetingsService);
    const request = { user: { sub: 3 } } as Parameters<
      MeetingsController['create']
    >[0];

    assert.deepEqual(await controller.create(request, payload), expected);
  });

  it('passes route id and authenticated user id when updating a meeting', async () => {
    const payload = { lugar: 'Nuevo lugar' } as Parameters<
      MeetingsController['update']
    >[2];
    const expected = { idReunion: 4, lugar: 'Nuevo lugar' };
    const service = {
      update: async (
        id: number,
        receivedPayload: typeof payload,
        actorUserId: number,
      ) => {
        assert.equal(id, 4);
        assert.deepEqual(receivedPayload, payload);
        assert.equal(actorUserId, 8);
        return expected;
      },
    };
    const controller = new MeetingsController(service as unknown as MeetingsService);
    const request = { user: { sub: 8 } } as Parameters<
      MeetingsController['update']
    >[0];

    assert.deepEqual(await controller.update(request, 4, payload), expected);
  });
});
