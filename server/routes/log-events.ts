import express from 'express';
import {
  logEvents,
  getLogEvents,
  getLogEventStats,
  searchLogEvents,
} from '../controllers/ssh-events.ts';

const router = express.Router();

// POST 🔹 Log SSH Events
router.post('/log-events', logEvents);
// GET 🔹 Retrieve SSH Events (Paginated)
router.get('/log-events', getLogEvents);
// GET 🔹 Get SSH Event Statistics
router.get('/log-events/stats', getLogEventStats);
// GET 🔹 Search SSH Events using FTS
router.get('/log-events/search', searchLogEvents);

export default router;