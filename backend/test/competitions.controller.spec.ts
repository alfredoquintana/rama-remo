import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EstadoCompetencia,
  EstadoInscripcionCompetencia,
  TipoCompetencia,
} from '../src/database/entities';
import { CompetitionsController } from '../src/modules/competitions/competitions.controller';
import type { CompetitionsService } from '../src/modules/competitions/competitions.service';

describe('CompetitionsController', () => {
  it('creates a competition through the competitions service', async () => {
    const payload = {
      nombre: 'Regata local',
      tipoCompetencia: TipoCompetencia.REGATA,
      fechaInicio: '2026-04-22',
      fechaFin: '2026-04-23',
      estado: EstadoCompetencia.BORRADOR,
    } as Parameters<CompetitionsController['create']>[0];
    const expected = { idCompetencia: 2, ...payload };
    const service = {
      create: async (receivedPayload: typeof payload) => {
        assert.deepEqual(receivedPayload, payload);
        return expected;
      },
    };
    const controller = new CompetitionsController(
      service as unknown as CompetitionsService,
    );

    assert.deepEqual(await controller.create(payload), expected);
  });

  it('updates a test registration through the route test id', async () => {
    const payload = {
      estado: EstadoInscripcionCompetencia.PRESUNTIVA,
      idBote: 12,
      integrantes: [],
    } as Parameters<CompetitionsController['updateRegistration']>[1];
    const expected = { idCompetencia: 2, pruebas: [] };
    const service = {
      updateRegistration: async (testId: number, receivedPayload: typeof payload) => {
        assert.equal(testId, 15);
        assert.deepEqual(receivedPayload, payload);
        return expected;
      },
    };
    const controller = new CompetitionsController(
      service as unknown as CompetitionsService,
    );

    assert.deepEqual(await controller.updateRegistration(15, payload), expected);
  });
});
