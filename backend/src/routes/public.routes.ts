import { Router } from 'express';
import { getActiveClientLogos } from '../repositories/clientLogo.repository.js';
import { getActiveServices } from '../repositories/service.repository.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Public routes - no authentication required.
 * Serves public data that powers the frontend.
 */
export const publicRoutes = Router();

publicRoutes.get('/services', async (_req, res) => {
  const services = await getActiveServices();
  sendSuccess(res, services, 'Services retrieved');
});

publicRoutes.get('/client-logos', async (_req, res) => {
  const logos = await getActiveClientLogos();
  sendSuccess(res, logos, 'Client logos retrieved');
});

publicRoutes.get('/faq', (_req, res) => {
  sendSuccess(res, [], 'FAQ items retrieved');
});

publicRoutes.get('/stats', (_req, res) => {
  sendSuccess(
    res,
    {
      years: 10,
      sites: 50,
      employees: 2000,
      clients: 10000,
    },
    'Stats retrieved',
  );
});
