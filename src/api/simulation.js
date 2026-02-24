/**
 * src/api/simulation.js
 * Simulation domain API.
 *
 * Exports:
 *   createSimulation(payload, { signal }?)  → { jobId: number }
 *   fetchSimulation(simulationId, { signal }?)
 */

import { apiPostLong, apiGet } from './client';

/**
 * POST /simulations
 * Starts a simulation job and returns the job ID.
 * Uses long timeout (180s) because simulation is a heavy background task.
 *
 * Key defence: backend may return jobId or job_id.
 *
 * @param {{ store_source_id?: string, selected_strategy_ids?: string[], days?: number }} payload
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ jobId: number }>}
 */
export async function createSimulation(payload, { signal } = {}) {
  const resp = await apiPostLong('/simulations', payload, { signal });

  const rawJobId = resp?.jobId ?? resp?.job_id;
  if (rawJobId == null) {
    const err = new Error('jobId를 받지 못했습니다.');
    err.code = 'JOB_ID_MISSING';
    throw err;
  }

  return { jobId: Number(rawJobId) };
}

/**
 * GET /simulations/{id}
 * Fetches the result of a completed simulation.
 *
 * @param {number} simulationId
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchSimulation(simulationId, { signal } = {}) {
  return apiGet(`/simulations/${simulationId}`, { signal });
}
