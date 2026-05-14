import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findingsApi, drugsApi, auditApi, searchesApi } from '../api/client';

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API Client - Findings', () => {
  it('should list pending findings', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: '1', adverse_reaction: 'Mialgia', status: 'pending' },
      ],
    });

    const result = await findingsApi.listPending(0, 50);
    expect(result).toHaveLength(1);
    expect(result[0].adverse_reaction).toBe('Mialgia');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/findings/pending'),
      expect.any(Object)
    );
  });

  it('should get a single finding', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', adverse_reaction: 'Mialgia' }),
    });

    const result = await findingsApi.get('1');
    expect(result.id).toBe('1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/findings/1'),
      expect.any(Object)
    );
  });

  it('should approve a finding', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', status: 'approved' }),
    });

    const result = await findingsApi.approve('1', 'Looks good');
    expect(result.status).toBe('approved');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/findings/1/approve'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should reject a finding', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', status: 'rejected' }),
    });

    const result = await findingsApi.reject('1', 'False positive');
    expect(result.status).toBe('rejected');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/findings/1/reject'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should add a comment to a finding', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', comment: 'This needs review' }),
    });

    const result = await findingsApi.addComment('1', 'This needs review');
    expect(result.comment).toBe('This needs review');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/findings/1/comment'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should handle API errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Finding not found' }),
    });

    await expect(findingsApi.get('nonexistent')).rejects.toThrow('Finding not found');
  });
});

describe('API Client - Drugs', () => {
  it('should list drugs', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: '1', active_ingredient: 'Atorvastatina' },
      ],
    });

    const result = await drugsApi.list();
    expect(result).toHaveLength(1);
    expect(result[0].active_ingredient).toBe('Atorvastatina');
  });

  it('should get a single drug', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', active_ingredient: 'Metformina' }),
    });

    const result = await drugsApi.get('1');
    expect(result.active_ingredient).toBe('Metformina');
  });
});

describe('API Client - Audit Logs', () => {
  it('should list audit logs', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: '1', action: 'approve', timestamp: '2026-05-14T10:00:00Z' },
      ],
    });

    const result = await auditApi.list(0, 100);
    expect(result).toHaveLength(1);
    expect(result[0].action).toBe('approve');
  });

  it('should get audit trail for a record', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        record_id: '1',
        changes: [{ action: 'insert', timestamp: '2026-05-14T10:00:00Z' }],
      }),
    });

    const result = await auditApi.getForRecord('1');
    expect(result.record_id).toBe('1');
    expect(result.changes).toHaveLength(1);
  });
});

describe('API Client - Searches', () => {
  it('should trigger a search', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'search_queued', drug_id: '1' }),
    });

    const result = await searchesApi.trigger('1');
    expect(result.status).toBe('search_queued');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/searches/1/trigger'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should schedule a search', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'scheduled', frequency: 'weekly' }),
    });

    const result = await searchesApi.schedule('1', 'weekly');
    expect(result.status).toBe('scheduled');
    expect(result.frequency).toBe('weekly');
  });
});

describe('API Client - Base URL', () => {
  it('should use correct API base URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await findingsApi.listPending();
    const callUrl = global.fetch.mock.calls[0][0];
    expect(callUrl).toContain('/api/v1');
  });

  it('should handle Content-Type header correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await findingsApi.approve('1', 'test');
    const callHeaders = global.fetch.mock.calls[0][1].headers;
    expect(callHeaders['Content-Type']).toBe('application/json');
  });
});
