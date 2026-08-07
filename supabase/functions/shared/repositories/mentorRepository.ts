import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export class MentorRepository {
  private db: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.db = client;
  }

  async getMentorById(mentorId: string) {
    const { data, error } = await this.db
      .from('mentor_profiles')
      .select('*')
      .eq('id', mentorId)
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  async updateMentorStatus(mentorId: string, status: string) {
    const { error } = await this.db
      .from('mentor_profiles')
      .update({ status })
      .eq('id', mentorId);

    if (error) throw new Error(`Failed to update status: ${error.message}`);
  }

  async getDocumentVerificationCount(mentorId: string): Promise<number> {
    const { count, error } = await this.db
      .from('mentor_documents')
      .select('*', { count: 'exact', head: true })
      .eq('mentor_id', mentorId);
      
    if (error) throw new Error(error.message);
    return count || 0;
  }
}
