import { MentorRepository } from '../repositories/mentorRepository.ts';
import { EventDispatcher, createEvent } from '../events/index.ts';
import { ProfileIncompleteError } from '../errors/index.ts';

export class MentorService {
  constructor(private repo: MentorRepository) {}

  /**
   * Domain Command: Approve Mentor
   * Invariant: A mentor cannot become Approved unless profile is complete and documents exist.
   */
  async approveMentor(mentorId: string): Promise<void> {
    // 1. Fetch current state
    const mentor = await this.repo.getMentorById(mentorId);

    // 2. Evaluate Invariants
    if (!mentor.headline || !mentor.bio) {
      throw new ProfileIncompleteError(['headline', 'bio']);
    }

    const docCount = await this.repo.getDocumentVerificationCount(mentorId);
    if (docCount === 0) {
      throw new ProfileIncompleteError(['identity_document']);
    }

    // 3. Execute Transaction / Update
    await this.repo.updateMentorStatus(mentorId, 'approved');

    // 4. Dispatch Domain Event
    await EventDispatcher.dispatch(createEvent('MentorApproved', { mentorId }));
  }

  /**
   * Domain Command: Suspend Mentor
   */
  async suspendMentor(mentorId: string, reason: string): Promise<void> {
    await this.repo.updateMentorStatus(mentorId, 'suspended');
    
    await EventDispatcher.dispatch(createEvent('MentorSuspended', { 
      mentorId, 
      reason 
    }));
  }
}
