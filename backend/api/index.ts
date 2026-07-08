import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../src/index.js';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  app(req, res);
}

export { app };
