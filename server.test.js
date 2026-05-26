// ============================================================
//  TaskFlow — Backend Tests
//  File: server.test.js
//  Run: npm test
// ============================================================
const request = require('supertest');
const app     = require('./server');

describe('GET /api/tasks', () => {
  it('returns list of tasks with success: true', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters by done=false', async () => {
    const res = await request(app).get('/api/tasks?done=false');
    expect(res.status).toBe(200);
    res.body.data.forEach(t => expect(t.done).toBe(false));
  });
});

describe('POST /api/tasks', () => {
  it('creates a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ text: 'Test task', priority: 'low' });
    expect(res.status).toBe(201);
    expect(res.body.data.text).toBe('Test task');
    expect(res.body.data.done).toBe(false);
  });

  it('returns 400 when text is missing', async () => {
    const res = await request(app).post('/api/tasks').send({ priority: 'high' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid priority', async () => {
    const res = await request(app).post('/api/tasks').send({ text: 'X', priority: 'ultra' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('toggles done status', async () => {
    const res = await request(app).patch('/api/tasks/1').send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.data.done).toBe(true);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes existing task', async () => {
    const res = await request(app).delete('/api/tasks/2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
