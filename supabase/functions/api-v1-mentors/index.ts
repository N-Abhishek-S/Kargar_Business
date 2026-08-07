// @ts-ignore: Deno import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore: Deno import
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
// @ts-ignore: Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

import { MentorRepository } from '../shared/repositories/mentorRepository.ts';
import { MentorService } from '../shared/services/mentorService.ts';
import { DomainError } from '../shared/errors/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CQRS Command Schema
const CommandSchema = z.object({
  command: z.enum(['APPROVE_MENTOR', 'SUSPEND_MENTOR']),
  payload: z.object({
    mentorId: z.string().uuid(),
    reason: z.string().optional()
  })
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore: Deno global
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno global
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Bypasses RLS to execute admin commands
    );

    const repo = new MentorRepository(supabaseClient);
    const service = new MentorService(repo);

    const rawBody = await req.json();
    const { command, payload } = CommandSchema.parse(rawBody);

    // Route to Service layer
    switch (command) {
      case 'APPROVE_MENTOR':
        await service.approveMentor(payload.mentorId);
        break;
      case 'SUSPEND_MENTOR':
        await service.suspendMentor(payload.mentorId, payload.reason ?? 'No reason provided');
        break;
      default:
        throw new Error('Unknown command');
    }

    return new Response(
      JSON.stringify({ success: true, command }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (unknownError: unknown) {
    let statusCode = 400;
    const error = unknownError as Error;
    
    // Map Domain Errors to HTTP Status Codes
    if (error instanceof DomainError) {
      statusCode = error.status;
    }

    console.error(JSON.stringify({ 
      event: 'api_error', 
      type: error.constructor?.name ?? 'Error',
      error: error.message 
    }));
    
    return new Response(
      JSON.stringify({ error: error instanceof z.ZodError ? (error as any).errors : error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusCode }
    );
  }
});
