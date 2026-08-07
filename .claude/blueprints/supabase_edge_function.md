---
id: bp_supabase_edge_function
version: 1.0.0
owner: AI_Architect
category: Blueprint
depends_on: [standard_supabase, standard_observability]
---

# Blueprint: Supabase Edge Function

## Purpose
Deploy a secure, Deno-based serverless function with built-in CORS handling, Zod validation, and structured error responses.

## When to use
For secure third-party integrations (Stripe, Resend) or heavy computational tasks that cannot run safely on the client or via Postgres RPC.

## Inputs
- `Function Name`
- `Request Payload Schema`

## Outputs
- `supabase/functions/[function-name]/index.ts`

## Related Standards & Skills
- **Standards:** [supabase.md](../standards/supabase.md), [observability.md](../standards/observability.md)
- **Skills:** [supabase_edge_function.md](../skills/supabase_edge_function.md)
- **Commands:** `/edge-function`

## Validation Checklist
- [ ] Zod schema is strictly defined.
- [ ] CORS headers are applied to the `OPTIONS` request.
- [ ] No raw `console.log()` without structured context.

## Expected Generated Files

### 1. `supabase/functions/[function-name]/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RequestSchema = z.object({
  action: z.string().min(1),
  payload: z.record(z.unknown())
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.json();
    const validatedData = RequestSchema.parse(rawBody);

    // Business Logic Execution
    console.info(JSON.stringify({ event: 'function_executed', action: validatedData.action }));

    return new Response(
      JSON.stringify({ success: true, data: validatedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error(JSON.stringify({ event: 'function_error', error: error.message }));
    
    return new Response(
      JSON.stringify({ error: error instanceof z.ZodError ? error.errors : error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
```
