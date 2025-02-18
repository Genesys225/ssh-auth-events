import type { Request, Response } from 'express';
import { desc, sql } from 'drizzle-orm';
import { sshEvents } from '../db/schema.ts';
import { db } from '../db/index.ts';
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

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
  raw_message: string;
  auth_method?: 'password' | 'publickey' | 'unknown';
}

// 🔹 Insert unique new FTS row
async function insertNewFtsRow(
  event: VectorLogEvent & { id: number | bigint }
) {
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
      eventEmitter.emit('newEvent', event);
      const sqliteTimestamp = new Date(event.ts)
        .getTime()
        .toString()
        .slice(0, -3);
      const compare = sql`
        ${sshEvents.rawMessage} = ${event.content}
        AND ${sshEvents.timestamp} = ${+sqliteTimestamp}
        AND ${sshEvents.username} = ${event.username}
      `;
      const existing = await db
        .select()
        .from(sshEvents)
        .where(compare)
        .limit(1);
      if (existing.length > 0) continue;
      const res = await db
        .insert(sshEvents)
        .values({
          timestamp: new Date(event.ts),
          eventType: event.event_type,
          username: event.username,
          hostname: event.hostname,
          ipAddress: event.ip_address,
          status: event.status,
          authMethod: event.auth_method,
          rawMessage: event.content,
          createdAt: new Date(),
        })
        .returning({ id: sshEvents.id });

      await insertNewFtsRow(Object.assign({ id: res[0].id }, event));
      const results = await analyzeLoginSource(event);
      if (results.isNewLoginSource || results.isSuspicious) {
        eventEmitter.emit('newSuspiciousEvent', {
          ...event,
          ...results
        });
      }
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
      db
        .select({ count: sql`count(*)` })
        .from(sshEvents)
        .where(sql`event_type = 'login' AND status = 'success'`),
      db
        .select({ count: sql`count(*)` })
        .from(sshEvents)
        .where(sql`event_type = 'login' AND status = 'failed'`),
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

    res.json({
      total: {
        loginSuccess: loginSuccess[0].count,
        loginFailed: loginFailed[0].count,
      },
      userStats,
    });
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
      JOIN ssh_events ON ssh_events_fts.rowid = ssh_events.id
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

// 🔹 Stream new events
export const streamEvents = (req: Request, res: Response) => {
  const listener = (event: VectorLogEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(
    `data: ${JSON.stringify({
      raw_message: 'Connected to event stream',
    })}\n\n`
  );

  eventEmitter.on('newEvent', listener);

  req.on('close', () => {
    eventEmitter.off('newEvent', listener);
    res.end();
  });
};

const analyzeLoginSource = async (event: VectorLogEvent) => {
  const MAX_RESULTS = 1000;
  const MAX_WINDOW = "30 days";

  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
      distinctUsers: sql<number>`COUNT(DISTINCT username)`,
      recentFailed: sql<number>`SUM(CASE WHEN status = 'failed' AND timestamp > datetime('now', '-1 hour') THEN 1 ELSE 0 END)`,
    })
    .from(sshEvents)
    .where(sql`
      ip_address = ${event.ip_address}
      AND timestamp > datetime('now', '-${MAX_WINDOW}') -- Restrict to last 30 days
    `)
    .limit(MAX_RESULTS); // Limit total scanned rows

  if (!result[0] || result[0].total === 0) return { isNewLoginSource: true, isSuspicious: false };

  const { total, failed, distinctUsers, recentFailed } = result[0];

  const failureRate = total > 0 ? failed / total : 0;
  const highRecentFailures = recentFailed > 3;

  return {
    isNewLoginSource: total < 10,
    isSuspicious:
      (total > 10 && failureRate > 0.5) || 
      (distinctUsers > 3 && failureRate > 0.4) || 
      highRecentFailures,
  };
};