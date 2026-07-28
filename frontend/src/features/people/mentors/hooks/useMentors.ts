import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase/client';
import { MentorClient } from '../../sdk/v1/MentorClient';
import type { SearchMentorsQuery } from '../../sdk/v1/types';

export function useMentorClient() {
  return new MentorClient(supabase);
}

/**
 * QUERY: Search Mentors
 */
export function useSearchMentors(query: SearchMentorsQuery) {
  const client = useMentorClient();
  
  return useQuery({
    queryKey: ['mentors', 'search', query],
    queryFn: () => client.searchMentors(query),
  });
}

/**
 * COMMAND: Approve Mentor
 */
export function useApproveMentor() {
  const client = useMentorClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mentorId: string) => client.approveMentor(mentorId),
    onSuccess: () => {
      // Invalidate both search queries and specific detail queries
      void queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}
