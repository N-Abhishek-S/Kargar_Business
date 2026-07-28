/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchMentorsQuery, SearchMentorsResponse } from './types';
import { mapHttpErrorToUIError } from './errors';

export class MentorClient {
  constructor(private supabase: SupabaseClient) {}

  /**
   * QUERY: Search Mentors (Via Postgres RPC)
   */
  async searchMentors(query: SearchMentorsQuery): Promise<SearchMentorsResponse> {
    const { data, error } = await this.supabase.rpc('search_mentors', {
      search_query: query.search,
      page_number: query.page,
      page_size: query.pageSize
    });

    if (error) throw mapHttpErrorToUIError(500, error.message);
    return data as SearchMentorsResponse;
  }

  /**
   * COMMAND: Approve Mentor (Via Edge Function)
   */
  async approveMentor(mentorId: string): Promise<void> {
    const { error } = await this.supabase.functions.invoke('api-v1-mentors', {
      body: {
        command: 'APPROVE_MENTOR',
        payload: { mentorId }
      }
    });

    if (error) {
      // Supabase Edge Function errors wrap the underlying fetch Response
      const status = error.context?.status || 500;
      const message = await error.context?.json().then((j: any) => j.error).catch(() => error.message);
      throw mapHttpErrorToUIError(status, message);
    }
  }

  /**
   * COMMAND: Suspend Mentor (Via Edge Function)
   */
  async suspendMentor(mentorId: string, reason: string): Promise<void> {
    const { error } = await this.supabase.functions.invoke('api-v1-mentors', {
      body: {
        command: 'SUSPEND_MENTOR',
        payload: { mentorId, reason }
      }
    });

    if (error) {
      const status = error.context?.status || 500;
      const message = await error.context?.json().then((j: any) => j.error).catch(() => error.message);
      throw mapHttpErrorToUIError(status, message);
    }
  }
}
