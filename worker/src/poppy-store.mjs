// D1 storage for the Poppy conversation endpoint (tables in migrations/0005_poppy.sql).

const insert = (db, table, row) => {
  const keys = Object.keys(row);
  return db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`)
    .bind(...keys.map((k) => row[k]));
};

export function d1Store(db) {
  return {
    getRequest(clientId, userHash, requestId) {
      return db.prepare('SELECT path, body_hash, conversation_id, status FROM poppy_requests '
        + 'WHERE client_id = ? AND user_hash = ? AND request_id = ?').bind(clientId, userHash, requestId).first();
    },

    getConversation(id) {
      return db.prepare('SELECT id, client_id, user_hash, closed FROM poppy_conversations WHERE id = ?').bind(id).first();
    },

    async listEvents(conversationId) {
      const { results } = await db.prepare('SELECT body FROM poppy_events WHERE conversation_id = ? ORDER BY seq')
        .bind(conversationId).all();
      return results.map((row) => JSON.parse(row.body));
    },

    /** One batch (a transaction in D1): new conversation, events, close flag, request id. */
    async commit({
      conversation, conversationId, events = [], close = false, request,
    }) {
      const statements = [];
      if (conversation) statements.push(insert(db, 'poppy_conversations', conversation));
      events.forEach((e) => statements.push(insert(db, 'poppy_events', {
        conversation_id: conversationId, id: e.id, ts: e.created_at, type: e.type, body: JSON.stringify(e),
      })));
      if (close) statements.push(db.prepare('UPDATE poppy_conversations SET closed = 1 WHERE id = ?').bind(conversationId));
      if (request) statements.push(insert(db, 'poppy_requests', request));
      if (statements.length) await db.batch(statements);
    },
  };
}
