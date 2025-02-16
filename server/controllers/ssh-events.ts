import type { Request, Response } from 'express';
import { desc, sql } from 'drizzle-orm';
import { sshEvents } from '../db/schema.ts';
import { db } from '../db/index.ts';

// Type for incoming Vector events
interface VectorLogEvent {
  ts: string;
  hostname: string;
  process: string;
  content: string;
  event_type: 'login' | 'logout';
  status: 'success' | 'failed';
  username: string;
  source_user: string;
  ip_address: string;
  auth_method?: 'password' | 'publickey' | 'unknown';
}

// 🔹 Insert unique new FTS row
async function insertNewFtsRow(event: VectorLogEvent & { id: number | bigint }) {

  const ftsQuery = sql`
    INSERT INTO ssh_events_fts (rowid, ip_address, username, hostname)
    VALUES (${event.id}, ${event.ip_address}, ${event.username}, ${event.hostname})
  `;
  await db.run(ftsQuery);
}

// 🔹 Insert SSH Events
export const logEvents = async (req: Request, res: Response) => {
  try {
    const events = req.body as VectorLogEvent[];
    for (const event of events) {
      if (!event.content) continue;

      const sqliteTimestamp = new Date(event.ts).getTime().toString().slice(0, -3);
      const compare = sql`
        ${sshEvents.rawMessage} = ${event.content}
        AND ${sshEvents.timestamp} = ${+sqliteTimestamp}
        AND ${sshEvents.username} = ${event.username}
      `;
      const existing = await db.select().from(sshEvents).where(compare).limit(1);
      if (existing.length > 0) continue;

      const res = await db.insert(sshEvents).values({
        timestamp: new Date(event.ts),
        eventType: event.event_type,
        username: event.username,
        hostname: event.hostname,
        ipAddress: event.ip_address,
        status: event.status,
        authMethod: event.auth_method,
        rawMessage: event.content,
        createdAt: new Date(),
      }).returning({ id: sshEvents.id });

      await insertNewFtsRow(Object.assign({ id: res[0].id }, event));
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing log event:', error);
    res.status(500).json({ error: 'Failed to process log event' });
  }
};

// 🔹 Retrieve SSH Events (Paginated)
export const getLogEvents = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const events = await db
      .select()
      .from(sshEvents)
      .orderBy(desc(sshEvents.timestamp))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: sql`count(*)` }).from(sshEvents);

    res.json({ events, total: total[0].count, limit, offset });
  } catch (error) {
    console.error('Error retrieving log events:', error);
    res.status(500).json({ error: 'Failed to retrieve log events' });
  }
};

// 🔹 Get SSH Event Statistics
export const getLogEventStats = async (req: Request, res: Response) => {
  try {
    const [loginSuccess, loginFailed, userStats] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(sshEvents).where(sql`event_type = 'login' AND status = 'success'`),
      db.select({ count: sql`count(*)` }).from(sshEvents).where(sql`event_type = 'login' AND status = 'failed'`),
      db
        .select({
          username: sshEvents.username,
          total: sql`count(*)`,
          failed: sql`sum(case when status = 'failed' then 1 else 0 end)`,
          success: sql`sum(case when status = 'success' then 1 else 0 end)`,
        })
        .from(sshEvents)
        .groupBy(sshEvents.username)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
    ]);

    res.json({ total: { loginSuccess: loginSuccess[0].count, loginFailed: loginFailed[0].count }, userStats });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
};

// 🔹 Search SSH Events using FTS
export const searchLogEvents = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const searchQuery = sql`
      SELECT ssh_events.*,
        CASE 
          WHEN highlight(ssh_events_fts, 0, '', '') = ssh_events_fts.ip_address THEN 'ipAddress'
          WHEN highlight(ssh_events_fts, 0, '', '') = ssh_events_fts.username THEN 'username'
          WHEN highlight(ssh_events_fts, 0, '', '') = ssh_events_fts.hostname THEN 'hostname'
          ELSE NULL
        END AS match_field
      FROM ssh_events_fts
      INNER JOIN ssh_events ON ssh_events_fts.rowid = ssh_events.id
      WHERE ssh_events_fts MATCH ${query}
      ORDER BY ssh_events.timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const results = await db.all(searchQuery);

    res.json({ results, query, limit, offset });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
};
